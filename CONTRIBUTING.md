# Contributing

Thanks for your interest in improving the Remote Labs website. This is a
static site; most changes are small. Please read `README.md` (handover guide)
and `AGENTS.md` (workflow rules) first.

## How to contribute

1. **Open an issue first** for anything beyond a trivial fix — describe the
   problem or proposal so it can be discussed.
2. **Fork** the repository and create a branch from `main`
   (`git checkout -b fix/short-description`).
3. Make your changes and verify locally (see below).
4. **Open a pull request** against `main` with a clear description. CI must
   pass (tests, link check, Lighthouse budgets, secret scan).

## Build, test and deploy locally

```bash
cd production_source
npm install          # once
npm run build:full   # canonical build: syncs VERSION, minifies, fills ../deploy/
npm test             # source + deploy/ + VERSION consistency tests
node ../scripts/check-links.js ../deploy   # link/asset integrity
```

Release ritual (required whenever `production_source/` changes):

1. Bump `VERSION` at the repo root — `node scripts/bump-version.js` bumps
   PATCH and builds in one step.
2. Commit **source and `deploy/` together**; CI rebuilds and auto-commits
   `deploy/` on `main` after merge.

## Style

- `production_source/` uses Prettier (`.prettierrc`) and ESLint
  (`.eslintrc.json`); match the existing style of the file you edit.
- Keep diffs minimal; don't reformat unrelated code.
- Update the docs (`README.md`, `AGENTS.md`, `production_source/AGENTS.md`,
  `TODO.md`) in the same commit when a change affects them.

## Commit messages

Short imperative subject (e.g. `Fix CSP for status badge`), body explaining
why when not obvious. Don't include secrets or personal data in commits —
the history is public.

## License

By contributing, you agree that your contributions are licensed under the
MIT License (`LICENSE`) for code and CC BY-SA 4.0 (`CONTENT-LICENSE.md`) for
content, and that you have the right to submit them under those terms.
