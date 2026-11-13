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

2. **Responsive images for the experiment photos** - the three
   experiment step images ship one 773 px-wide JPG each with no
   `srcset`; on mobile Lighthouse flags ~14 KiB of avoidable bytes
   (`uses-responsive-images`). Needs resized variants generated and a
   `srcset`/`sizes` attribute added - an asset-generation decision.

3. **CLS from the async stylesheet swap** - `styles.min.css` loads
   async (with a preload), and when it lands late the footer/contact
   reflow (measured CLS up to ~0.37, racy). Fix options: extend the
   critical inline CSS to cover below-the-fold layout, or make the
   24 KB stylesheet render-blocking since it is already preloaded.

Note: the 8.9 MB hero video is NOT a TODO - re-encoding/trimming it was
evaluated and declined (commit `5d785a50`); the original stays and the
Lighthouse performance budget stays at 0.7. See production_source/AGENTS.md.
