// Proves the shield is data-driven: installs a pack from a link, updates it remotely, writes a pack
// and a site rule in the settings editor, and turns the bundled pack off. No extension code changes.
// Run: node tests/packs.e2e.js
const { chromium } = require('playwright');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { execFileSync } = require('child_process');

const EXT = path.resolve(__dirname, '..');

function cert() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gss-cert-'));
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(dir, 'k.pem'), '-out', path.join(dir, 'c.pem'), '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
  return { key: fs.readFileSync(path.join(dir, 'k.pem')), cert: fs.readFileSync(path.join(dir, 'c.pem')) };
}

// A pack for a made-up show, served from a "remote" host. Version 2 adds a word after launch.
let packVersion = 1;
const starfall = () => ({
  format: 'spoiler-shield-pack@1',
  id: 'starfall', name: 'Starfall Saga', short: 'Starfall', version: String(packVersion),
  description: 'A made-up show for testing.',
  context: { strong: ['starfall saga', 'starfall'], weak: [], names: [] },
  categories: [{
    id: 'story', label: 'Story', emoji: '📖', defaultOn: true,
    terms: ['finale', 'dies', 'twist'].concat(packVersion > 1 ? ['the duke returns'] : []),
    strong: ['finale', 'dies']
  }]
});

const pages = {
  'news.example.test/': `<!doctype html><title>Entertainment news</title><body>
    <article id="a1"><h2>Starfall Saga finale: who dies?</h2></article>
    <article id="a2"><h2>Starfall: the duke returns in episode 9</h2></article>
    <article id="a3"><h2>GTA 6 ending explained</h2></article>
    <article id="a4"><h2>Weather this weekend</h2></article>
    <article id="a5"><h2>Moonfall Chronicles: shocking twist in the finale</h2></article></body>`,
  'forum.example.test/': `<!doctype html><title>Forum</title><body><div id="wrap">
    <div class="topic-row" id="t1"><span class="t">GTA 6 secret ending found</span><span class="by">by someone</span></div>
    <div class="topic-row" id="t2"><span class="t">Hello everyone</span><span class="by">by someone else</span></div></div></body>`
};

