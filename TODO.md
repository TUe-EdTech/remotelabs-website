# Website Improvement Tracker

## Done

1. **Repo debt** (commit `4fc02dd`) - untracked `production_source/node_modules` (169 files); `experimental/assets` deduplicated (shared assets now come from `production_source/` at build time).
2. **CI quality gates** (commits `0f39672`, `2f39be2`) - `npm test`, `scripts/check-links.js` (local link/asset/anchor integrity) and Lighthouse budgets (`lighthouserc.json`) run on every push/PR to main.
3. **TBT / inline CSS** (commits `65e05a4`, `ff05dcd`) - the 424-line unminified inline `<style>` block moved into `styles.css` (now minified). Fixed the silently broken CSS minification (`npx clean-css` never resolved; `build.js` now uses the clean-css library API and treats minify failure as fatal).
4. **Version drift** (commit `693f87c`) - `VERSION` is the single source of truth; `build.js` syncs (never bumps); `test.js` fails if source or `deploy/` disagree with `VERSION`. Root `.gitattributes` added (LF normalization; no more phantom diffs).
5. **First-load video bytes** (commit `ff05dcd`) - dropped the `book-experiment.mp4` head preload; workflow video lazy-loads via IntersectionObserver; hero video skipped on Save-Data/2G; umami preconnects; play/pause button reflects real state.
6. **Hero video re-encode - evaluated and declined** (2026-09-30) - the 8.9 MB `hero-loop.mp4` is already efficiently encoded (1280x720, ~500 kbps, 145 s). CRF re-encodes gave no meaningful win (8.45 MB at crf 26, 7.02 MB at crf 28). The only real lever is shortening the 145 s loop (60 s -> 4.1 MB, 30 s -> 2.5 MB), which was declined to keep the full footage. **The original video stays; do not re-propose re-encoding it** unless the length policy changes. The CI performance budget stays at 0.7 accordingly (measured ~0.75).
7. **Accessibility: contrast + reduced motion** (commit `0337cdc`) - `.benefit-number` switched to `--gray-500` (4.83:1, passes WCAG AA); `prefers-reduced-motion` disables animations/transitions/smooth scrolling, shows the hero poster instead of autoplaying, skips unattended workflow playback, and uses instant anchor scrolling; unmuting the hero video now also starts playback if paused (note: the current `hero-loop.mp4` has **no audio track** - the sound button will be audible once a version with audio is supplied).

## Pending

1. **Video captions** - the hero `<video>` needs a `<track kind="captions">` for the last Lighthouse a11y point (96 -> 100). Waiting on the `.vtt` file from Karel; then add `<track kind="captions" srclang="en" src="assets/videos/hero-captions.vtt">` inside the hero video element, bump `VERSION`, build, commit. Until then the a11y budget (0.9) still passes; only the perfect score is held back.

## Reminders

- Release ritual: edit `VERSION` (PATCH) -> `cd production_source && npm run build:full` -> commit source + `deploy/` together. Never bump versions anywhere else; the build syncs and `npm test` enforces.
- `deploy/` is CI-built and auto-committed on main; the Lighthouse CI report links appear in the run log (temporary public storage).
- Docs (`README.md`, `AGENTS.md`, `production_source/AGENTS.md`, this file) must be updated in the same commit as any major change (see root `AGENTS.md`).
