# TODO - Remote Labs Website

Open items only. Completed work is not tracked here - the commit history
and `README.md` / `AGENTS.md` are the record; close an item by removing
it from this file in the same commit that finishes it.

1. **Video captions** - the hero `<video>` needs a `<track kind="captions">`
   for the last Lighthouse accessibility point (96 -> 100). Waiting on the
   `.vtt` file from Karel. Once available:
   add `<track kind="captions" srclang="en" src="assets/videos/hero-captions.vtt">`
   inside the hero video element in `production_source/index.html`,
   bump `VERSION`, run `npm run build:full`, commit source + `deploy/`.
   The a11y budget (0.9) passes meanwhile; only the perfect score waits.

2. **Server-config redirects (hygiene, not blocking)** - the server
   answers plain `http://remote-labs.eu` with 200 (no 301 to https) and
   serves `www.remote-labs.eu` as a duplicate instead of redirecting to
   the apex. HSTS protects returning visitors, but a 301
   `http -> https` and `www -> apex` would concentrate SEO signals on
   the canonical host. Server-side change; nothing to do in this repo.

3. **Windows/OneDrive checkout: build.js assets copy fails** - on this
   machine `fs.rmSync(deploy/assets)` (build.js Step 6) fails with EPERM:
   OneDrive holds a lock on the freshly placed
   `deploy/assets/Publications/Magazine_AMVELC_2026_digitaal.pdf`. The
   partial delete removes fonts/images/videos from `deploy/assets` and
   leaves the PDF. Workaround: after the build, re-copy
   `production_source/assets/{fonts,images,videos}` into `deploy/assets/`
   and verify with `diff -r production_source/assets deploy/assets`.
   CI is unaffected (Linux). Assets-copy failures are now fatal (the
   build exits 1 instead of shipping a partial deploy/); the remaining
   option is to make build.js copy-over instead of delete+recreate.

4. **Oversized partner logos** - `assets/images/logos/partner-logos/`
   totals ~266 KB but renders at max 120x40 (ZPNU.png source is
   10412x2450). Downscale to ~240 px wide (WebP/palette PNG) -> ~40 KB.
   Bump `VERSION`, rebuild, commit.

5. **Experiment images** - 3x JPEG 773x498 (~186 KB total) displayed at
   <= ~373 px wide / 250 px tall in the grid. Serve ~800 px WebP or
   q80 JPEG (~60 KB total) and add `decoding="async"`. Bump `VERSION`,
   rebuild, commit.

6. **Critical CSS is duplicated** - the inline `<style>` block in
   `production_source/index.html` repeats rules that also live in
   `production_source/styles.css` (kept in sync by hand). Consider
   extracting the above-the-fold subset from styles.css at build time so
   there is a single source.

7. **Legacy `scripts/*.bat` wrappers** - `build-experimental.bat` and
   `sync-experimental.bat` duplicate the JS scripts and still reference
   the retired `npm run build` and a silent minify-fallback. Either delete
   them or regenerate them as thin wrappers around the JS entry points.

Note: the 8.9 MB hero video is NOT a TODO - re-encoding/trimming it was
evaluated and declined (commit `5d785a50`); the original stays and the
Lighthouse performance budget stays at 0.7. See production_source/AGENTS.md.
