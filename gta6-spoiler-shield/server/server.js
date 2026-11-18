#!/usr/bin/env node
/*
 * Spoiler Shield community server. No dependencies: `node server/server.js`.
 *
 * People report videos, posts and screenshots as spoilers. Once enough DIFFERENT people (different install ids
 * AND different networks) report the same thing, it goes into the feed and every Spoiler Shield following this
 * server hides it. "Not a spoiler" votes pull it back out. The server also learns: names and phrases that keep
 * showing up across many reported titles, and channels that keep getting reported, are published per topic pack
 * so the shield recognises new spoilers it has never seen.
 *
 * Privacy: install ids and IP addresses are only stored as salted hashes, used to count distinct reporters.
 * Nothing about browsing is ever received; the extension only talks to this server when someone reports
 * (POST) or downloads the feed (GET, no identifiers).
 *
 * Settings (environment variables):
 *   PORT=8787  DATA_FILE=./data/community.json
 *   ITEM_THRESHOLD=5     distinct reporters before a video/post is hidden for everyone
 *   HASH_THRESHOLD=5     distinct reporters before a picture fingerprint is shared
 *   TERM_THRESHOLD=8     distinct reporters before a phrase is learned
 *   AUTHOR_THRESHOLD=8   distinct reporters before a channel counts as "about this topic"
 *   RATE_PER_HOUR=60     reports per network per hour
 *   MAX_AGE_DAYS=45      forget reports older than this
 *   TRUST_PROXY=1        read the client address from X-Forwarded-For (only behind your own proxy)
 *   ADMIN_TOKEN=...      enables POST /v1/admin/remove for moderation
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEY_RE = /^[a-z0-9-]+:[A-Za-z0-9_.-]{3,64}$/;
const HASH_RE = /^[0-9a-f]{16}$/;
const PACK_RE = /^[a-z0-9-]{1,40}$/;

// Words too common to ever be learned as a spoiler phrase on their own.
const COMMON = new Set(`
a about after again all almost also am an and any are as at back be because been before being best big
both but by can come could day did do does doing done down each even every first for from full get go goes
going good got had has have he her here him his how i if in into is it its just know last like look made make
many me more most much my need new next no not now of off on one only or other our out over part people play
played playing really right said same see she should show so some still such take than that the their them
then there these they thing things think this those time to too two up us use very via was watch way we well
went were what when where which while who why will with would yeah yes you your
game games gaming gameplay video videos clip clips stream streams live official trailer trailers new update
ps5 ps4 xbox pc series reaction reacts react insane crazy funny epic moments moment shorts short fyp viral
youtube tiktok reddit twitter subscribe like comment share episode ep vs 4k hd 60fps max ultra settings pro
gta grand theft auto rockstar games part chapter mission missions ending endings story spoiler spoilers
ever never always gonna wanna gotta lol lmao omg wtf bro bruh guys guy literally actually literally finally first last today tonight
`.split(/\s+/).filter(Boolean));

function config(overrides) {
  const env = process.env;
  return Object.assign({
    port: Number(env.PORT) || 8787,
    dataFile: env.DATA_FILE || path.join(__dirname, 'data', 'community.json'),
    itemThreshold: Number(env.ITEM_THRESHOLD) || 5,
    hashThreshold: Number(env.HASH_THRESHOLD) || 5,
    termThreshold: Number(env.TERM_THRESHOLD) || 8,
    authorThreshold: Number(env.AUTHOR_THRESHOLD) || 8,
    ratePerHour: Number(env.RATE_PER_HOUR) || 60,
    maxAgeDays: Number(env.MAX_AGE_DAYS) || 45,
    trustProxy: env.TRUST_PROXY === '1',
    adminToken: env.ADMIN_TOKEN || '',
    hashCluster: 8
  }, overrides || {});
}

/* ---------- helpers ---------- */

function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < 16; i += 4) {
    let x = parseInt(a.slice(i, i + 4), 16) ^ parseInt(b.slice(i, i + 4), 16);
    while (x) { d += x & 1; x >>>= 1; }
  }
  return d;
}

/** Candidate phrases (1-3 words) from a reported title. */
function phrasesOf(title) {
  const words = String(title || '').normalize('NFKC')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[^\p{L}\p{N}'’-]+/u).map((w) => w.replace(/^['’-]+|['’-]+$/g, '')).filter(Boolean)
    .map((w) => w.toLowerCase());
  const out = new Set();
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i + n <= words.length; i++) {
      const g = words.slice(i, i + n);
      if (COMMON.has(g[0]) || COMMON.has(g[g.length - 1])) continue;
      if (g.some((w) => /^\d+$/.test(w))) continue;
      const p = g.join(' ');
      if (n === 1 && p.length < 4) continue;
      if (p.length > 40) continue;
      out.add(p);
    }
  }
  return Array.from(out).slice(0, 80);
}

/* ---------- the store ---------- */

function emptyDb() {
  return { salt: crypto.randomBytes(16).toString('hex'), items: {}, hashes: {}, phrases: {}, authors: {}, removed: { items: {}, hashes: {}, terms: {} } };
}