function serve() {
  return new Promise((resolve) => {
    const srv = https.createServer(cert(), (req, res) => {
      const host = (req.headers.host || '').split(':')[0];
      if (host === 'packs.example.test' && req.url.startsWith('/starfall.json')) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(starfall()));
        return;
      }
      const html = pages[host + req.url.split('?')[0]];
      if (!html) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const port = srv.address().port;
  const at = (host, p = '/') => `https://${host}:${port}${p}`;
  const ctx = await chromium.launchPersistentContext('', {
    headless: true, channel: 'chromium', ignoreHTTPSErrors: true,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--host-resolver-rules=MAP * 127.0.0.1', '--no-proxy-server', '--ignore-certificate-errors']
  });
  let failures = 0;
  const check = async (name, fn) => {
    try { await fn(); console.log('  ✓', name); } catch (e) { failures++; console.log('  ✗', name, '\n    ', e.message.split('\n')[0]); }
  };

  try {
    let [sw] = ctx.serviceWorkers();
    if (!sw) sw = await ctx.waitForEvent('serviceworker', { timeout: 10000 });
    const extId = sw.url().split('/')[2];
    await new Promise((r) => setTimeout(r, 800));
    for (const p of ctx.pages()) if (p.url().includes('options.html')) await p.close();

    const opt = await ctx.newPage();
    await opt.setViewportSize({ width: 1200, height: 900 });
    await opt.goto(`chrome-extension://${extId}/src/options/options.html`);
    await opt.waitForTimeout(500);

    const news = await ctx.newPage();
    await news.goto(at('news.example.test'));
    await news.waitForTimeout(800);
    const covered = (pg, id) => pg.$eval('#' + id, (el) => !!el.closest('.gss-shielded'));

    console.log('bundled pack only');
    await check('GTA VI pack ships as data and works', async () => assert.ok(await covered(news, 'a3')));
    await check('an unknown show is not shielded yet', async () => assert.ok(!(await covered(news, 'a1'))));

    console.log('install a pack from a link');
    await check('pack installs from an https link', async () => {
      await opt.fill('#subscribeUrl', at('packs.example.test', '/starfall.json'));
      await opt.click('#subscribeForm button[type="submit"]');
      await opt.waitForFunction(() => /Installed Starfall Saga/.test(document.getElementById('packMsg').textContent), null, { timeout: 5000 });
      assert.match(await opt.textContent('#packList'), /Starfall Saga/);
    });
    await check('open pages pick up the new pack live', async () => {
      await news.waitForTimeout(600);
      assert.ok(await covered(news, 'a1'));
      assert.ok(!(await covered(news, 'a2')), 'v1 has no "the duke returns" yet');
      assert.ok(!(await covered(news, 'a4')));
    });
    await check('overlay says which pack it came from', async () => {
      assert.match(await news.$eval('#a1 .gss-ov-reasons', (el) => el.dataset.t), /Starfall · Story/);
    });

    console.log('remote update');
    await check('a new word published at the link reaches pages after an update check', async () => {
      packVersion = 2;
      await opt.click('#updateAllBtn');
      await opt.waitForFunction(() => /Updated: Starfall Saga/.test(document.getElementById('packMsg').textContent), null, { timeout: 5000 });
      await news.waitForTimeout(600);
      assert.ok(await covered(news, 'a2'));
    });

    console.log('write a pack in the editor');
    await check('a pack written in settings works immediately', async () => {
      await opt.click('#newPackBtn');
      const pack = {
        format: 'spoiler-shield-pack@1', id: 'moonfall', name: 'Moonfall Chronicles', short: 'Moonfall', version: '1',
        context: { strong: ['moonfall chronicles'] },
        categories: [{ id: 'twists', label: 'Twists', emoji: '🌀', terms: ['twist', 'finale'] }]
      };
      await opt.fill('#editorText', JSON.stringify(pack, null, 2));
      await opt.click('#editorSave');
      await opt.waitForTimeout(600);
      assert.match(await opt.textContent('#packList'), /Moonfall Chronicles/);
      await news.waitForTimeout(300);
      assert.ok(await covered(news, 'a5'));
    });
    await check('the editor refuses a broken pack', async () => {
      await opt.click('#newPackBtn');
      await opt.fill('#editorText', '{ "name": "Broken" }');
      await opt.click('#editorSave');
      assert.match(await opt.textContent('#editorMsg'), /at least one category/);
      await opt.click('#editorForm button[value="cancel"]');
    });

    console.log('site rules as data');
    const forum = await ctx.newPage();
    await forum.goto(at('forum.example.test'));
    await forum.waitForTimeout(800);
    await check('without a rule the generic detector covers the row', async () => assert.ok(await covered(forum, 't1')));
    await check('a site rule written in settings decides the card', async () => {
      await opt.click('#editMySites');
      await opt.fill('#editorText', JSON.stringify([{ name: 'Example forum', hosts: ['forum.example.test'], selectors: ['span.t'] }]));
      await opt.click('#editorSave');
      await forum.waitForTimeout(800);
      const shieldedTag = await forum.$eval('.gss-shielded', (el) => el.tagName + '.' + el.className.split(' ')[0]);
      assert.equal(shieldedTag, 'SPAN.t');
      assert.ok(!(await covered(forum, 't2')));
    });

    console.log('packs can be switched off');
    await check('turning the GTA VI pack off stops GTA VI shielding', async () => {
      await opt.click('.pack:has-text("GTA VI") .switch');
      await news.waitForTimeout(600);
      assert.ok(!(await covered(news, 'a3')));
      assert.ok(await covered(news, 'a1'));
    });

    console.log('popup follows the packs');
    await check('popup shows each pack and its categories', async () => {
      const pop = await ctx.newPage();
      await pop.goto(`chrome-extension://${extId}/src/popup/popup.html`);
      await pop.waitForTimeout(500);
      const heads = await pop.$$eval('.pack-head', (els) => els.map((e) => e.textContent));
      assert.deepEqual(heads.map((h) => h.replace(/ \(off\)$/, '')), ['GTA VI (off)', 'Moonfall Chronicles', 'Starfall Saga'].map((h) => h.replace(/ \(off\)$/, '')));
      assert.equal(await pop.textContent('#edition'), 'Moonfall, Starfall');
      await pop.close();
    });
  } finally {
    await ctx.close();
    srv.close();
  }
  console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
})();
