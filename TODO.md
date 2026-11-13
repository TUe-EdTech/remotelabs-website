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

2. **Stale content right after upload (reported 2026-11-13)** - after
   uploading deploy/ (v2.1.31 verified byte-identical live), a browser that
   visited before the upload saw outdated/unstyled content. The repo's own
   caching layers (SW, browser cache, TU/e proxy) are documented in
   production_source/AGENTS.md; HTML is `no-cache` and assets are immutable
   with ?v=, and the SW upgrade path was tested locally, so the likely
   culprit is the TU/e proxy/CDN serving a stale HTML response. Verify the
   proxy's caching rules for HTML and add a purge step to the deploy
   runbook if needed. Workaround for viewers: hard refresh / incognito.

Note: the 8.9 MB hero video is NOT a TODO - re-encoding/trimming it was
evaluated and declined (commit `5d785a50`); the original stays and the
Lighthouse performance budget stays at 0.7. See production_source/AGENTS.md.
