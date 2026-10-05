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

2. **Production is stale** - the live site at `remote-labs.eu` was serving
   asset version v2.1.7 while `main` had moved to v2.1.9 (a11y contrast
   fix, hero play/pause icon fix); the canonical-domain fix landed as
   v2.1.10. CI only commits `deploy/` to git; the server upload is
   manual. Action: upload current `deploy/` (v2.1.10) to the server and
   verify in an incognito window.

3. **Verify the status-page link in a real browser** - the "Quick Links"
   footer points at `https://status.remote-labs.eu`, which returns 403
   to curl (behind bunny-shield bot protection). Probably fine for real
   visitors, but a manual browser check costs one minute; replace the
   link if the status page moved.
