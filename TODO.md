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
   CI is unaffected (Linux). Consider making build.js copy-over instead
   of delete+recreate, or excluding deploy/assets deletion failures as
   fatal with a verification step.
