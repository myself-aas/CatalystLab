"""Test suite for scripts/replace_images.py.

Covers migration determinism, avatar classification (including the
comment-banner regression), the Pexels repair pass, CLI modes, and file
safety guarantees (line endings, vendor-dir skips, bad-input tolerance).
"""

from __future__ import annotations

import logging
from collections.abc import Callable, Sequence
from pathlib import Path

import pytest
import replace_images as ri

# --- Constants used across tests ---------------------------------------------

CONTENT_MED = "https://images.unsplash.com/photo-ddeeff?w=800"
CONTENT_HERO = "https://images.unsplash.com/photo-112233?w=1600"
CONTENT_NOW = "https://images.unsplash.com/photo-445566"
CONTENT_TINY = "https://images.unsplash.com/photo-aabbcc?w=400"
AVATAR_SRC = "https://images.unsplash.com/photo-998877?w=200"
TEMPLATE_SRC = "https://images.unsplash.com/photo-${seed}?w=800"

WIDE_QUERY = ri.CONTENT_QUERY_WIDE
MEDIUM_QUERY = ri.CONTENT_QUERY_MEDIUM
AVATAR_QUERY = ri.AVATAR_QUERY


# --- Helpers & fixtures ------------------------------------------------------


def build_tree(tmp_path: Path, files: dict[str, str]) -> Path:
    """Materialize a fake source tree and return its root directory."""
    root = tmp_path / "src"
    for name, content in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8", newline="")
    return root


def read(root: Path, name: str) -> str:
    """Read one file from the built tree as UTF-8 text."""
    return (root / name).read_text(encoding="utf-8")


@pytest.fixture
def tree(tmp_path: Path) -> Path:
    """A representative source tree: content, avatar, template, vendor files."""
    return build_tree(
        tmp_path,
        {
            "app.tsx": (
                f"export const hero = '{CONTENT_HERO}';\n" f"export const card = '{CONTENT_MED}';\n"
            ),
            "authors.ts": f"export const authorAvatar = '{AVATAR_SRC}';\n",
            "registry.ts": (
                f"export const U_NEON = '{CONTENT_NOW}';\n"
                "// Pexels Avatars (Faces crop)\n"
                f"export const U_FACE_9 = '{CONTENT_NOW}';\n"
            ),
            "template.tsx": f"const src = `'{TEMPLATE_SRC}'`;\n",
            "crlf.ts": f"const img = '{CONTENT_TINY}';\r\nconst ok = 1;\r\n",
            "node_modules/pkg/skip.ts": f"const x = '{CONTENT_TINY}';\n",
            "types.d.ts": f"declare const x: '{CONTENT_TINY}';\n",
            "vendor.d.ts": f"declare const y: '{CONTENT_TINY}';\n",
        },
    )


@pytest.fixture
def run(tree: Path) -> Callable[..., int]:
    """Invoke ``main`` against the fixture tree with the root preconfigured."""

    def _run(*extra: str) -> int:
        return ri.main(["--root", str(tree), *extra])

    return _run


def main_on(tmp_path: Path, *extra: str) -> int:
    """Run the CLI against ``tmp_path``-rooted ``src`` with *extra* flags."""
    argv: Sequence[str] = ["--root", str(tmp_path / "src"), *extra]
    return ri.main(argv)


# --- Core migration ----------------------------------------------------------


@pytest.mark.parametrize(
    ("url", "query"),
    [
        (CONTENT_MED, MEDIUM_QUERY),
        (CONTENT_HERO, WIDE_QUERY),
        (CONTENT_NOW, WIDE_QUERY),
    ],
    ids=["width-bucket-800", "width-bucket-wide", "no-width-defaults-wide"],
)
def test_content_urls_use_width_buckets(tmp_path: Path, url: str, query: str) -> None:
    """Content images get a width bucket derived from the source ``w`` param."""
    build_tree(tmp_path, {"app.tsx": f"const img = '{url}';\n"})
    assert main_on(tmp_path) == 0
    out = read(tmp_path / "src", "app.tsx")
    assert url not in out
    assert f"?{query}" in out