function createStore(cfg) {
  let db = emptyDb();
  try {
    if (fs.existsSync(cfg.dataFile)) db = Object.assign(emptyDb(), JSON.parse(fs.readFileSync(cfg.dataFile, 'utf8')));
  } catch (e) { console.error('Could not read data file, starting fresh:', e.message); }

  let saveTimer = null;
  function save() {
    if (saveTimer || !cfg.dataFile) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      prune();
      fs.mkdirSync(path.dirname(cfg.dataFile), { recursive: true });
      const tmp = cfg.dataFile + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(db));
      fs.renameSync(tmp, cfg.dataFile);
    }, 1500);
  }

  const anon = (v) => crypto.createHash('sha256').update(db.salt + '|' + v).digest('hex').slice(0, 16);

  function prune() {
    const cutoff = Date.now() - cfg.maxAgeDays * 864e5;
    const pruneVotes = (rec) => {
      for (const side of ['r', 's']) for (const [k, v] of Object.entries(rec[side] || {})) if (v.t < cutoff) delete rec[side][k];
      return Object.keys(rec.r || {}).length + Object.keys(rec.s || {}).length;
    };
    for (const table of [db.items, db.hashes]) for (const [k, rec] of Object.entries(table)) if (!pruneVotes(rec)) delete table[k];
    for (const table of [db.phrases, db.authors]) {
      for (const pack of Object.values(table)) for (const [k, rec] of Object.entries(pack)) if (!pruneVotes(rec)) delete pack[k];
    }
  }

  /** A vote counts once per install AND once per network, so one person can't fake a crowd. */
  function vote(rec, side, who) {
    rec.r = rec.r || {};
    rec.s = rec.s || {};
    const other = side === 'r' ? 's' : 'r';
    delete rec[other][who.client];
    rec[side][who.client] = { t: Date.now(), ip: who.ip };
  }

  function distinct(votes) {
    const v = Object.values(votes || {});
    return Math.min(v.length, new Set(v.map((x) => x.ip)).size);
  }

  function hashSlot(h) {
    if (db.hashes[h]) return h;
    for (const k of Object.keys(db.hashes)) if (hamming(k, h) <= cfg.hashCluster) return k;
    return h;
  }

  function report(body, who) {
    const packs = (body.packs || []).filter((p) => PACK_RE.test(p)).slice(0, 5);
    for (const k of body.keys) {
      const rec = db.items[k] = db.items[k] || { r: {}, s: {}, packs: {} };
      vote(rec, 'r', who);
      for (const p of packs) rec.packs[p] = 1;
    }
    for (const h of body.hashes) {
      const slot = hashSlot(h);
      vote(db.hashes[slot] = db.hashes[slot] || { r: {}, s: {} }, 'r', who);
    }
    // Learning: phrases and channel names, per topic pack.
    for (const p of packs) {
      const table = db.phrases[p] = db.phrases[p] || {};
      const itemId = anon((body.keys[0] || body.hashes[0] || body.title).slice(0, 80));
      for (const ph of phrasesOf(body.title)) {
        const rec = table[ph] = table[ph] || { r: {}, s: {}, items: {} };
        vote(rec, 'r', who);
        rec.items[itemId] = 1;
      }
      if (body.author) {
        const a = String(body.author).trim().slice(0, 60);
        const at = db.authors[p] = db.authors[p] || {};
        if (a.length >= 3) vote(at[a] = at[a] || { r: {}, s: {} }, 'r', who);
      }
    }
    save();
  }

  function markSafe(body, who) {
    for (const k of body.keys) if (db.items[k]) vote(db.items[k], 's', who);
    for (const h of body.hashes) {
      const slot = hashSlot(h);
      if (db.hashes[slot]) vote(db.hashes[slot], 's', who);
    }
    save();
  }

  // An item is listed when enough distinct people reported it and reports clearly outnumber "not a spoiler".
  const listed = (rec, threshold) => {
    const r = distinct(rec.r);
    const s = distinct(rec.s);
    return r >= threshold && r >= 2 * s ? r : 0;
  };

  let cache = null;
  function feed() {
    if (cache && Date.now() - cache.at < 30000) return cache.body;
    const items = {};
    for (const [k, rec] of Object.entries(db.items)) {
      if (db.removed.items[k]) continue;
      const n = listed(rec, cfg.itemThreshold);
      if (n) items[k] = n;
    }
    const hashes = [];
    for (const [h, rec] of Object.entries(db.hashes)) {
      if (db.removed.hashes[h]) continue;
      const n = listed(rec, cfg.hashThreshold);
      if (n) hashes.push({ h, n });
    }
    const learned = {};
    for (const [pack, table] of Object.entries(db.phrases)) {
      let terms = Object.entries(table)
        .filter(([p, rec]) => !db.removed.terms[p] && distinct(rec.r) >= cfg.termThreshold && Object.keys(rec.items || {}).length >= Math.ceil(cfg.termThreshold / 2))
        .map(([p, rec]) => [p, distinct(rec.r)]);
      // Prefer "night train" over "night" and "train" when they travel together.
      terms = terms.filter(([p, n]) => !terms.some(([q, m]) => q !== p && q.split(' ').length > p.split(' ').length && (' ' + q + ' ').includes(' ' + p + ' ') && m * 1.25 >= n));
      learned[pack] = { terms: terms.sort((a, b) => b[1] - a[1]).slice(0, 300).map(([p]) => p), authors: [] };
    }
    for (const [pack, table] of Object.entries(db.authors)) {
      learned[pack] = learned[pack] || { terms: [], authors: [] };
      learned[pack].authors = Object.entries(table).filter(([, rec]) => distinct(rec.r) >= cfg.authorThreshold).map(([a]) => a).slice(0, 300);
    }
    const body = JSON.stringify({ version: new Date().toISOString(), items, hashes, learned });
    cache = { at: Date.now(), body };
    return body;
  }

  function remove(body) {
    for (const k of body.keys || []) if (KEY_RE.test(k)) db.removed.items[k] = Date.now();
    for (const h of body.hashes || []) if (HASH_RE.test(h)) db.removed.hashes[hashSlot(h)] = Date.now();
    for (const t of body.terms || []) if (typeof t === 'string') db.removed.terms[t.toLowerCase()] = Date.now();
    cache = null;
    save();
  }

  return { report, markSafe, feed, remove, anon, invalidate: () => { cache = null; }, get db() { return db; }, flush: () => { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; } } };
}

