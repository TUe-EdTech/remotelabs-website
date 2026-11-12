// Render smoke test for the built site. Serves deploy/ locally, loads each
// page in headless Chrome and asserts that the CSS actually applies.
//
// Why: in v2.1.20 the critical-CSS block was swallowed by an HTML comment
// and the site shipped unstyled - every static check passed, Lighthouse
// still scored well, and only the live page looked broken. This check
// fails the build in that situation.
//
// Usage: node check-render.js [deployDir]   (default: ../deploy)
// Chrome is found via chrome-launcher (CHROME_PATH env var overrides).
// Run with: npm run test:render

'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = __dirname;
const DEPLOY = path.resolve(process.argv[2] || path.join(ROOT, '../deploy'));
// Keep in sync with PAGES in test.js.
const PAGES = ['index.html', 'privacy.html'];

const MIME = {
  '.html': 'text/html', '.shtml': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.txt': 'text/plain', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon'
};

let failures = 0;

function fail(page, msg) {
  console.error(`  FAIL ${page}: ${msg}`);
  failures++;
}

function ok(msg) {
  console.log(`  ok   ${msg}`);
}

function serve() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath.endsWith('/')) urlPath += 'index.html';
      const file = path.resolve(DEPLOY, '.' + urlPath);
      if (!file.startsWith(DEPLOY) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Content-Length': fs.statSync(file).size });
      fs.createReadStream(file).pipe(res);
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function evaluate(client, expression) {
  const { Runtime } = client;
  const { result, exceptionDetails } = await Runtime.evaluate({ expression, returnByValue: true });
  if (exceptionDetails) throw new Error(exceptionDetails.text || 'evaluate failed');
  return result.value;
}

async function main() {
  if (!fs.existsSync(DEPLOY)) {
    console.error(`deploy dir not found: ${DEPLOY} - run npm run build:full first`);
    process.exit(1);
  }
  const { launch } = require('chrome-launcher');
  const CDP = require('chrome-remote-interface');

  const server = await serve();
  const port = server.address().port;
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-render-'));
  const chrome = await launch({
    chromeFlags: ['--no-sandbox', '--disable-gpu', '--headless=new', '--disable-dev-shm-usage',
      '--user-data-dir=' + userDataDir],
    logLevel: 'error'
  });

  console.log(`\nRender checks (serving ${DEPLOY} on 127.0.0.1:${port}):`);
  try {
    const client = await CDP({ port: chrome.port });
    const { Page } = client;
    await Page.enable();

    for (const page of PAGES) {
      const url = `http://127.0.0.1:${port}/${page}`;
      await Page.navigate({ url });

      // Wait for DOMContentLoaded by polling readyState (the
      // Page.domContentLoadedEventFired event is not emitted reliably by
      // all headless Chrome versions).
      const poll = async (expr) => {
        for (let i = 0; i < 100; i++) {
          const v = await evaluate(client, expr);
          if (v) return v;
          await new Promise((r) => setTimeout(r, 50));
        }
        return await evaluate(client, expr);
      };
      await poll(`document.readyState !== 'loading' ? document.readyState : ''`);

      // 1. Critical CSS must be applied at first paint, before the async
      //    stylesheet swap: the inline #critical-css element must exist in
      //    the DOM with rules (a comment-swallowed block is absent), and body
      //    must already be reset (margin 0) and using the site font.
      const atDcl = await evaluate(client, `(() => {
        const el = document.getElementById('critical-css');
        const cs = getComputedStyle(document.body);
        return {
          hasPlaceholder: !!el,
          criticalRules: el && el.sheet ? el.sheet.cssRules.length : 0,
          bodyMargin: cs.margin,
          bodyFont: cs.fontFamily
        };
      })()`);
      if (!atDcl.hasPlaceholder) {
        fail(page, 'no #critical-css element in the DOM - the placeholder was swallowed (e.g. by an HTML comment)');
      } else if (atDcl.criticalRules === 0) {
        fail(page, '#critical-css exists but has 0 CSS rules');
      } else {
        ok(`${page} critical-css applied at first paint (${atDcl.criticalRules} rules)`);
      }
      if (atDcl.bodyMargin !== '0px') {
        fail(page, `body margin at first paint is '${atDcl.bodyMargin}' (UA default 8px) - critical CSS not in effect, page renders unstyled`);
      }
      if (!/lato/i.test(atDcl.bodyFont)) {
        fail(page, `body font at first paint is '${atDcl.bodyFont}' - stylesheet not applied`);
      }

      // 2. After load, script.js must have swapped the async stylesheet to
      //    media="all" and the full stylesheet must be in effect.
      let after = null;
      for (let i = 0; i < 100; i++) {
        after = await evaluate(client, `(() => {
          const link = document.getElementById('async-stylesheet');
          const header = document.querySelector('.main-header');
          const links = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => ({
            href: l.getAttribute('href'),
            media: l.media,
            rules: l.sheet ? l.sheet.cssRules.length : -1
          }));
          return {
            readyState: document.readyState,
            asyncMedia: link ? link.media : null,
            asyncRules: link && link.sheet ? link.sheet.cssRules.length : 0,
            headerPos: header ? getComputedStyle(header).position : null,
            links
          };
        })()`);
        if (after.readyState === 'complete' && after.asyncMedia === 'all' && after.asyncRules > 0) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      if (after.asyncMedia !== 'all' || after.asyncRules === 0) {
        fail(page, `async stylesheet not applied after load (media=${after.asyncMedia}, rules=${after.asyncRules})`);
      } else {
        ok(`${page} styles.min.css applied (${after.asyncRules} rules, media=${after.asyncMedia})`);
      }
      if (after.headerPos && after.headerPos !== 'fixed') {
        fail(page, `.main-header position is '${after.headerPos}', expected 'fixed' - full stylesheet not in effect`);
      }
      for (const l of after.links) {
        if (/^https?:/.test(l.href || '')) continue; // external (none expected, but skip)
        if (l.rules <= 0) fail(page, `local stylesheet '${l.href}' did not load (media=${l.media})`);
      }
    }
    await client.close();
  } finally {
    await Promise.resolve(chrome.kill()).catch(() => {});
    server.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }

  console.log('\n' + (failures === 0 ? 'All render checks passed.' : `${failures} render check(s) failed.`));
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
