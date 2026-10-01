# Remote Labs Website - Agent Guide

**Before planning any work in this repository, read `TODO.md` at the repo
root.** It tracks completed and pending website improvements (performance,
accessibility, versioning, CI) with commit references and lists the current
priorities. Take it into consideration during chats and when planning
changes.

Keep `TODO.md` accurate as you work:

- When an item is finished, move it to the Done section with the commit hash.
- When you discover a new issue or follow-up, add it to Pending.
- Do not delete historical entries; they are the handover record.

## Keep documentation current

These documents must be reviewed and updated in the same change whenever
you make a major change (new feature, workflow or build change, repo
structure change), and periodically otherwise:

- `README.md` — handover guide (folder structure, workflows, caching, build commands)
- `production_source/AGENTS.md` — detailed development guide
- `TODO.md` — improvement tracker
- This file

Stale documentation is a defect: if a command, version ritual, file list,
or behaviour description in the docs no longer matches reality, update the
docs in the same commit as the change.

Essential context for any change:

- `production_source/AGENTS.md` is the detailed development guide
  (structure, standards, caching, testing, deployment).
- The root `VERSION` file is the single source of truth for asset/cache
  versions. Release ritual: bump `VERSION`, run
  `cd production_source && npm run build:full`, commit source and `deploy/`
  together. The build syncs version strings; it never bumps. `npm test`
  fails if source or `deploy/` drift from `VERSION`.
- CI (`.github/workflows/build-and-deploy.yml`) runs `npm test`,
  `node scripts/check-links.js deploy` and Lighthouse budgets
  (`lighthouserc.json`) on every push/PR to main, then auto-commits the
  rebuilt `deploy/` on main.
- CSS minification uses the clean-css library API in `build.js`; a failed
  minification is fatal by design - never reintroduce a silent fallback.
