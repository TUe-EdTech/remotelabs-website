# Website Improvement Tracker

## Done

1. **Repo debt** (commit `4fc02dd`) - untracked `production_source/node_modules` (169 files); `experimental/assets` deduplicated (shared assets now come from `production_source/` at build time).
2. **CI quality gates** (commits `0f39672`, `2f39be2`) - `npm test`, `scripts/check-links.js` (local link/asset/anchor integrity) and Lighthouse budgets (`lighthouserc.json`) run on every push/PR to main.
3. **TBT / inline CSS** (commits `65e05a4`, `ff05dcd`) - the 424-line unminified inline `<style>` block moved into `styles.css` (now minified). Fixed the silently broken CSS minification (`npx clean-css` never resolved; `build.js` now uses the clean-css library API and treats minify failure as fatal).
4. **Version drift** (commit `693f87c`) - `VERSION` is the single source of truth; `build.js` syncs (never bumps); `test.js` fails if source or `deploy/` disagree with `VERSION`. Root `.gitattributes` added (LF normalization; no more phantom diffs).
5. **First-load video bytes** (commit `ff05dcd`) - dropped the `book-experiment.mp4` head preload; workflow video lazy-loads via IntersectionObserver; hero video skipped on Save-Data/2G; umami preconnects; play/pause button reflects real state.

## Pending (in priority order)

1. **Hero video re-encode** - the biggest remaining perf lever (performance measured 0.75 in CI; budget currently 0.7). No ffmpeg on the dev machine. When available:

   ```
   ffmpeg -i hero-loop.mp4 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an hero-loop.new.mp4
   ```

   Target ~1-2 MB (from 8.9 MB). Review visually, replace, bump VERSION, build, commit. Afterwards ratchet the `lighthouserc.json` performance budget from 0.7 toward 0.9 (AGENTS.md target is 90+).

2. **Accessibility 96 -> 100** (from the CI Lighthouse report):
   - Insufficient contrast on the four `.benefit-number` elements (01-04, benefits section; currently `color: var(--gray-400)`).
   - Hero `<video>` has no `<track kind="captions">` (or explicit decorative treatment).

3. **`prefers-reduced-motion` support** - zero occurrences today despite autoplaying videos, smooth scrolling, a pulsing-dot animation and hover transforms (WCAG 2.3.3). Pairs with item 1: the reduced-motion path would show the hero poster instead of autoplaying.

## Reminders

- Release ritual: edit `VERSION` (PATCH) -> `cd production_source && npm run build:full` -> commit source + `deploy/` together. Never bump versions anywhere else; the build syncs and `npm test` enforces.
- `deploy/` is CI-built and auto-committed on main; the Lighthouse CI report links appear in the run log (temporary public storage).
