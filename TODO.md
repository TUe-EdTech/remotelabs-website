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

## Design audit 2026-11 (frontend-design review) - PROPOSED, awaiting approval

Items 3-12 come from the design audit of the current production design.
None are implemented; approve by number before any work starts.

3. **Hero concept** - the most characteristic asset (live rig footage) is
   an unframed full-width video under a plain headline. Proposal: frame it
   as a live viewfinder (corner ticks, monospace caption) plus a thin
   top readout strip with a status dot. Prototype in `experimental/`
   first, sync to `production_source/` only when approved.
   (`production_source/index.html` hero, `styles.css:589`)

4. **Remove gradient decorations** - four rules break the documented
   "no gradients" brand rule and read as decoration: the section-title
   underline (`styles.css:846`), the CTA-section wash (`styles.css:983`),
   the primary button gradient (`styles.css:1023,1028`). Replace with
   flat black.

5. **De-card the step and experiment cards** - identical bordered cards
   with `shadow-md` and a hover `translateY(-5px)` lift on every card is
   the generic card-kit pattern. Replace with flat, hairline-divided
   blocks; keep only the active-step pulse dot (semantic: "playing").
   (`styles.css:280+, 1121+`)

6. **Benefits section** - the 2x2 grid has decorative crosshair lines
   (`::before`/`::after` at 50%) and 01-04 numbers, but benefits are a
   list, not a sequence. Replace with hairline rows, drop the numbers.
   (`styles.css:895-960`)

7. **Workflow toggle** - a 420px pill with a sliding black block and
   shadow is heavy chrome for a 3-way switch. Replace with a hairline
   segmented control. (`styles.css:1216+`)

8. **CTA block** - centered gradient-bordered card inside an otherwise
   left-aligned page. Replace with a left-aligned solid black band.
   (`styles.css:983`, `index.html` cta-section)

9. **Stylesheet cleanup** - lines 1-470 of `styles.css` are a legacy
   duplicate block (`.container`, `.logo`, `.cta-button`, `.hero`,
   `.section-title`, `.workflow-step`, consent banner, fab are all
   defined again in the organized sections below), and ~10 classes have
   zero HTML uses: `.direct-contact` (incl. its `content: "📧"` emoji
   rule, `styles.css:1082`), `.secondary-cta`, `.value-icon`,
   `.features-grid`, `.hidden-section`, `.logo-img`, `.experiment-button`,
   `.contact-header`, `.video-embed-wrapper`, `.footer-content`.
   Delete both. Roughly 28% of the stylesheet is dead weight.

10. **Copy pass** - drop the italic filler "We'd love to discuss how we
    can collaborate with you." under the CTA buttons; tighten the overlap
    between hero subtitle and hero description.

11. **Optional accent (explicitly needs approval - it excepts the
    monochrome rule in `production_source/AGENTS.md`)** - one
    signal-scarlet accent `#BE0000` (from the TU/e scarlet logo asset),
    spent only on a live/status dot and the focus ring.

12. **Selector hygiene** - replace the global `section { padding }`
    element selector with a `.section` class (specificity trap; the hero
    already fights it with per-breakpoint overrides). Optionally drop the
    custom webkit scrollbar styling.
