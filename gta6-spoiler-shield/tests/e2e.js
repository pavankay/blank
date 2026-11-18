// End-to-end check: loads the unpacked extension into Chromium and runs it against local fixture pages.
// Run: node tests/e2e.js   (needs the playwright package and a Chromium build)
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const EXT = path.resolve(__dirname, '..');
const FIX = path.join(__dirname, 'fixtures');
const SHOTS = process.env.SHOTS_DIR || null;
const CATS = require('../packs/gta6.json').categories.length;

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const name = (req.url.split('?')[0].replace(/^\/+/, '') || 'feed.html').replace(/\.\./g, '');
      const file = path.join(FIX, name.split('/').pop());
      if (!fs.existsSync(file)) { res.writeHead(404); res.end('nope'); return; }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(file));
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const ctx = await chromium.launchPersistentContext('', {
    headless: true,
    channel: 'chromium',
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`]
  });
  let failures = 0;
  const check = async (name, fn) => {
    try { await fn(); console.log('  ✓', name); } catch (e) { failures++; console.log('  ✗', name, '\n    ', e.message); }
  };

  try {
    let [sw] = ctx.serviceWorkers();
    if (!sw) sw = await ctx.waitForEvent('serviceworker', { timeout: 10000 });
    const extId = sw.url().split('/')[2];
    console.log('extension loaded:', extId);

    // Close the welcome tab opened on install.
    await new Promise((r) => setTimeout(r, 500));
    for (const p of ctx.pages()) if (p.url().includes('options.html')) await p.close();

    const page = await ctx.newPage();
    await page.setViewportSize({ width: 1100, height: 760 });
    await page.goto(base + '/feed.html');
    await page.waitForTimeout(1200);

    const shielded = async (id) => page.$eval('#' + id, (el) => el.classList.contains('gss-shielded'));

    console.log('feed page');
    await check('story spoiler card is shielded', async () => assert.ok(await shielded('a1')));
    await check('plain release news stays visible', async () => assert.ok(!(await shielded('a2'))));
    await check('map leak card is shielded', async () => assert.ok(await shielded('a3')));
    await check('easter egg card is shielded', async () => assert.ok(await shielded('a5')));
    await check('non-GTA "ending" stays visible', async () => assert.ok(!(await shielded('a6'))));
    await check('card added later is shielded', async () => assert.ok(await shielded('late')));
    await check('recycled card becomes shielded', async () => assert.ok(await shielded('a4')));
    await check('overlay adds no text to the page', async () => {
      const t = await page.$eval('#a1', (el) => el.querySelector('.gss-overlay').textContent);
      assert.equal(t, '');
    });
    await check('overlay names the category', async () => {
      const r = await page.$eval('#a3 .gss-ov-reasons', (el) => el.dataset.t);
      assert.match(r, /Map/);
    });
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'feed-shielded.png') });

    await check('click reveals the card', async () => {
      await page.click('#a1 .gss-overlay');
      assert.ok(!(await shielded('a1')));
    });
    await check('revealed card stays revealed', async () => {
      await page.waitForTimeout(300);
      assert.ok(!(await shielded('a1')));
    });

    console.log('popup');
    const popup = await ctx.newPage();
    await popup.setViewportSize({ width: 388, height: 720 });
    await popup.goto(`chrome-extension://${extId}/src/popup/popup.html`);
    await popup.waitForTimeout(500);
    await check('popup renders categories', async () => assert.equal(await popup.locator('#cats .chip-toggle').count(), CATS));
    if (SHOTS) await popup.screenshot({ path: path.join(SHOTS, 'popup.png'), fullPage: true });

    console.log('live settings');
    await check('turning a category off unshields its cards live', async () => {
      await popup.click('#cats .chip-toggle[data-id="gta6/secrets"]');
      await page.waitForTimeout(400);
      assert.ok(!(await shielded('a5')));
      assert.ok(await shielded('a3'));
      await popup.click('#cats .chip-toggle[data-id="gta6/secrets"]');
      await page.waitForTimeout(400);
      assert.ok(await shielded('a5'));
    });
    await check('a card in two categories stays shielded while either is on', async () => {
      await popup.click('#cats .chip-toggle[data-id="gta6/map"]');
      await page.waitForTimeout(400);
      assert.ok(await shielded('a3'));
      assert.doesNotMatch(await page.$eval('#a3 .gss-ov-reasons', (el) => el.dataset.t), /Map/);
      await popup.click('#cats .chip-toggle[data-id="gta6/map"]');
      await page.waitForTimeout(400);
    });
    await check('blackout mode shields plain news', async () => {
      await popup.click('#sensitivity button[data-v="strict"]');
      await page.waitForTimeout(400);
      assert.ok(await shielded('a2'));
      await popup.click('#sensitivity button[data-v="balanced"]');
      await page.waitForTimeout(400);
      assert.ok(!(await shielded('a2')));
    });
    await check('quick keyword shields any text', async () => {
      await popup.fill('#quickInput', 'cozy');
      await popup.press('#quickInput', 'Enter');
      await page.waitForTimeout(400);
      assert.ok(await page.$eval('#a4', (el) => el.classList.contains('gss-shielded')));
    });
    await check('master switch turns everything off', async () => {
      await popup.click('.switch.big');
      await page.waitForTimeout(400);
      assert.equal(await page.locator('.gss-shielded').count(), 0);
      await popup.click('.switch.big');
      await page.waitForTimeout(400);
      assert.ok((await page.locator('.gss-shielded').count()) > 0);
    });

    console.log('page shield');
    const art = await ctx.newPage();
    await art.setViewportSize({ width: 1100, height: 760 });
    await art.goto(base + '/article.html');
    await art.waitForTimeout(800);
    await check('spoiler article gets a full-page shield', async () => {
      assert.equal(await art.locator('gss-page-shield').count(), 1);
      assert.ok(await art.evaluate(() => document.documentElement.classList.contains('gss-page-locked')));
    });
    await check('tab title is hidden', async () => assert.match(await art.title(), /Spoiler shielded/));
    if (SHOTS) await art.screenshot({ path: path.join(SHOTS, 'page-shield.png') });

    const safe = await ctx.newPage();
    await safe.goto(base + '/safe.html');
    await safe.waitForTimeout(600);
    await check('unrelated page is untouched', async () => {
      assert.equal(await safe.locator('gss-page-shield').count(), 0);
      assert.equal(await safe.locator('.gss-shielded').count(), 0);
    });

    console.log('options');
    const opt = await ctx.newPage();
    await opt.setViewportSize({ width: 1200, height: 900 });
    await opt.goto(`chrome-extension://${extId}/src/options/options.html`);
    await opt.waitForTimeout(500);
    await check('options lists categories', async () => assert.equal(await opt.locator('#catList .cat').count(), CATS));
    await check('test lab judges text', async () => {
      await opt.fill('#labInput', 'GTA 6 ending explained');
      assert.match(await opt.textContent('#labOut'), /Would be shielded/);
      await opt.fill('#labInput', 'Banana bread ending');
      assert.match(await opt.textContent('#labOut'), /Would stay visible/);
    });
    await check('custom rule can be added', async () => {
      await opt.fill('#ruleLabel', 'Spanish spoilers');
      await opt.fill('#ruleTerms', 'muere, traición*');
      await opt.click('#ruleSubmit');
      await opt.waitForTimeout(300);
      assert.equal(await opt.locator('#ruleList .rule').count(), 1);
    });
    if (SHOTS) {
      await opt.fill('#labInput', 'Full GTA VI map leaked, every location compared');
      await opt.screenshot({ path: path.join(SHOTS, 'options.png'), fullPage: true });
    }
  } finally {
    await ctx.close();
    srv.close();
  }
  console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
})();
