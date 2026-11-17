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

2. **Optional: proxy the Umami collection endpoint (server-side)** - per
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
