# Remote Labs Website

[![CI](https://github.com/TUe-EdTech/remotelabs-website/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/TUe-EdTech/remotelabs-website/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-lightgrey.svg)](CONTENT-LICENSE.md)

The official website of **Remote Labs** at Eindhoven University of Technology
(TU/e) — a static site presenting our 24/7 remote access to physical lab
experiments.

- **Live site**: <https://remote-labs.eu>
- **Remote Labs platform** (the app students log into): <https://remotelabs.tue.nl>

## Features

- Pure static site: HTML/CSS/JS, no server-side code, no database, no cookies,
  no tracking without your consent
- Progressive Web App: service worker with network-first HTML, cache-first
  versioned assets, offline support
- Loading placeholders for lazy media (shimmer behind images, poster panel
  on the workflow video) so below-the-fold content never shows as a blank box
- Accessibility and performance budgets enforced in CI (Lighthouse)
- Strict Content-Security-Policy (no inline scripts), SRI-pinned analytics
  loaded only after consent, full security header set via `.htaccess`
- Privacy policy page (GDPR); cookieless Umami analytics is consent-gated
  (banner in `consent.js`), never loaded before consent, DNT honoured
- Custom error pages, sitemap, robots.txt, web app manifest

## Quick start

No build step is required to serve the site — `deploy/` is ready to upload:

```bash
# View locally: just open deploy/index.html in a browser

# Deploy your own copy: upload the contents of deploy/ to any static web host
```

To work on the site itself:

```bash
git clone https://github.com/TUe-EdTech/remotelabs-website.git
cd remotelabs-website/production_source
npm install            # once
npm run build:full     # canonical build: syncs VERSION, minifies, fills ../deploy/
npm test               # source + deploy/ + VERSION consistency tests
npm run test:render    # headless-Chrome check that deploy/ actually renders styled
node ../scripts/check-links.js ../deploy   # link/asset integrity
```

## Repository structure

```
remotelabs-website/
├── README.md                     # This file
├── AGENTS.md                     # Agent/contributor guide (read before planning work)
├── TODO.md                       # Open improvement items
├── LICENSE                       # MIT license for code
├── CONTENT-LICENSE.md            # CC BY-SA 4.0 for website content
├── THIRD-PARTY-NOTICES.md        # Fonts, logos, media credits and terms
├── CONTRIBUTING.md               # How to contribute (issues, PRs, build, tests)
├── SECURITY.md                   # Vulnerability reporting policy
├── CODE_OF_CONDUCT.md            # Contributor Covenant 2.1
├── VERSION                       # Single source of truth for asset/cache versions
├── .github/                      # CI + repo config (workflows, CODEOWNERS, Dependabot)
├── deploy/                       # Built production site - upload this to the web server
│   ├── index.html                # Main page
│   ├── privacy.html              # Privacy policy
│   ├── styles.min.css            # Minified styles (versioned ?v= from VERSION)
│   ├── script.min.js             # Minified JavaScript
│   ├── sw.js                     # Service worker (cache name from VERSION)
│   ├── manifest.json / robots.txt / sitemap.xml / .htaccess / icons
│   ├── assets/                   # Images, videos, logos, fonts, publications
│   └── 400-500.shtml             # Custom error pages
├── production_source/            # Development source of truth (edit here, never in deploy/)
│   ├── index.html / privacy.html / styles.css / script.js / sw.js
│   ├── build.js                  # Canonical build
│   ├── test.js                   # Consistency tests (npm test)
│   ├── check-render.js           # Render smoke test (npm run test:render, headless Chrome)
│   ├── AGENTS.md                 # Detailed development guide
│   └── package.json              # Build/test tooling (clean-css, uglify-js, chrome-launcher, chrome-remote-interface)
├── experimental/                 # Sandbox for trying out redesigns before production
├── experimental_deploy/          # Experimental build output (gitignored)
├── scripts/                      # Utility scripts (build-experimental, check-links, verify-live, bump-version, ...)
└── lighthouserc.json             # CI Lighthouse budgets
```

## Development workflow

1. Edit files in `production_source/` (never edit `deploy/` directly — it is
   CI-built).
2. Bump the root `VERSION` file when assets change and visitors must get fresh
   copies — `node scripts/bump-version.js` bumps PATCH and builds in one step.
   The build syncs the version into `sw.js`, the HTML files and `fonts.css`;
   never hand-edit `?v=` strings or `CACHE_NAME`.
3. Rebuild: `cd production_source && npm run build:full`
4. Verify: `npm test` and `node scripts/check-links.js deploy`
5. Commit **source and `deploy/` together**. CI rebuilds, re-runs all gates and
   auto-commits the `deploy/` output on `main`.
6. Upload `deploy/` to the web server, then run `node scripts/verify-live.js`
   from the repo root: it re-downloads every file from the live server and
   fails on any non-200 or byte-count mismatch. A truncated upload once
   shipped 0-byte `styles.min.css`/`script.min.js` (v2.1.33) — an unstyled
   site — while all local checks stayed green, so never skip this step.

`npm test` fails if `VERSION`, the sources or `deploy/` disagree, so version
drift cannot ship. The versioning model (service-worker cache name + immutable
`?v=` asset URLs) is what makes deployments cache-safe; the details and the
caching troubleshooting guide live in `production_source/AGENTS.md`.

To try out a redesign, edit `experimental/` and preview with
`node scripts/build-experimental.js` (output in `experimental_deploy/`), then
sync approved changes into `production_source/` with
`node scripts/sync-experimental.js`.

### CI gates (every push/PR to `main`)

1. `npm test` — syntax, CSP (no inline scripts), version consistency
2. `npm run test:render` — headless Chrome loads the built pages and asserts the
   render-blocking CSS applies at first paint (catches e.g. the stylesheet link
   being swallowed by an HTML comment, which shipped an unstyled page in v2.1.20
   despite passing all static checks)
3. `scripts/check-links.js deploy` — every local link/asset/anchor resolves
4. Lighthouse budgets (`lighthouserc.json`) — accessibility / best-practices /
   SEO >= 0.9, performance >= 0.7
4. gitleaks secret scan (`.github/workflows/secrets-scan.yml`, plus a weekly
   full-history scan)

## Security

Security headers (CSP via `<meta>`, the rest via `deploy/.htaccess`), SRI on
the consent-gated analytics script, and a strict no-inline-script policy are
enforced by `npm test` and CI. To report a vulnerability, see [SECURITY.md](SECURITY.md) —
please do not open public issues for security reports.

## Contributing

Contributions are welcome — please read [CONTRIBUTING.md](CONTRIBUTING.md) and
our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) first. Open an issue to discuss
bigger changes before opening a PR.

## License

- **Code** (HTML/CSS/JS sources, build and CI scripts): [MIT](LICENSE)
- **Website content** (text, images, videos): [CC BY-SA 4.0](CONTENT-LICENSE.md)
- **Third-party assets** (fonts, logos, magazine PDF): see
  [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) — they remain the property
  of their owners and are used with permission

## Contact

Maintained by **Karel Aarts** (DRIVE, Eindhoven University of Technology) —
k.m.a.aarts@tue.nl. Issues and pull requests via GitHub.
