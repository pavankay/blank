// Cross-platform check: serves social-network look-alike pages under their real hostnames
// (DNS mapped to a local HTTPS server) and verifies what the extension shields on each.
// Run: node tests/social.e2e.js
const { chromium } = require('playwright');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const fixtures = require('./social-fixtures');

const EXT = path.resolve(__dirname, '..');
const SHOTS = process.env.SHOTS_DIR || null;

function cert() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gss-cert-'));
  const key = path.join(dir, 'key.pem');
  const crt = path.join(dir, 'cert.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', crt, '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
  return { key: fs.readFileSync(key), cert: fs.readFileSync(crt) };
}

function serve() {
  const byKey = new Map(fixtures.map((f) => { const u = new URL(f.url); return [u.hostname + u.pathname, f]; }));
  return new Promise((resolve) => {
    const srv = https.createServer(cert(), (req, res) => {
      const host = (req.headers.host || '').split(':')[0];
      const f = byKey.get(host + req.url.split('?')[0]);
      if (!f) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(f.html);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const port = srv.address().port;
  const ctx = await chromium.launchPersistentContext('', {
    headless: true,
    channel: 'chromium',
    ignoreHTTPSErrors: true,
    args: [
      `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`,
      '--host-resolver-rules=MAP * 127.0.0.1', '--no-proxy-server', '--ignore-certificate-errors'
    ]
  });
  let failed = 0;
  let passed = 0;
  try {
    if (!ctx.serviceWorkers().length) await ctx.waitForEvent('serviceworker', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 500));
    for (const p of ctx.pages()) if (p.url().includes('options.html')) await p.close();

    for (const f of fixtures) {
      const u = new URL(f.url);
      u.port = String(port);
      const page = await ctx.newPage();
      await page.setViewportSize({ width: 900, height: 700 });
      await page.goto(u.toString());
      await page.waitForTimeout(1500);

      const report = await page.evaluate(() => {
        const deepAll = (root) => {
          const out = [...root.querySelectorAll('[id^="s-"], [id^="ok-"]')];
          for (const el of root.querySelectorAll('*')) if (el.shadowRoot) out.push(...deepAll(el.shadowRoot));
          return out;
        };
        const covered = (el) => {
          let n = el;
          while (n) {
            if (n.closest && n.closest('.gss-shielded')) return true;
            const r = n.getRootNode();
            n = r && r.host ? r.host : null;
          }
          return false;
        };
        return {
          pageShield: !!document.querySelector('gss-page-shield'),
          items: deepAll(document).map((el) => ({ id: el.id, covered: covered(el) }))
        };
      });

      const problems = [];
      if (f.page && !report.pageShield) problems.push('expected a full-page shield');
      if (!f.page && report.pageShield) problems.push('unexpected full-page shield');
      for (const it of report.items) {
        if (it.id.startsWith('s-') && !it.covered && !report.pageShield) problems.push(`spoiler ${it.id} visible`);
        if (it.id.startsWith('ok-') && (it.covered || report.pageShield)) problems.push(`safe ${it.id} hidden`);
      }
      const spoilers = report.items.filter((i) => i.id.startsWith('s-')).length;
      const safe = report.items.filter((i) => i.id.startsWith('ok-')).length;
      if (problems.length) { failed++; console.log(`  ✗ ${f.name}: ${problems.join('; ')}`); }
      else { passed++; console.log(`  ✓ ${f.name}  (${f.page ? 'page shielded' : `${spoilers} hidden, ${safe} kept`})`); }
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'social-' + u.hostname.replace(/^www\./, '').replace(/\W+/g, '-') + (u.pathname.length > 1 ? '-' + u.pathname.replace(/\W+/g, '') : '') + '.png') });
      await page.close();
    }
  } finally {
    await ctx.close();
    srv.close();
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
