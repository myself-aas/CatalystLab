#!/usr/bin/env python3
"""Codemod: migrate Unsplash image URLs to Pexels and keep image sizing sane.

Replaces ``images.unsplash.com/photo-...`` URLs in source files with curated
Pexels equivalents, and repairs already-migrated Pexels avatar URLs that carry
hero-sized query params.

Design rules (each addresses a failure mode of the original one-off script):

- Deterministic: a given source URL always maps to the same Pexels URL
  (md5-indexed pick), so re-runs are idempotent and the same image referenced
  from multiple files stays visually consistent.
- Avatar-aware: URLs in an avatar-ish context (``authorAvatar``, ``U_FACE``,
  ``rounded-full``, ...) get a square face crop; content images keep a width
  bucket derived from the source URL instead of a hardcoded 1260x750.
- Repair pass: Pexels avatar URLs that already carry hero sizing are re-cropped
  to the square avatar size.
- Safe: ``--dry-run`` / ``--check`` modes, writes only files that actually
  changed, preserves line endings byte-for-byte, skips vendor dirs and
  ``*.d.ts``.

Note on concurrency: file I/O here is local and page-cached across a few
hundred small files, so the run is synchronous on purpose -- asyncio would add
complexity without a measurable win for a disk-bound batch rewrite.

Usage:
    python3 scripts/replace_images.py             # migrate in place
    python3 scripts/replace_images.py --dry-run   # preview changes without writing
    python3 scripts/replace_images.py --check     # exit 1 if anything would change (CI)
"""

from __future__ import annotations

import argparse
import hashlib
import logging
import re
import sys
from collections.abc import Iterator, Sequence
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

# --- Replacement pools (curated, verified-live Pexels photo IDs) -------------

PEXELS_CONTENT: tuple[str, ...] = (
    "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
    "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
    "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
    "https://images.pexels.com/photos/574070/pexels-photo-574070.jpeg",
    "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg",
    "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg",
    "https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg",
    "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg",
    "https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg",
    "https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg",
)

PEXELS_AVATARS: tuple[str, ...] = (
    "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
)

# --- Query params ------------------------------------------------------------

CONTENT_QUERY_WIDE = "auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
CONTENT_QUERY_MEDIUM = "auto=compress&cs=tinysrgb&w=800&dpr=1"
AVATAR_QUERY = "auto=compress&cs=tinysrgb&w=160&h=160&fit=crop&dpr=2"

# --- Patterns ----------------------------------------------------------------

# Normal URLs, e.g. https://images.unsplash.com/photo-1544025162-d76694265947?w=800
UNSPLASH_URL = re.compile(r"https://images\.unsplash\.com/photo-[A-Za-z0-9_-]+(?:\?[^\s'\"`\\)]*)?")
# Template-literal URLs, e.g. https://images.unsplash.com/photo-${seed}?w=800
UNSPLASH_TEMPLATE_URL = re.compile(
    r"https://images\.unsplash\.com/photo-\$\{[^}]+\}(?:\?[^\s'\"`\\)]*)?"
)
# Already-migrated Pexels URLs (the repair pass only rewrites their query).
PEXELS_URL = re.compile(
    r"https://images\.pexels\.com/photos/(\d+)/pexels-photo-\d+\.jpeg\?[^\s'\"`\\)]*"
)
# Hints that an image renders as a person's avatar rather than content.
AVATAR_CONTEXT = re.compile(
    r"avatar|author|profile|testimonial|\bface\b|U_FACE|rounded-full", re.IGNORECASE
)
WIDTH_PARAM = re.compile(r"[?&]w=(\d+)")
COMMENT_PREFIX = re.compile(r"\s*(?://|/\*|\*)")
PHOTO_ID_IN_URL = re.compile(r"photos/(\d+)/")

# Directories never scanned (vendor/build output).
SKIP_DIRS: frozenset[str] = frozenset(
    {"node_modules", ".git", "dist", "coverage", ".next", "build"}
)


@dataclass(slots=True)
class Stats:
    """Run summary counters.

    Attributes:
        files_scanned: Candidate files inspected.
        files_changed: Files whose content differed after migration.
        migrated: Unsplash URLs (normal + template-literal) replaced.
        repaired: Pexels avatar queries re-cropped.
    """

    files_scanned: int = 0
    files_changed: int = 0
    migrated: int = 0
    repaired: int = 0


