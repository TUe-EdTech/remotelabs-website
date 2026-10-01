# TODO - Remote Labs Website

Open items only. Completed work is not tracked here - the commit history
and `README.md` / `AGENTS.md` are the record; close an item by removing
it from this file in the same commit.

1. **Video captions** - the hero `<video>` needs a `<track kind="captions">`
   for the last Lighthouse accessibility point (96 -> 100). Waiting on the
   `.vtt` file from Karel. Once available:
   add `<track kind="captions" srclang="en" src="assets/videos/hero-captions.vtt">`
   inside the hero video element in `production_source/index.html`,
   bump `VERSION`, run `npm run build:full`, commit source + `deploy/`.
   The a11y budget (0.9) passes meanwhile; only the perfect score waits.
