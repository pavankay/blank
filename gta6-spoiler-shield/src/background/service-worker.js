/*
 * Spoiler Shield background: badge counts, stats, context menus, shortcuts, pack updates,
 * learning from pack sources, reports and the community feed, image fingerprints and on-device vision.
 */
importScripts(
  '../shared/defaults.js', '../shared/matcher.js', '../shared/settings.js', '../shared/packs.js',
  '../shared/imagehash.js', '../shared/vision.js', '../shared/community.js'
);

const G = globalThis.GSS;
const S = G.settings;
const P = G.packs;
const C = G.community;

const BADGE_BG = '#ff5fa2';
const frameCounts = new Map(); // tabId -> Map(frameId -> count)

/* ---------- install / startup ---------- */

chrome.runtime.onInstalled.addListener(async (details) => {
  await P.installBundled();         // copy shipped packs and site rules into storage (never over newer or edited ones)
  const { settings } = await P.loadAll();
  await S.save(settings);           // writes defaults on first install, migrates and fills new fields on update
  scheduleAlarms();
  buildMenus();
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/options/options.html?welcome=1') });
  }
  refreshAllBadges();
  if (settings.autoUpdate) P.updateAll().catch(() => {});
  learnIfStale(true).catch(() => {});
  syncCommunity().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  buildMenus();
  scheduleAlarms();
  refreshAllBadges();
  learnIfStale(false).catch(() => {});
  syncCommunity().catch(() => {});
});

function scheduleAlarms() {
  chrome.alarms.create('gss-update', { periodInMinutes: G.UPDATE_INTERVAL_HOURS * 60, delayInMinutes: 1 });
  chrome.alarms.create('gss-learn', { periodInMinutes: G.LEARN_INTERVAL_HOURS * 60, delayInMinutes: 2 });
  chrome.alarms.create('gss-community', { periodInMinutes: G.COMMUNITY_INTERVAL_MINUTES, delayInMinutes: 1 });
}

/* ---------- context menus ---------- */

function buildMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'gss-report', title: '🚩 Report as a spoiler', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'gss-not-spoiler', title: '👍 Not a spoiler (show it)', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'gss-sep0', type: 'separator', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'gss-add-keyword', title: 'Always shield “%s”', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'gss-add-exception', title: 'Never shield text with “%s”', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'gss-shield-this', title: 'Shield this element (only here, only now)', contexts: ['page', 'link', 'image', 'video'] });
    chrome.contextMenus.create({ id: 'gss-sep', type: 'separator', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'gss-toggle-site', title: 'Turn shield off/on for this site', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'gss-pause-15', title: 'Pause shield for 15 minutes', contexts: ['all'] });
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const host = S.hostOf((tab && tab.url) || info.pageUrl || '');
  const toTab = (msg) => tab && chrome.tabs.sendMessage(tab.id, msg, { frameId: info.frameId || 0 }).catch(() => {});
  if (info.menuItemId === 'gss-report') {
    toTab({ type: 'report-target', kind: 'report', srcUrl: info.srcUrl || '', linkUrl: info.linkUrl || '' });
  } else if (info.menuItemId === 'gss-not-spoiler') {
    toTab({ type: 'report-target', kind: 'safe', srcUrl: info.srcUrl || '', linkUrl: info.linkUrl || '' });
  } else if (info.menuItemId === 'gss-add-keyword' && info.selectionText) {
    const term = info.selectionText.trim().slice(0, 80);
    await S.update((s) => { if (!s.keywords.includes(term)) s.keywords.push(term); });
  } else if (info.menuItemId === 'gss-add-exception' && info.selectionText) {
    const term = info.selectionText.trim().slice(0, 80);
    await S.update((s) => { if (!s.exceptions.includes(term)) s.exceptions.push(term); });
  } else if (info.menuItemId === 'gss-shield-this') {
    toTab({ type: 'shield-target' });
  } else if (info.menuItemId === 'gss-toggle-site' && host) {
    await toggleSite(host);
  } else if (info.menuItemId === 'gss-pause-15') {
    await S.update((s) => { s.pausedUntil = Date.now() + 15 * 60 * 1000; });
    chrome.alarms.create('gss-resume', { when: Date.now() + 15 * 60 * 1000 + 500 });
  }
});

async function toggleSite(host) {
  await S.update((s) => {
    const i = s.disabledSites.indexOf(host);
    if (i >= 0) s.disabledSites.splice(i, 1);
    else s.disabledSites.push(host);
  });
}