def photo_id(url: str) -> str:
    """Extract the numeric Pexels photo ID from a pool URL.

    Args:
        url: A curated pool URL such as ``.../photos/774909/pexels-photo-...``.

    Returns:
        The numeric photo ID as a string.

    Raises:
        ValueError: If the URL does not contain a photo ID (a programming
            error in a pool constant, not a data error).
    """
    match = PHOTO_ID_IN_URL.search(url)
    if match is None:
        raise ValueError(f"pool URL is missing a photo id: {url}")
    return match.group(1)


# Numeric photo IDs of the avatar pool, used by the repair pass.
AVATAR_IDS: frozenset[str] = frozenset(photo_id(url) for url in PEXELS_AVATARS)


def stable_pick(pool: tuple[str, ...], key: str) -> str:
    """Deterministically pick from *pool* -- same key, same pick, every run.

    Args:
        pool: Candidate replacement URLs.
        key: Source string that seeds the pick (the original URL).

    Returns:
        ``pool`` entry indexed by the key's md5 digest, so the mapping is
        stable across runs, files, and machines.
    """
    digest = hashlib.md5(key.encode("utf-8")).hexdigest()
    return pool[int(digest, 16) % len(pool)]


def context_around(match: re.Match[str]) -> str:
    """Return the URL's own line plus one adjacent code line per side.

    Scanning outward stops at the first blank or comment line, and at most
    one code line per side is admitted: a section banner like
    ``// Pexels Avatars`` belongs to its whole block rather than to the one
    URL being classified, and a decorative ``rounded-full`` chip several
    lines below a hero image must not reclassify it as an avatar.

    Args:
        match: The URL match inside the file's full text.

    Returns:
        The URL's own line plus up to one adjacent code line per side.
    """
    text = match.string
    lines = text.split("\n")
    idx = text.count("\n", 0, match.start())
    selected = [lines[idx]]
    for step in (-1, 1):
        j = idx + step
        while 0 <= j < len(lines) and abs(j - idx) <= 1:
            line = lines[j]
            if not line.strip() or COMMENT_PREFIX.match(line):
                break
            selected.append(line)
            j += step
    return "\n".join(selected)


def build_replacement(source_url: str, context: str) -> str:
    """Map an Unsplash URL to a sized Pexels URL.

    Args:
        source_url: The matched Unsplash URL.
        context: Nearby source lines, used to detect avatar usage.

    Returns:
        The replacement URL: square face crop for avatars, otherwise a width
        bucket derived from the source URL's ``w`` parameter.
    """
    if AVATAR_CONTEXT.search(context):
        return f"{stable_pick(PEXELS_AVATARS, source_url)}?{AVATAR_QUERY}"
    width_match = WIDTH_PARAM.search(source_url)
    width = int(width_match.group(1)) if width_match else 0
    query = CONTENT_QUERY_MEDIUM if 0 < width <= 800 else CONTENT_QUERY_WIDE
    return f"{stable_pick(PEXELS_CONTENT, source_url)}?{query}"


def repair_query(match: re.Match[str]) -> str:
    """Re-crop a Pexels avatar URL that still carries hero sizing.

    Args:
        match: A ``PEXELS_URL`` match within the file text.

    Returns:
        The URL unchanged, or rewritten to the square avatar crop when the
        photo is from the avatar pool, still has hero sizing, and sits in an
        avatar context.
    """
    photo, url = match.group(1), match.group(0)
    if photo in AVATAR_IDS and CONTENT_QUERY_WIDE in url:
        if AVATAR_CONTEXT.search(context_around(match)):
            return f"{url.split('?', 1)[0]}?{AVATAR_QUERY}"
    return url


def migrate_text(text: str) -> tuple[str, int, int]:
    """Migrate every image URL found in one file's text.

    Template-literal URLs cannot keep their runtime interpolation (a Pexels
    URL needs a concrete photo ID), so they become static content images.

    Args:
        text: Full file content.

    Returns:
        A ``(new_text, migrated_count, repaired_count)`` tuple. ``new_text``
        equals ``text`` when nothing matched.
    """
    migrated = 0
    repaired = 0

    def sub_template(match: re.Match[str]) -> str:
        nonlocal migrated
        migrated += 1
        return f"{stable_pick(PEXELS_CONTENT, match.group(0))}?{CONTENT_QUERY_WIDE}"

    def sub_unsplash(match: re.Match[str]) -> str:
        nonlocal migrated
        migrated += 1
        return build_replacement(match.group(0), context_around(match))

    def sub_repair(match: re.Match[str]) -> str:
        nonlocal repaired
        replacement = repair_query(match)
        if replacement != match.group(0):
            repaired += 1
        return replacement

    text = UNSPLASH_TEMPLATE_URL.sub(sub_template, text)
    text = UNSPLASH_URL.sub(sub_unsplash, text)
    text = PEXELS_URL.sub(sub_repair, text)
    return text, migrated, repaired


