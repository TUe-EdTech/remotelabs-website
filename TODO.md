# Website Improvement Tracker

## Done

1. **Repo debt** (commit `4fc02dd`) - untracked `production_source/node_modules` (169 files); `experimental/assets` deduplicated (shared assets now come from `production_source/` at build time).
2. **CI quality gates** (commits `0f39672`, `2f39be2`) - `npm test`, `scripts/check-links.js` (local link/asset/anchor integrity) and Lighthouse budgets (`lighthouserc.json`) run on every push/PR to main.
3. **TBT / inline CSS** (commits `65e05a4`, `ff05dcd`) - the 424-line unminified inline `<style>` block moved into `styles.css` (now minified). Fixed the silently broken CSS minification (`npx clean-css` never resolved; `build.js` now uses the clean-css library API and treats minify failure as fatal).
4. **Version drift** (commit `693f87c`) - `VERSION` is the single source of truth; `build.js` syncs (never bumps); `test.js` fails if source or `deploy/` disagree with `VERSION`. Root `.gitattributes` added (LF normalization; no more phantom diffs).
5. **First-load video bytes** (commit `ff05dcd`) - dropped the `book-experiment.mp4` head preload; workflow video lazy-loads via IntersectionObserver; hero video skipped on Save-Data/2G; umami preconnects; play/pause button reflects real state.

## Pending (in priority order)

1. **Hero video re-encode** - the biggest remaining perf lever (performance measured 0.75 in CI; budget currently 0.7). Step-by-step:

   **Step 1 - Install ffmpeg (Windows, one time)**

   In PowerShell or CMD:

   ```
   winget install --id Gyan.FFmpeg -e
   ```

   (Alternative: download the "release full" build from https://www.gyan.dev/ffmpeg/builds/,
   unzip to `C:\ffmpeg`, and add `C:\ffmpeg\bin` to the PATH.)
   Close and reopen the terminal, then verify:

   ```
   ffmpeg -version
   ```

   (WSL alternative: `sudo apt install ffmpeg`.)

   **Step 2 - Inspect the current video**

   ```
   cd production_source/assets/videos
   ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,bit_rate -of default=noprint_wrappers=1 hero-loop.mp4
   ```

   Note the dimensions. The hero is displayed at ~651-1302 px wide, so a
   1920px-wide source can also be scaled down for extra savings.

   **Step 3 - Re-encode**

   ```
   ffmpeg -i hero-loop.mp4 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an hero-loop.new.mp4
   ```

   Flags: `-crf 26` sets quality (higher = smaller/worse, lower =
   bigger/better; try 23-28); `-preset slow` = better compression for the
   same quality; `-pix_fmt yuv420p` = maximum device compatibility;
   `+faststart` = the video starts playing before it finishes downloading;
   `-an` = drop audio (the hero is muted anyway).

   If Step 2 showed a width above ~1300, add a scale filter for roughly
   half the size at the same visual quality:

   ```
   ffmpeg -i hero-loop.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an hero-loop.new.mp4
   ```

   **Step 4 - Compare and review**

   ```
   ls -lh hero-loop.mp4 hero-loop.new.mp4
   ```

   Target roughly 1-2 MB (from 8.9 MB). Play `hero-loop.new.mp4` and watch
   a full loop next to the original. If it looks too compressed, re-encode
   with `-crf 24` (or 22); still acceptable size is a win.

   **Step 5 - Replace and release**

   ```
   # from the repo root
   move the new file over production_source\assets\videos\hero-loop.mp4
   # bump the version in the VERSION file: 2.1.7 -> 2.1.8
   cd production_source
   npm run build:full
   npm test
   cd ..
   node scripts/check-links.js deploy
   ```

   Then commit source + `deploy/` together and push. CI rebuilds and runs
   all gates; check the Lighthouse step log for the new performance score.

   **Step 6 - Ratchet the budget**

   Once CI shows performance comfortably above 0.7 (expect 0.85+ after the
   re-encode), raise the `lighthouserc.json` performance floor toward 0.9
   (the AGENTS.md target is 90+) so regressions get caught early.

2. **Accessibility 96 -> 100** (from the CI Lighthouse report):
   - Insufficient contrast on the four `.benefit-number` elements (01-04, benefits section; currently `color: var(--gray-400)`).
   - Hero `<video>` has no `<track kind="captions">` (or explicit decorative treatment).

3. **`prefers-reduced-motion` support** - zero occurrences today despite autoplaying videos, smooth scrolling, a pulsing-dot animation and hover transforms (WCAG 2.3.3). Pairs with item 1: the reduced-motion path would show the hero poster instead of autoplaying.

## Reminders

- Release ritual: edit `VERSION` (PATCH) -> `cd production_source && npm run build:full` -> commit source + `deploy/` together. Never bump versions anywhere else; the build syncs and `npm test` enforces.
- `deploy/` is CI-built and auto-committed on main; the Lighthouse CI report links appear in the run log (temporary public storage).
