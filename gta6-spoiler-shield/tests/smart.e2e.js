// Smart detection, end to end: spoilers that never say "spoiler".
//   - vague reactions, and GTA VI posts whose only spoiler is the picture (picture covered, title kept)
//   - learning new names from the game wiki
//   - reporting a video: hidden at once, its screenshot caught again under another caption, "not a spoiler" undo
//   - community server: hidden for everyone after 3 different people report it; learned phrases and channels
//   - on-device vision reading text inside a thumbnail (the browser's model is stubbed in the test)
// Runs a local HTTPS server on port 443 standing in for youtube.com, i.ytimg.com and gta.fandom.com.
// Run: node tests/smart.e2e.js
const { chromium } = require('playwright');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { execFileSync } = require('child_process');
const { createServer: createCommunity } = require('../server/server.js');

const EXT = path.resolve(__dirname, '..');
const IMG = path.join(__dirname, 'fixtures', 'images');
const SHOTS = process.env.SHOTS_DIR || null;

function cert() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gss-cert-'));
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(dir, 'k.pem'), '-out', path.join(dir, 'c.pem'), '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
  return { key: fs.readFileSync(path.join(dir, 'k.pem')), cert: fs.readFileSync(path.join(dir, 'c.pem')) };
}

// video id -> thumbnail file
const THUMBS = {
  U1U1U1U1U1U: 'safe1.png', R1R1R1R1R1R: 'safe2.png', X1X1X1X1X1X: 'spoiler.png', X2X2X2X2X2X: 'spoiler-repost.jpg',
  C1C1C1C1C1C: 'safe2.png', A1A1A1A1A1A: 'safe1.png', J1J1J1J1J1J: 'safe2.png', V1V1V1V1V1V: 'vision.png'
};

const card = (id, vid, title, channel = 'Some Channel') => `
  <ytd-rich-item-renderer id="${id}"><div id="content">
    ${vid ? `<ytd-thumbnail><a id="thumbnail" href="https://www.youtube.com/watch?v=${vid}"><img width="320" height="180" src="https://i.ytimg.com/vi/${vid}/hqdefault.jpg" alt=""></a></ytd-thumbnail>` : ''}
    <h3 class="title"><a href="https://www.youtube.com/watch?v=${vid || 'ZZZZZZZZZZ' + id.length}">${title}</a></h3>
    <ytd-channel-name>${channel}</ytd-channel-name>
  </div></ytd-rich-item-renderer>`;

const HOME = `<!doctype html><html><head><meta charset="utf-8"><title>YouTube</title>
<style>body{font-family:system-ui;margin:0;padding:16px;background:#fff} #contents{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
ytd-rich-item-renderer{display:block} ytd-thumbnail,a#thumbnail{display:block} img{display:block;width:100%;height:auto;border-radius:10px}
h3{font-size:14px;margin:8px 0 2px} ytd-channel-name{font-size:12px;color:#606060;display:block}</style></head>
<body><div id="contents">
  ${card('u1', 'U1U1U1U1U1U', 'GTA 6 unlock times confirmed', 'Daily Game News')}
  ${card('r1', 'R1R1R1R1R1R', 'bro what 💀 #GTA6')}
  ${card('x1', 'X1X1X1X1X1X', 'you won’t believe this')}
  ${card('x2', 'X2X2X2X2X2X', 'lol')}
  ${card('c1', 'C1C1C1C1C1C', 'omg')}
  ${card('w1', '', 'Zed Quillfeather is back!!')}
  ${card('n1', '', '#GTA6 Night Owl Express was wild')}
  ${card('l1', '', 'GTA 6 Midnight Ferry')}
  ${card('a1', 'A1A1A1A1A1A', 'new upload', 'Palm Tree Media')}
  ${card('j1', 'J1J1J1J1J1J', 'cooking pasta at home', 'Kitchen Stories')}
  ${card('v1', 'V1V1V1V1V1V', 'you have to see this')}
</div></body></html>`;

