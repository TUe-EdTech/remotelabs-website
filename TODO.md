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

## Design follow-ups 2026-11 (after the v2.1.37 pass) - PROPOSED, awaiting approval

3. **Sync the hero concept from experimental/ to production** - viewfinder
   frame around the hero rig video (corner ticks + mono caption), header
   readout strip with the pulsing live dot + status link, mono `24/7` in
   the H1. Prototype is built and green in `experimental_deploy/`
   (check-links 41/41); sync = copy the markup + CSS into
   `production_source/`, then `sync-experimental.js --dry-run` to review.

4. **Focus ring on dark surfaces** - `--accent` #BE0000 on the black CTA
   band is ~3.2:1 (passes 3:1, but marginal) and weak on video controls.
   Use a white focus outline inside `.cta-section` and on
   `.video-control-btn`; keep scarlet on light surfaces.

5. **Header: hairline instead of shadow** - `.main-header` still has
   `box-shadow: var(--shadow-sm)`; replace with
   `border-bottom: 1px solid var(--gray-200)` to match the flat
   hairline language of v2.1.37.

6. **Viewfinder frame on the workflow video too** - apply the same frame
   + mono caption to `#workflow-video` so both rig videos share the
   visual language (needs the placeholder panel repositioned inside it).