@pytest.mark.parametrize(
    "line",
    [
        f"export const authorAvatar = '{AVATAR_SRC}';",
        f"export const U_FACE_1 = '{AVATAR_SRC}';",
        f'const quote = {{ avatar: "{AVATAR_SRC}" }};  // testimonial',
        f'<img className="rounded-full" src="{AVATAR_SRC}" />',
    ],
    ids=["authorAvatar", "U_FACE", "testimonial", "rounded-full"],
)
def test_avatar_contexts_get_square_crop(tmp_path: Path, line: str) -> None:
    """Avatar-ish contexts receive the square face crop, not hero sizing."""
    build_tree(tmp_path, {"a.ts": line + "\n"})
    assert main_on(tmp_path) == 0
    out = read(tmp_path / "src", "a.ts")
    assert "unsplash" not in out
    assert AVATAR_QUERY in out
    assert WIDE_QUERY not in out


def test_mapping_is_deterministic(tmp_path: Path) -> None:
    """Same source URL maps to the same Pexels URL across runs and files."""
    files = {
        "a.ts": f"const one = '{CONTENT_MED}';\n",
        "b.ts": f"const two = '{CONTENT_MED}';\n",
    }
    root_one = build_tree(tmp_path / "one", files)
    root_two = build_tree(tmp_path / "two", files)
    assert ri.main(["--root", str(root_one)]) == 0
    assert ri.main(["--root", str(root_two)]) == 0
    urls = [
        ri.PEXELS_URL.search(text).group(0)  # type: ignore[union-attr]
        for text in (
            (root_one / "a.ts").read_text(encoding="utf-8"),
            (root_two / "a.ts").read_text(encoding="utf-8"),
            (root_two / "b.ts").read_text(encoding="utf-8"),
        )
    ]
    assert len(set(urls)) == 1, f"mappings diverged: {urls}"


def test_repair_pass_recrops_pexels_avatar(tmp_path: Path) -> None:
    """Already-migrated Pexels avatar URLs lose their hero-sized query."""
    wide_avatar = (
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" f"?{WIDE_QUERY}"
    )
    build_tree(
        tmp_path,
        {
            "authors.ts": f"export const authorAvatar = '{wide_avatar}';\n",
            "content.ts": (
                "export const img = 'https://images.pexels.com/photos/281260/"
                f"pexels-photo-281260.jpeg?{WIDE_QUERY}';\n"
            ),
            "square.ts": (
                "export const authorAvatar = 'https://images.pexels.com/photos/774909/"
                f"pexels-photo-774909.jpeg?{AVATAR_QUERY}';\n"
            ),
        },
    )
    assert main_on(tmp_path) == 0
    authors = read(tmp_path / "src", "authors.ts")
    content = read(tmp_path / "src", "content.ts")
    square = read(tmp_path / "src", "square.ts")
    assert AVATAR_QUERY in authors
    assert WIDE_QUERY in content  # content images stay untouched
    assert square.endswith(f"?{AVATAR_QUERY}';\n")  # already square → unchanged


def test_comment_banner_does_not_reclassify_neighbor(tree: Path, run: Callable[..., int]) -> None:
    """A section comment classifies its own block only (U_NEON regression)."""
    assert run() == 0
    registry = read(tree, "registry.ts")
    neon_line = next(line for line in registry.splitlines() if "U_NEON" in line)
    face_line = next(line for line in registry.splitlines() if "U_FACE_9" in line)
    assert WIDE_QUERY in neon_line  # content, despite the Avatars banner above
    assert AVATAR_QUERY in face_line


