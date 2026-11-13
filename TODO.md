# TODO - Remote Labs Website

Open items only. Completed work is not tracked here - the commit history
and `README.md` / `AGENTS.md` are the record; close an item by removing
it from this file in the same commit that finishes it.

1. **Server-config redirects (hygiene, not blocking)** - the server
   answers plain `http://remote-labs.eu` with 200 (no 301 to https) and
   serves `www.remote-labs.eu` as a duplicate instead of redirecting to
   the apex. HSTS protects returning visitors, but a 301
   `http -> https` and `www -> apex` would concentrate SEO signals on
   the canonical host. Server-side change; nothing to do in this repo.

2. **BROKEN LIVE SITE - v2.1.33 upload truncated two files (2026-11-13)** -
   remote-labs.eu currently serves **0-byte `styles.min.css` and
   `script.min.js`** (ETag `0-...`; every other file matches `deploy/`
   byte-for-byte), so the site loads unstyled. The repo is fine - the
   upload wrote empty files. Fix: re-upload `deploy/` (committed at
   v2.1.35 - the bump matters because the service worker serves `?v=`
   assets cache-first as immutable, so clients that cached the empty
   `?v=2.1.33` CSS/JS only recover when CACHE_NAME changes), then run
   `node scripts/verify-live.js` from the repo root and confirm it
   reports every file matching byte-for-byte. Until then, anyone who
   visited during the broken window may still see the unstyled page.

3. **Optional: proxy the Umami collection endpoint (server-side)** - per
   https://docs.umami.is/docs/bypass-ad-blockers the tracker script is now
   self-hosted (v2.1.35), but the `/api/send` POST still goes to
   cloud.umami.is, which aggressive ad blockers may still block. A
   server-side reverse proxy (e.g. Apache: `/stats.js` ->
   `cloud.umami.is/script.js`, `/api/send` -> `gateway.umami.is/api/send`,
   with `data-host-url` pointed at remote-labs.eu) would make collection
   fully first-party. Server-side change; needs TU/e web server access
   like item 1.

Note: the 8.9 MB hero video is NOT a TODO - re-encoding/trimming it was
evaluated and declined (commit `5d785a50`); the original stays and the
Lighthouse performance budget stays at 0.7. See production_source/AGENTS.md.
