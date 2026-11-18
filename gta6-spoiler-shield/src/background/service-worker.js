/* Spoiler Shield background: badge counts, lifetime stats, context menus, shortcuts. */
importScripts('../shared/defaults.js', '../shared/matcher.js', '../shared/settings.js');

const G = globalThis.GSS;
const S = G.settings;

const BADGE_BG = '#ff5fa2';
const frameCounts = new Map(); // tabId -> Map(frameId -> count)

/* ---------- install / menus ---------- */

chrome.runtime.onInstalled.addListener(async (details) => {
  const s = await S.load();
  await S.save(s); // writes defaults on first install, fills new fields on update
  buildMenus();
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/options/options.html?welcome=1') });
  }
  refreshAllBadges();
});

chrome.runtime.onStartup.addListener(() => { buildMenus(); refreshAllBadges(); });

function buildMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'gss-add-keyword', title: 'Always shield “%s”', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'gss-add-exception', title: 'Never shield text with “%s”', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'gss-shield-this', title: 'Shield this element', contexts: ['page', 'link', 'image', 'video'] });
    chrome.contextMenus.create({ id: 'gss-sep', type: 'separator', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'gss-toggle-site', title: 'Turn shield off/on for this site', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'gss-pause-15', title: 'Pause shield for 15 minutes', contexts: ['all'] });
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const host = S.hostOf((tab && tab.url) || info.pageUrl || '');
  if (info.menuItemId === 'gss-add-keyword' && info.selectionText) {
    const term = info.selectionText.trim().slice(0, 80);
    await S.update((s) => { if (!s.keywords.includes(term)) s.keywords.push(term); });
  } else if (info.menuItemId === 'gss-add-exception' && info.selectionText) {
    const term = info.selectionText.trim().slice(0, 80);
    await S.update((s) => { if (!s.exceptions.includes(term)) s.exceptions.push(term); });
  } else if (info.menuItemId === 'gss-shield-this' && tab) {
    chrome.tabs.sendMessage(tab.id, { type: 'shield-target' }, { frameId: info.frameId || 0 }).catch(() => {});
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

/* ---------- keyboard shortcut ---------- */

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd === 'toggle-shield') {
    await S.update((s) => { s.enabled = !s.enabled; s.pausedUntil = 0; });
  } else if (cmd === 'reveal-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) chrome.tabs.sendMessage(tab.id, { type: 'reveal-all' }).catch(() => {});
  }
});

/* ---------- messages from content scripts / pages ---------- */

let statsQueue = { total: 0, byCategory: {}, bySite: {} };
let statsTimer = null;

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || !msg.type) return;
  const tabId = sender.tab && sender.tab.id;

  if (msg.type === 'count' && tabId != null) {
    let m = frameCounts.get(tabId);
    if (!m) { m = new Map(); frameCounts.set(tabId, m); }
    m.set(sender.frameId || 0, msg.count || 0);
    updateBadge(tabId);
  } else if (msg.type === 'stats') {
    for (const [id, c] of Object.entries(msg.add || {})) {
      statsQueue.byCategory[id] = (statsQueue.byCategory[id] || 0) + c;
    }
    const items = msg.page ? 1 : Object.values(msg.add || {}).reduce((a, b) => Math.max(a, b), 0);
    statsQueue.total += items;
    if (msg.host) statsQueue.bySite[msg.host] = (statsQueue.bySite[msg.host] || 0) + items;
    if (!statsTimer) statsTimer = setTimeout(flushStats, 2000);
  } else if (msg.type === 'disable-site' && msg.host) {
    S.update((s) => { if (!s.disabledSites.includes(msg.host)) s.disabledSites.push(msg.host); });
  } else if (msg.type === 'pause') {
    const until = Date.now() + (msg.minutes || 15) * 60 * 1000;
    S.update((s) => { s.pausedUntil = until; }).then(() => {
      chrome.alarms.create('gss-resume', { when: until + 500 });
      reply && reply({ ok: true, until });
    });
    return true;
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
  // Keep the site table small.
  const sites = Object.entries(st.bySite).sort((a, b) => b[1] - a[1]).slice(0, 50);
  st.bySite = Object.fromEntries(sites);
  await chrome.storage.local.set({ [S.STATS_KEY]: st });
}

/* ---------- badge ---------- */

async function updateBadge(tabId) {
  const s = await S.load();
  let tab;
  try { tab = await chrome.tabs.get(tabId); } catch (_) { return; }
  const reason = S.inactiveReason(s, S.hostOf(tab.url || ''));
  if (reason) {
    const text = reason === 'paused' ? '⏸' : 'OFF';
    chrome.action.setBadgeText({ tabId, text });
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
  if (area === 'local' && changes[S.KEY]) refreshAllBadges();
});

chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name === 'gss-resume') {
    const s = await S.load();
    if (s.pausedUntil && Date.now() >= s.pausedUntil) { s.pausedUntil = 0; await S.save(s); }
    refreshAllBadges();
  }
});