def test_distant_rounded_chip_does_not_reclassify_hero(tmp_path: Path) -> None:
    """A ``rounded-full`` chip lines below a hero image is out of context."""
    wide_avatar = (
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" f"?{WIDE_QUERY}"
    )
    build_tree(
        tmp_path,
        {
            "page.tsx": (
                "<ParallaxSection\n"
                f'  bgImage="{wide_avatar}"\n'
                "  overlayOpacity={0.88}\n"
                '  height="min-h-[320px]"\n'
                ">\n"
                '  <span className="inline-flex rounded-full bg-slate-900 px-3.5">Chip</span>\n'
            )
        },
    )
    assert main_on(tmp_path) == 0
    assert WIDE_QUERY in read(tmp_path / "src", "page.tsx")  # stays a hero image


def test_adjacent_jsx_line_counts_as_context(tmp_path: Path) -> None:
    """Multiline JSX usage is classified: className on the next line counts."""
    build_tree(
        tmp_path,
        {"card.tsx": ("<img\n" f'  src="{AVATAR_SRC}"\n' '  className="rounded-full"\n' "/>\n")},
    )
    assert main_on(tmp_path) == 0
    out = read(tmp_path / "src", "card.tsx")
    assert "unsplash" not in out
    assert AVATAR_QUERY in out


def test_template_literal_becomes_static_content(tree: Path, run: Callable[..., int]) -> None:
    """``photo-${seed}`` URLs become static content images (no interpolation)."""
    assert run() == 0
    out = read(tree, "template.tsx")
    assert "unsplash" not in out
    assert "${" not in out
    assert WIDE_QUERY in out


# --- CLI modes & safety ------------------------------------------------------


def test_dry_run_reports_without_writing(
    tree: Path, run: Callable[..., int], caplog: pytest.LogCaptureFixture
) -> None:
    """``--dry-run`` leaves every file byte-identical."""
    before = {p: p.read_bytes() for p in tree.rglob("*") if p.is_file()}
    with caplog.at_level(logging.INFO):
        assert run("--dry-run") == 0
    after = {p: p.read_bytes() for p in tree.rglob("*") if p.is_file()}
    assert before == after
    assert any("would update" in record.message for record in caplog.records)


def test_check_mode_exit_codes(tmp_path: Path, caplog: pytest.LogCaptureFixture) -> None:
    """``--check`` exits 1 when work is pending and 0 on a clean tree."""
    pending = build_tree(tmp_path / "pending", {"a.ts": f"const u = '{CONTENT_MED}';\n"})
    clean = build_tree(tmp_path / "clean", {"a.ts": "const ok = 1;\n"})
    with caplog.at_level(logging.INFO):
        assert ri.main(["--root", str(pending), "--check"]) == 1
        assert ri.main(["--root", str(clean), "--check"]) == 0
    # check mode must not modify the tree
    assert CONTENT_MED in read(pending, "a.ts")


def test_second_run_is_idempotent(tree: Path, run: Callable[..., int]) -> None:
    """A completed migration re-runs as a no-op."""
    assert run() == 0
    snapshot = {p: p.read_bytes() for p in tree.rglob("*") if p.is_file()}
    assert run() == 0
    assert snapshot == {p: p.read_bytes() for p in tree.rglob("*") if p.is_file()}


def test_crlf_line_endings_preserved(tmp_path: Path) -> None:
    """Migrated CRLF files keep their ``\\r\\n`` endings byte-for-byte."""
    build_tree(tmp_path, {"w.ts": f"const img = '{CONTENT_TINY}';\r\nok();\r\n"})
    path = tmp_path / "src" / "w.ts"
    crlf_before = path.read_bytes().count(b"\r\n")
    assert main_on(tmp_path) == 0
    data = path.read_bytes()
    assert data.count(b"\r\n") == crlf_before
    assert b"unsplash" not in data


def test_skips_vendor_dirs_and_d_ts(tree: Path, run: Callable[..., int]) -> None:
    """node_modules content and ``*.d.ts`` files are never touched."""
    assert run() == 0
    assert CONTENT_TINY in read(tree, "node_modules/pkg/skip.ts")
    assert CONTENT_TINY in read(tree, "types.d.ts")
    assert CONTENT_TINY in read(tree, "vendor.d.ts")


