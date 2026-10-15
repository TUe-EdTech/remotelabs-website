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

2. **Campaign landing page ships with a placeholder form link** -
   `production_source/landing-a.html` (Remote Labs ad, pre-launch
   feedback message) links to a `https://forms.example.com/...`
   placeholder marked with a TODO comment. Replace the CTA with the real
   external feedback form URL (and adjust the `utm_campaign` value),
   verify it in a real browser (`check-links.js` skips external URLs),
   bump `VERSION`, rebuild and commit before the campaign launches.
   `landing-b.html` (online learning / MOOCs ad) is a notice page with no
   form link. After the campaign, decide whether to remove the pages or
   keep them for reuse.

3. **Server-config redirects (hygiene, not blocking)** - the server
   answers plain `http://remote-labs.eu` with 200 (no 301 to https) and
   serves `www.remote-labs.eu` as a duplicate instead of redirecting to
   the apex. HSTS protects returning visitors, but a 301
   `http -> https` and `www -> apex` would concentrate SEO signals on
   the canonical host. Server-side change; nothing to do in this repo.