// A pretend game wiki that has learned about things that came out after the pack was written.
function wiki(category) {
  const members = {
    'Characters in GTA VI': [{ ns: 0, title: 'Zed Quillfeather' }, { ns: 0, title: 'Unnamed Guard' }, { ns: 0, title: 'Lucia Caminos' }],
    'Missions in GTA VI': [{ ns: 0, title: 'Night Owl Express' }],
    'Locations in GTA VI': [{ ns: 14, title: 'Category:Locations in GTA VI in Vice City' }],
    'Locations in GTA VI in Vice City': [{ ns: 0, title: 'Pelican Pier (GTA VI)' }]
  }[category] || [];
  return { batchcomplete: '', query: { categorymembers: members } };
}

function serveSites() {
  return new Promise((resolve, reject) => {
    const srv = https.createServer(cert(), (req, res) => {
      const host = (req.headers.host || '').split(':')[0];
      const url = new URL(req.url, 'https://x');
      if (host === 'www.youtube.com' && url.pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(HOME);
      }
      if (host === 'i.ytimg.com') {
        const id = url.pathname.split('/')[2];
        const file = THUMBS[id];
        if (!file) { res.writeHead(404); return res.end(); }
        res.writeHead(200, { 'content-type': file.endsWith('.jpg') ? 'image/jpeg' : 'image/png', 'access-control-allow-origin': '*' });
        return res.end(fs.readFileSync(path.join(IMG, file)));
      }
      if (host === 'gta.fandom.com' && url.pathname === '/api.php') {
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify(wiki((url.searchParams.get('cmtitle') || '').replace(/^Category:/, ''))));
      }
      res.writeHead(404);
      res.end();
    });
    srv.on('error', reject);
    srv.listen(443, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const sites = await serveSites().catch((e) => { console.error('Needs port 443 for real-looking URLs:', e.message); process.exit(2); });
  const community = createCommunity({ dataFile: '', trustProxy: true, itemThreshold: 3, hashThreshold: 3, termThreshold: 3, authorThreshold: 3, ratePerHour: 1000 });
  await new Promise((r) => community.server.listen(0, '127.0.0.1', r));
  const communityUrl = `http://127.0.0.1:${community.server.address().port}`;

  // Three other people report things before we start browsing.
  const others = ['10.1.0.1', '10.1.0.2', '10.1.0.3'];
  for (let i = 0; i < others.length; i++) {
    const post = (body) => fetch(communityUrl + '/v1/report', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': others[i] },
      body: JSON.stringify(Object.assign({ client: `someone-else-${i}-0000` }, body))
    });
    await post({ keys: ['youtube:C1C1C1C1C1C'], title: 'omg', packs: ['gta6'] });
    await post({ keys: [`youtube:MF${i}MF${i}MF${i}MF`], title: `the Midnight Ferry part ${i} 😭`, author: 'Palm Tree Media', packs: ['gta6'] });
  }

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
    await new Promise((r) => setTimeout(r, 1000));
    for (const p of ctx.pages()) if (p.url().includes('options.html')) await p.close();

    // Learn from the (pretend) wiki and follow the community server.
    await sw.evaluate(() => learnIfStale(true));
    await sw.evaluate((url) => GSS.settings.update((s) => { s.communityUrl = url; }), communityUrl);
    await sw.evaluate(() => syncCommunity());

    const page = await ctx.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('https://www.youtube.com/');
    await page.waitForTimeout(1500);

    const state = (id) => page.$eval('#' + id, (el) => {
      const card = el.classList.contains('gss-shielded') && !el.classList.contains('gss-media');
      const img = el.querySelector('img');
      const pic = !!(img && img.closest('.gss-shielded'));
      const title = !!el.querySelector('h3').closest('.gss-shielded');
      const reasons = (el.querySelector('.gss-ov-reasons') || {}).dataset;
      return { card, pic, title, reasons: reasons ? reasons.t : '' };
    });

    console.log('spoilers that never say "spoiler"');
    await check('a GTA VI video with no spoiler words: only its thumbnail is covered, title stays readable', async () => {
      const s = await state('u1');
      assert.ok(s.pic && !s.title && !s.card, JSON.stringify(s));
      assert.match(s.reasons, /Screenshots/);
    });
    await check('a vague reaction ("bro what 💀 #GTA6") is covered', async () => {
      const s = await state('r1');
      assert.ok(s.card, JSON.stringify(s));
      assert.match(s.reasons, /Vague reactions/);
    });
    await check('an unrelated video is untouched', async () => {
      const s = await state('j1');
      assert.ok(!s.card && !s.pic, JSON.stringify(s));
    });

    console.log('learning from the game wiki');
    await check('a character added to the wiki after the pack was made is recognised, even without "GTA"', async () => assert.ok((await state('w1')).card));
    await check('a mission added to the wiki is recognised', async () => assert.match((await state('n1')).reasons, /Missions/));
    await check('"Unnamed …" pages and the protagonists are not learned as spoilers', async () => {
      const learned = await sw.evaluate(async () => (await chrome.storage.local.get('learned')).learned.gta6);
      assert.ok(!learned.categories.characters.includes('Unnamed Guard'));
      assert.ok(!learned.categories.characters.includes('Lucia Caminos'));
      assert.ok(learned.categories.map.includes('Pelican Pier'), 'subcategories are followed and "(GTA VI)" is trimmed');
    });

    console.log('community');
    await check('a video 3 different people reported is hidden, though its title is just "omg"', async () => {
      const s = await state('c1');
      assert.ok(s.card, JSON.stringify(s));
      assert.match(s.reasons, /Reported by 3 people/);
    });
    await check('a phrase that keeps showing up in reports is learned ("Midnight Ferry")', async () => assert.match((await state('l1')).reasons, /Community-reported/));
    await check('a channel that keeps getting reported counts as GTA VI, so its new upload\'s thumbnail is covered', async () => {
      const s = await state('a1');
      assert.ok(s.pic && !s.title, JSON.stringify(s));
    });

    console.log('your reports');
    await check('before reporting, the spoiler screenshot with a random caption is visible (nothing to go on)', async () => {
      assert.ok(!(await state('x1')).card);
      assert.ok(!(await state('x2')).card);
    });
    const menu = async (id, kind, onOverlay) => {
      await page.$eval(`#${id} ${onOverlay ? '.gss-overlay' : 'h3'}`, (el) => el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })));
      await sw.evaluate(async (k) => {
        const [t] = await chrome.tabs.query({ url: 'https://www.youtube.com/*' });
        await chrome.tabs.sendMessage(t.id, { type: 'report-target', kind: k });
      }, kind);
      await page.waitForTimeout(1200);
    };
    await check('reporting it hides it at once', async () => {
      await menu('x1', 'report');
      const s = await state('x1');
      assert.ok(s.card, JSON.stringify(s));
      assert.match(s.reasons, /Reported by you/);
    });
    await check('the same screenshot, reposted smaller as a JPEG in a letterboxed thumbnail with another caption, is caught', async () => {
      const s = await state('x2');
      assert.ok(s.card, JSON.stringify(s));
      assert.match(s.reasons, /Same picture you reported/);
    });
    await check('the report reached the community server with a picture fingerprint', async () => {
      const db = community.store.db;
      assert.ok(db.items['youtube:X1X1X1X1X1X'], 'item recorded');
      assert.ok(Object.keys(db.hashes).length >= 1, 'fingerprint recorded');
    });
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'smart-youtube.png') });
    await check('"Not a spoiler" undoes it, for the video and its picture', async () => {
      await menu('x1', 'safe', true);
      assert.ok(!(await state('x1')).card);
      assert.ok(!(await state('x2')).card);
    });

    console.log('on-device vision (browser model stubbed)');
    const visionSize = fs.statSync(path.join(IMG, 'vision.png')).size;
    await sw.evaluate((size) => {
      globalThis.LanguageModel = {
        availability: async () => 'available',
        create: async () => ({
          clone: async function () { return this; },
          prompt: async (msgs) => {
            const blob = msgs[0].content.find((c) => c.type === 'image').value;
            return JSON.stringify(blob.size === size
              ? { text: 'LUCIA DIES??', videoGame: true, game: 'Grand Theft Auto VI' }
              : { text: '', videoGame: false, game: '' });
          }
        })
      };
    }, visionSize);
    await sw.evaluate(() => GSS.settings.update((s) => { s.vision = 'on'; }));
    await page.waitForTimeout(2500);
    await check('text written inside a thumbnail is read and caught ("LUCIA DIES??" behind "you have to see this")', async () => {
      const s = await state('v1');
      assert.ok(s.card, JSON.stringify(s));
      assert.match(s.reasons, /in the picture/);
    });
    await check('thumbnails with nothing in them stay visible', async () => assert.ok(!(await state('j1')).card));
  } finally {
    await ctx.close();
    sites.close();
    community.server.close();
  }
  console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
})();
