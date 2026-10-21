#!/usr/bin/env bash
# Re-derives the sandbox render runtime for HyperFrames in this environment.
# Needed because: apt/deb.debian.org, storage.googleapis.com, release-assets.githubusercontent.com
# and jsdelivr are unreachable here; only github.com/codeload, api.github.com, registry.npmjs.org
# and pypi.org are allowed. /tmp does not persist between sessions.
#
# Usage: bash tools/sandbox-runtime.sh   (takes ~8-12 min, mostly the NSS build)
# Then:  source /tmp/hf-env.sh && npx hyperframes <cmd>
set -euo pipefail

echo "== 1/4 FFmpeg (static, via imageio-ffmpeg on pypi) =="
if [ ! -x /tmp/ffbin/ffmpeg ]; then
  python3 -m venv /tmp/ffv
  /tmp/ffv/bin/pip -q install imageio-ffmpeg
  mkdir -p /tmp/ffbin
  ln -sf /tmp/ffv/lib/python3.11/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-* /tmp/ffbin/ffmpeg
fi
/tmp/ffbin/ffmpeg -version | head -1

echo "== 2/4 Chrome headless shell (@sparticuz/chromium from npm; ESM package) =="
if [ ! -x /tmp/chromium ]; then
  mkdir -p /tmp/chromepkg && cd /tmp/chromepkg
  [ -d node_modules/@sparticuz/chromium ] || npm i --no-audit --no-fund @sparticuz/chromium
  cat > probe.mjs <<'EOF'
import chromium from '@sparticuz/chromium';
console.log(await chromium.executablePath());
EOF
  node probe.mjs   # extracts to /tmp/chromium
fi
echo "chromium extracted (verified at end, after NSS libs exist)"

echo "== 3/4 NSS+NSPR from source (chrome-headless-shell's only missing libs) =="
if [ ! -f /tmp/nsslibs/libnss3.so ]; then
  mkdir -p /tmp/nssbuild && cd /tmp/nssbuild
  [ -d nspr ] || { curl -sL -o nspr.tar.gz https://codeload.github.com/mozilla/nspr/tar.gz/refs/heads/main; tar xzf nspr.tar.gz; mv nspr-main nspr; }
  [ -d nss ]  || { curl -sL -o nss.tar.gz  https://codeload.github.com/mozilla/nss/tar.gz/refs/heads/master; tar xzf nss.tar.gz; mv nss-master nss; }
  if [ ! -f nspr/dist/lib/libnspr4.so ]; then
    (cd nspr && ./configure --enable-64bit >/dev/null && make -j"$(nproc)" >/dev/null)
  fi
  # Harden coreconf/rules.mk: SUB_SHLOBJS captures sub-make stdout via $(shell ...get_objs);
  # any stray output (e.g. "make: Nothing to be done...") injects colon-bearing tokens into
  # prerequisites -> "*** multiple target patterns". Keep only *.o words.
  python3 - <<'EOF'
p='/tmp/nssbuild/nss/coreconf/rules.mk'
s=open(p).read()
a='$(shell $(MAKE) -C $(dir) --no-print-directory get_objs))'
b='$(filter %.o,$(shell $(MAKE) -C $(dir) --no-print-directory get_objs)))'
if a in s and b not in s: open(p,'w').write(s.replace(a,b))
print('rules.mk hardened')
EOF
  (cd nss && NSPR_INCLUDE_DIR=/tmp/nssbuild/nspr/dist/include/nspr \
            NSPR_LIB_DIR=/tmp/nssbuild/nspr/dist/lib \
            NSS_DISABLE_GTESTS=1 \
            make all BUILD_OPT=1 USE_64=1 -j"$(nproc)" > /tmp/nssbuild/nss-make.log 2>&1 || true)
  # cmd/selfserv may fail to compile - irrelevant; only lib/*.so matters.
  mkdir -p /tmp/nsslibs
  cp /tmp/nssbuild/dist/*_OPT.OBJ/lib/*.so /tmp/nsslibs/
  cp /tmp/nssbuild/nspr/dist/lib/*.so /tmp/nsslibs/
fi
LD_LIBRARY_PATH=/tmp/nsslibs ldd /tmp/chromium | grep -c "not found" | xargs -I{} echo "missing libs: {}"

echo "== 4/4 env wrapper =="
cat > /tmp/hf-env.sh <<'EOF'
export HYPERFRAMES_BROWSER_PATH=/tmp/chromium
export LD_LIBRARY_PATH=/tmp/nsslibs${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}
export HYPERFRAMES_FFMPEG_PATH=/tmp/ffbin/ffmpeg
export PATH=/tmp/ffbin:$PATH
EOF
echo "done: source /tmp/hf-env.sh"
