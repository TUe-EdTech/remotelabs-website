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

Note: the 8.9 MB hero video is NOT a TODO - re-encoding/trimming it was
evaluated and declined (commit `5d785a50`); the original stays and the
Lighthouse performance budget stays at 0.7. See production_source/AGENTS.md.
