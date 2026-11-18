/* Spoiler Shield settings: load, save and merge with defaults. Uses chrome.storage.local. */
(function (root) {
  'use strict';
  const G = root.GSS;
  const KEY = 'settings';
  const STATS_KEY = 'stats';

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function merge(stored) {
    const base = clone(G.DEFAULT_SETTINGS);
    const s = Object.assign(base, stored || {});
    // Categories: keep user state, add any new built-in category with its default.
    const cats = {};
    for (const c of G.CATEGORIES) {
      const st = (stored && stored.categories && stored.categories[c.id]) || {};
      cats[c.id] = {
        enabled: typeof st.enabled === 'boolean' ? st.enabled : c.defaultOn,
        extra: Array.isArray(st.extra) ? st.extra : [],
        removed: Array.isArray(st.removed) ? st.removed : []
      };
    }
    s.categories = cats;
    for (const k of ['customRules', 'keywords', 'exceptions', 'extraContext', 'disabledSites']) {
      if (!Array.isArray(s[k])) s[k] = [];
    }
    return s;
  }

  async function load() {
    const got = await chrome.storage.local.get(KEY);
    return merge(got[KEY]);
  }

  async function save(settings) {
    await chrome.storage.local.set({ [KEY]: merge(settings) });
  }

  async function update(mutator) {
    const s = await load();
    const r = await mutator(s);
    await save(r || s);
    return r || s;
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return ''; }
  }

  function siteDisabled(settings, host) {
    host = (host || '').replace(/^www\./, '');
    return (settings.disabledSites || []).some((d) => host === d || host.endsWith('.' + d));
  }

  /** Why the shield is off right now, or '' when it is protecting. */
  function inactiveReason(settings, host) {
    if (!settings.enabled) return 'off';
    if (settings.pausedUntil && Date.now() < settings.pausedUntil) return 'paused';
    if (settings.activeUntil) {
      const end = new Date(settings.activeUntil + 'T23:59:59');
      if (!isNaN(end) && Date.now() > end.getTime()) return 'expired';
    }
    if (host && siteDisabled(settings, host)) return 'site';
    return '';
  }

  async function loadStats() {
    const got = await chrome.storage.local.get(STATS_KEY);
    return Object.assign({ total: 0, byCategory: {}, bySite: {}, since: Date.now() }, got[STATS_KEY] || {});
  }

  G.settings = { KEY, STATS_KEY, merge, load, save, update, hostOf, siteDisabled, inactiveReason, loadStats };
})(globalThis);