/* ---------- http ---------- */

function createServer(overrides) {
  const cfg = config(overrides);
  const store = createStore(cfg);
  const rate = new Map(); // ip -> [timestamps]

  function clientIp(req) {
    if (cfg.trustProxy && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',')[0].trim();
    return req.socket.remoteAddress || '';
  }

  function limited(ip) {
    const now = Date.now();
    const list = (rate.get(ip) || []).filter((t) => now - t < 3600e3);
    list.push(now);
    rate.set(ip, list);
    return list.length > cfg.ratePerHour;
  }

  function send(res, status, body, extra) {
    res.writeHead(status, Object.assign({
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, authorization',
      'cache-control': 'no-store'
    }, extra || {}));
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
  }

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (c) => {
        size += c.length;
        if (size > 16384) { reject(new Error('too large')); req.destroy(); return; }
        chunks.push(c);
      });
      req.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (_) { reject(new Error('bad json')); }
      });
      req.on('error', reject);
    });
  }

  function clean(body) {
    if (!body || typeof body !== 'object') return null;
    if (typeof body.client !== 'string' || body.client.length < 8 || body.client.length > 64) return null;
    const keys = (Array.isArray(body.keys) ? body.keys : []).filter((k) => typeof k === 'string' && KEY_RE.test(k)).slice(0, 20);
    const hashes = (Array.isArray(body.hashes) ? body.hashes : []).filter((h) => typeof h === 'string' && HASH_RE.test(h)).slice(0, 6);
    if (!keys.length && !hashes.length) return null;
    return {
      client: body.client, keys, hashes,
      title: typeof body.title === 'string' ? body.title.slice(0, 300) : '',
      author: typeof body.author === 'string' ? body.author.slice(0, 80) : '',
      packs: Array.isArray(body.packs) ? body.packs.filter((p) => typeof p === 'string') : []
    };
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'OPTIONS') return send(res, 204, '');
    try {
      if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true });
      if (req.method === 'GET' && url.pathname === '/v1/feed') return send(res, 200, store.feed(), { 'cache-control': 'public, max-age=30' });

      if (req.method === 'POST' && (url.pathname === '/v1/report' || url.pathname === '/v1/safe')) {
        const ip = clientIp(req);
        if (limited(ip)) return send(res, 429, { ok: false, error: 'Too many reports, try later' });
        const body = clean(await readBody(req));
        if (!body) return send(res, 400, { ok: false, error: 'Nothing to report' });
        const who = { client: store.anon('c:' + body.client), ip: store.anon('ip:' + ip) };
        if (url.pathname === '/v1/report') store.report(body, who);
        else store.markSafe(body, who);
        store.invalidate();
        return send(res, 200, { ok: true });
      }

      if (req.method === 'POST' && url.pathname === '/v1/admin/remove') {
        if (!cfg.adminToken || req.headers.authorization !== `Bearer ${cfg.adminToken}`) return send(res, 403, { ok: false });
        store.remove(await readBody(req));
        return send(res, 200, { ok: true });
      }
      send(res, 404, { ok: false, error: 'Not found' });
    } catch (e) {
      send(res, 400, { ok: false, error: e.message });
    }
  });

  return { server, store, cfg };
}

if (require.main === module) {
  const { server, cfg } = createServer();
  server.listen(cfg.port, () => console.log(`Spoiler Shield community server on :${cfg.port} (items need ${cfg.itemThreshold} distinct reporters)`));
}

module.exports = { createServer, phrasesOf, hamming, config };