/* ---------- keyboard shortcuts ---------- */

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd === 'toggle-shield') {
    await S.update((s) => { s.enabled = !s.enabled; s.pausedUntil = 0; });
  } else if (cmd === 'reveal-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) chrome.tabs.sendMessage(tab.id, { type: 'reveal-all' }).catch(() => {});
  }
});

/* ---------- reports ---------- */

const MAX_REPORT_ITEMS = 5000;
const MAX_REPORT_HASHES = 2000;

async function loadReports() {
  const got = await chrome.storage.local.get(P.REPORTS_KEY);
  return Object.assign(P.emptyReports(), got[P.REPORTS_KEY] || {});
}

async function saveReports(rep) {
  const items = Object.entries(rep.items).sort((a, b) => b[1].at - a[1].at).slice(0, MAX_REPORT_ITEMS);
  rep.items = Object.fromEntries(items);
  rep.hashes = rep.hashes.slice(-MAX_REPORT_HASHES);
  await chrome.storage.local.set({ [P.REPORTS_KEY]: rep });
}

const cleanKeys = (keys) => (Array.isArray(keys) ? keys : []).filter((k) => C.KEY_RE.test(k)).slice(0, 20);
const cleanHashes = (hs) => (Array.isArray(hs) ? hs : []).filter((h) => C.HASH_RE.test(h)).slice(0, 6);

async function addReport(r) {
  const keys = cleanKeys(r.keys);
  const hashes = cleanHashes(r.hashes);
  if (!keys.length && !hashes.length) return { ok: false, error: 'Nothing to identify this item by' };
  const title = String(r.title || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  const rep = await loadReports();
  const at = Date.now();
  for (const k of keys) { rep.items[k] = { at, title: title.slice(0, 140), packs: r.packs || [] }; delete rep.safe[k]; }
  for (const h of hashes) if (!rep.hashes.some((x) => x.h === h)) rep.hashes.push({ h, at, title: title.slice(0, 140) });
  await saveReports(rep);

  const s = await S.load();
  let shared = false;
  if (s.communityUrl && s.shareReports) {
    try {
      await C.post(s.communityUrl, '/v1/report', {
        keys, hashes, title, author: String(r.author || '').slice(0, 80),
        packs: (r.packs || []).slice(0, 5), page: !!r.page
      });
      shared = true;
    } catch (_) { /* kept locally either way */ }
  }
  return { ok: true, shared };
}

async function markSafe(r) {
  const keys = cleanKeys(r.keys);
  const hashes = cleanHashes(r.hashes);
  const rep = await loadReports();
  const at = Date.now();
  for (const k of keys) { rep.safe[k] = at; delete rep.items[k]; }
  rep.hashes = rep.hashes.filter((x) => !hashes.some((h) => P.hashDistance(h, x.h) <= G.HASH_DISTANCE));
  rep.safeHashes = (rep.safeHashes || []).concat(hashes.map((h) => ({ h, at }))).slice(-MAX_REPORT_HASHES);
  await saveReports(rep);
  const s = await S.load();
  if (s.communityUrl && s.shareReports) C.post(s.communityUrl, '/v1/safe', { keys, hashes }).catch(() => {});
  return { ok: true };
}

/* ---------- community feed and learning ---------- */

async function syncCommunity() {
  const s = await S.load();
  return C.sync(s.communityUrl);
}

async function learnIfStale(force) {
  const s = await S.load();
  if (!s.learnFromSources) { await chrome.storage.local.remove(P.LEARNED_KEY); return []; }
  const got = await chrome.storage.local.get([P.PACKS_KEY, P.LEARNED_KEY]);
  const learned = got[P.LEARNED_KEY] || {};
  const due = P.packListFrom(got[P.PACKS_KEY]).some((p) => p.sources && p.sources.length &&
    (!learned[p.id] || Date.now() - (learned[p.id].fetchedAt || 0) > G.LEARN_INTERVAL_HOURS * 3600e3));
  if (!force && !due) return [];
  return P.learnAll();
}

/* ---------- image fingerprints ---------- */

const hashMem = new Map();

async function hashImage(url) {
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  if (blob.size > 10e6) throw new Error('too big');
  const bmp = await createImageBitmap(blob);
  const W = 64;
  const H = 64;
  const canvas = new OffscreenCanvas(W, H);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, W, H);
  if (bmp.close) bmp.close();
  return G.imagehash.dhash(ctx.getImageData(0, 0, W, H).data, W, H);
}