def test_invalid_utf8_warns_and_continues(tmp_path: Path, caplog: pytest.LogCaptureFixture) -> None:
    """Undecodable files log a warning and do not abort the run."""
    root = tmp_path / "src"
    root.mkdir()
    (root / "bad.ts").write_bytes(b"\xff\xfe\x00const broken = 1;\n")
    (root / "good.ts").write_text(f"const u = '{CONTENT_MED}';\n", encoding="utf-8")
    with caplog.at_level(logging.WARNING):
        assert main_on(tmp_path) == 0
    assert any("skipped" in record.message for record in caplog.records)
    assert "unsplash" not in read(root, "good.ts")


def test_missing_root_is_usage_error(tmp_path: Path) -> None:
    """A nonexistent ``--root`` exits with argparse's usage code (2)."""
    with pytest.raises(SystemExit) as excinfo:
        ri.main(["--root", str(tmp_path / "missing")])
    assert excinfo.value.code == 2


def test_ext_filter(tmp_path: Path) -> None:
    """Only extensions passed via ``--ext`` are rewritten."""
    build_tree(
        tmp_path, {"a.ts": f"const u = '{CONTENT_MED}';\n", "b.py": f"u = '{CONTENT_MED}'\n"}
    )
    assert main_on(tmp_path) == 0  # default exts: .ts/.tsx
    assert CONTENT_MED not in read(tmp_path / "src", "a.ts")
    assert CONTENT_MED in read(tmp_path / "src", "b.py")
    assert main_on(tmp_path, "--ext", ".py") == 0
    assert CONTENT_MED not in read(tmp_path / "src", "b.py")


# --- Unit helpers & logging --------------------------------------------------


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?x=1", "774909"),
        ("https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg", "281260"),
    ],
)
def test_photo_id_extracts_numeric_id(url: str, expected: str) -> None:
    """``photo_id`` pulls the numeric ID out of pool URLs."""
    assert ri.photo_id(url) == expected


def test_photo_id_raises_on_malformed_pool_url() -> None:
    """Malformed pool constants fail fast with a clear error."""
    with pytest.raises(ValueError, match="missing a photo id"):
        ri.photo_id("https://images.pexels.com/no-id-here")


@pytest.mark.parametrize("key", ["a", "photo-12345", "https://images.unsplash.com/x"])
def test_stable_pick_stays_in_pool_and_is_stable(key: str) -> None:
    """The deterministic pick always lands inside the pool and repeats."""
    assert ri.stable_pick(ri.PEXELS_CONTENT, key) in ri.PEXELS_CONTENT
    assert ri.stable_pick(ri.PEXELS_CONTENT, key) == ri.stable_pick(ri.PEXELS_CONTENT, key)


@pytest.mark.parametrize(
    ("verbosity", "expected"),
    [(-1, logging.WARNING), (0, logging.INFO), (3, logging.DEBUG)],
)
def test_configure_logging_levels(verbosity: int, expected: int) -> None:
    """Verbosity maps to WARNING/INFO/DEBUG on the module logger."""
    ri.configure_logging(verbosity)
    assert logging.getLogger("replace_images").getEffectiveLevel() == expected


def test_summary_is_logged(
    tree: Path, run: Callable[..., int], caplog: pytest.LogCaptureFixture
) -> None:
    """The run summary reports scan and change counts (5/5 for the fixture)."""
    with caplog.at_level(logging.INFO):
        assert run() == 0
    summaries = [r.message for r in caplog.records if "files scanned" in r.message]
    assert summaries, "expected a summary log record"
    assert "5 files scanned" in summaries[0]
    assert "5 updated" in summaries[0]


def test_migrate_text_counts() -> None:
    """``migrate_text`` reports per-category counts."""
    text = (
        f"a {CONTENT_MED} b '{TEMPLATE_SRC}' c d "
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
        f"?{WIDE_QUERY} authorAvatar"
    )
    _, migrated, repaired = ri.migrate_text(text)
    assert migrated == 2
    assert repaired == 1