def iter_source_files(root: Path, exts: frozenset[str]) -> Iterator[Path]:
    """Yield candidate source files under *root*.

    Args:
        root: Directory scanned recursively.
        exts: File-name extensions to keep (leading dot required).

    Yields:
        Files whose suffix matches, excluding ``*.d.ts`` and anything inside
        ``SKIP_DIRS``.
    """
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix not in exts or path.name.endswith(".d.ts"):
            continue
        if SKIP_DIRS.intersection(path.parts):
            continue
        yield path


def configure_logging(verbosity: int) -> None:
    """Configure module logging from the CLI verbosity flag.

    Operates on this module's logger (not ``basicConfig``, which is a silent
    no-op after its first call) so repeated ``main()`` runs reconfigure
    correctly. Records still propagate to the root logger for capture by
    test harnesses.

    Args:
        verbosity: 0 keeps INFO logs (per-file updates, summary), negative
            values reduce to WARNING, values above 0 enable DEBUG.
    """
    level = logging.WARNING if verbosity < 0 else logging.DEBUG if verbosity > 0 else logging.INFO
    pkg_logger = logging.getLogger(__name__)
    pkg_logger.setLevel(level)
    if not pkg_logger.handlers:
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
        pkg_logger.addHandler(handler)


def main(argv: Sequence[str] | None = None) -> int:
    """Run the codemod over the target tree.

    Args:
        argv: CLI arguments; ``None`` means ``sys.argv[1:]``.

    Returns:
        Process exit code: 0 on success, 1 when ``--check`` finds pending
        changes, 2 on usage errors.
    """
    parser = argparse.ArgumentParser(
        description="Migrate Unsplash image URLs to Pexels (deterministic, avatar-aware)."
    )
    parser.add_argument("--root", type=Path, default=Path("src"), help="directory to scan")
    parser.add_argument(
        "--ext", nargs="+", default=[".ts", ".tsx"], metavar="EXT", help="file extensions"
    )
    parser.add_argument("--dry-run", action="store_true", help="preview changes, write nothing")
    parser.add_argument(
        "--check", action="store_true", help="exit 1 if any file would change (CI drift guard)"
    )
    parser.add_argument("-v", "--verbose", action="count", default=0, help="increase log verbosity")
    parser.add_argument("-q", "--quiet", action="store_true", help="only log warnings")
    args = parser.parse_args(argv)

    configure_logging(-1 if args.quiet else args.verbose)

    if not args.root.is_dir():
        parser.error(f"not a directory: {args.root}")

    exts = frozenset(ext if ext.startswith(".") else f".{ext}" for ext in args.ext)
    stats = Stats()
    verb = "would update" if (args.dry_run or args.check) else "updated"

    for path in iter_source_files(args.root, exts):
        stats.files_scanned += 1
        try:
            # newline='' disables newline translation so files round-trip byte-identically.
            with path.open("r", encoding="utf-8", newline="") as handle:
                original = handle.read()
        except (OSError, UnicodeDecodeError) as exc:
            logger.warning("skipped %s: %s", path, exc)
            continue

        updated, migrated, repaired = migrate_text(original)
        if updated == original:
            continue

        stats.files_changed += 1
        stats.migrated += migrated
        stats.repaired += repaired
        logger.info("%s: %s (%d migrated, %d repaired)", verb, path, migrated, repaired)
        if args.dry_run or args.check:
            continue
        with path.open("w", encoding="utf-8", newline="") as handle:
            handle.write(updated)

    logger.info(
        "%d files scanned | %d %s | %d URLs migrated | %d avatar queries repaired",
        stats.files_scanned,
        stats.files_changed,
        verb,
        stats.migrated,
        stats.repaired,
    )
    if args.check and stats.files_changed:
        logger.warning("check failed: un-migrated or mis-sized image URLs remain")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