async function hashUrls(urls) {
  const out = {};
  const sess = (await chrome.storage.session.get('hashCache')).hashCache || {};
  let dirty = false;
  const todo = [];
  for (const u of (urls || []).slice(0, 60)) {
    if (typeof u !== 'string' || !/^(https?:|data:image\/)/.test(u)) continue;
    if (hashMem.has(u)) out[u] = hashMem.get(u);
    else if (u in sess) { out[u] = sess[u]; hashMem.set(u, sess[u]); }
    else todo.push(u);
  }
  for (let i = 0; i < todo.length; i += 4) {
    await Promise.all(todo.slice(i, i + 4).map(async (u) => {
      let h = '';
      try { h = await hashImage(u); } catch (_) {}
      out[u] = h;
      hashMem.set(u, h);
      if (!u.startsWith('data:')) { sess[u] = h; dirty = true; }
    }));
  }
  if (dirty) {
    const keys = Object.keys(sess);
    if (keys.length > 3000) for (const k of keys.slice(0, keys.length - 3000)) delete sess[k];
    await chrome.storage.session.set({ hashCache: sess });
  }
  return out;
}

/* ---------- on-device vision ---------- */

const VISION_DOC = 'src/offscreen/vision.html';
let visionChain = Promise.resolve();

function visionHere() {
  return !!globalThis.LanguageModel || typeof globalThis.TextDetector === 'function';
}

async function ensureOffscreen() {
  if (!chrome.offscreen) throw new Error('This browser has no on-device vision');
  if (chrome.offscreen.hasDocument && await chrome.offscreen.hasDocument()) return;
  try {
    await chrome.offscreen.createDocument({ url: VISION_DOC, reasons: ['BLOBS'], justification: 'Read text in thumbnails with the on-device model' });
  } catch (e) {
    if (!/single offscreen/i.test(e.message)) throw e;
  }
}

async function visionStatus() {
  if (visionHere()) return G.vision.status();
  try {
    await ensureOffscreen();
    return await chrome.runtime.sendMessage({ target: 'offscreen', type: 'vision-status' });
  } catch (e) {
    return { engine: 'none', state: 'unavailable', error: e.message };
  }
}

function visionAnalyze(url) {
  const run = async () => {
    const cache = (await chrome.storage.session.get('visionCache')).visionCache || {};
    if (cache[url]) return cache[url];
    let result;
    if (visionHere()) {
      const res = await fetch(url, { credentials: 'omit' });
      result = await G.vision.analyze(await res.blob());
    } else {
      await ensureOffscreen();
      result = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'vision-analyze', url });
      if (!result || result.error) throw new Error((result && result.error) || 'vision failed');
    }
    cache[url] = result;
    const keys = Object.keys(cache);
    if (keys.length > 2000) for (const k of keys.slice(0, keys.length - 2000)) delete cache[k];
    await chrome.storage.session.set({ visionCache: cache });
    return result;
  };
  // One image at a time: the model is shared and slow.
  const p = visionChain.then(run, run);
  visionChain = p.catch(() => {});
  return p;
}

/* ---------- messages ---------- */

let statsQueue = { total: 0, byCategory: {}, bySite: {} };
let statsTimer = null;

const asyncReply = (promise, reply) => {
  promise.then((r) => reply(r)).catch((e) => reply({ ok: false, error: e.message }));
  return true;
};

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || !msg.type || msg.target === 'offscreen') return;
  const tabId = sender.tab && sender.tab.id;

  switch (msg.type) {
    case 'count': {
      if (tabId == null) return;
      let m = frameCounts.get(tabId);
      if (!m) { m = new Map(); frameCounts.set(tabId, m); }
      m.set(sender.frameId || 0, msg.count || 0);
      updateBadge(tabId);
      return;
    }
    case 'stats': {
      for (const [id, c] of Object.entries(msg.add || {})) statsQueue.byCategory[id] = (statsQueue.byCategory[id] || 0) + c;
      const items = msg.page ? 1 : Object.values(msg.add || {}).reduce((a, b) => Math.max(a, b), 0);
      statsQueue.total += items;
      if (msg.host) statsQueue.bySite[msg.host] = (statsQueue.bySite[msg.host] || 0) + items;
      if (!statsTimer) statsTimer = setTimeout(flushStats, 2000);
      return;
    }
    case 'disable-site':
      if (msg.host) S.update((s) => { if (!s.disabledSites.includes(msg.host)) s.disabledSites.push(msg.host); });
      return;
    case 'update-packs':
      return asyncReply(P.updateAll().then((report) => ({ ok: true, report })), reply);
    case 'learn-now':
      return asyncReply(learnIfStale(true).then((report) => ({ ok: true, report })), reply);
    case 'community-sync':
      return asyncReply(syncCommunity().then((feed) => ({ ok: true, items: feed ? Object.keys(feed.items).length : 0 })), reply);
    case 'report':
      return asyncReply(addReport(msg), reply);
    case 'not-spoiler':
      return asyncReply(markSafe(msg), reply);
    case 'undo-report':
      return asyncReply(loadReports().then(async (rep) => {
        if (msg.key) delete rep.items[msg.key];
        if (msg.safeKey) delete rep.safe[msg.safeKey];
        if (msg.hash) rep.hashes = rep.hashes.filter((x) => x.h !== msg.hash);
        await saveReports(rep);
        return { ok: true };
      }), reply);
    case 'hash-images':
      return asyncReply(hashUrls(msg.urls).then((hashes) => ({ ok: true, hashes })), reply);
    case 'vision-status':
      return asyncReply(visionStatus(), reply);
    case 'vision-analyze':
      return asyncReply(visionAnalyze(msg.url).then((r) => Object.assign({ ok: true }, r)), reply);
    case 'pause': {
      const until = Date.now() + (msg.minutes || 15) * 60 * 1000;
      return asyncReply(S.update((s) => { s.pausedUntil = until; }).then(() => {
        chrome.alarms.create('gss-resume', { when: until + 500 });
        return { ok: true, until };
      }), reply);
    }
    default:
  }
});

async function flushStats() {
  statsTimer = null;
  const q = statsQueue;
  statsQueue = { total: 0, byCategory: {}, bySite: {} };
  const st = await S.loadStats();
  st.total += q.total;
  for (const [k, v] of Object.entries(q.byCategory)) st.byCategory[k] = (st.byCategory[k] || 0) + v;
  for (const [k, v] of Object.entries(q.bySite)) st.bySite[k] = (st.bySite[k] || 0) + v;
  st.bySite = Object.fromEntries(Object.entries(st.bySite).sort((a, b) => b[1] - a[1]).slice(0, 50));
  await chrome.storage.local.set({ [S.STATS_KEY]: st });
}

/* ---------- badge ---------- */

async function updateBadge(tabId) {
  const s = await S.load();
  let tab;
  try { tab = await chrome.tabs.get(tabId); } catch (_) { return; }
  const reason = S.inactiveReason(s, S.hostOf(tab.url || ''));
  if (reason) {
    chrome.action.setBadgeText({ tabId, text: reason === 'paused' ? '⏸' : 'OFF' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#6b6390' });
    chrome.action.setTitle({ tabId, title: `Spoiler Shield: ${({ off: 'off', paused: 'paused', site: 'off on this site', expired: 'switched itself off after your end date' })[reason]}` });
    return;
  }
  const m = frameCounts.get(tabId);
  const total = m ? Array.from(m.values()).reduce((a, b) => a + b, 0) : 0;
  chrome.action.setBadgeText({ tabId, text: total ? (total > 999 ? '999+' : String(total)) : '' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_BG });
  chrome.action.setTitle({ tabId, title: total ? `Spoiler Shield: ${total} spoiler${total === 1 ? '' : 's'} shielded here` : 'Spoiler Shield: protecting this page' });
}

async function refreshAllBadges() {
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) updateBadge(t.id);
}

chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === 'loading' && info.url) frameCounts.delete(tabId);
  if (info.status) updateBadge(tabId);
});
chrome.tabs.onRemoved.addListener((tabId) => frameCounts.delete(tabId));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[S.KEY]) return;
  refreshAllBadges();
  const before = S.merge(changes[S.KEY].oldValue);
  const after = S.merge(changes[S.KEY].newValue);
  if (before.communityUrl !== after.communityUrl) syncCommunity().catch(() => {});
  if (before.learnFromSources !== after.learnFromSources) learnIfStale(true).catch(() => {});
});

chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name === 'gss-update') {
    const s = await S.load();
    if (s.autoUpdate) await P.updateAll().catch(() => {});
  } else if (a.name === 'gss-learn') {
    await learnIfStale(false).catch(() => {});
  } else if (a.name === 'gss-community') {
    await syncCommunity().catch(() => {});
  } else if (a.name === 'gss-resume') {
    const s = await S.load();
    if (s.pausedUntil && Date.now() >= s.pausedUntil) { s.pausedUntil = 0; await S.save(s); }
    refreshAllBadges();
  }
});
