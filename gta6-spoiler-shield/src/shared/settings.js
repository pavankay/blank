/* Spoiler Shield settings: load, save and merge with defaults. Uses chrome.storage.local. */
(function (root) {
  'use strict';
  const G = root.GSS || (typeof require === 'function' ? require('./defaults.js') : {});
  const KEY = 'settings';
  const STATS_KEY = 'stats';

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function merge(stored) {
    const base = clone(G.DEFAULT_SETTINGS);
    const src = stored && typeof stored === 'object' ? clone(stored) : {};

    // Version 1 kept GTA VI categories at the top level; move them into the GTA VI pack's state.
    if (src.categories && !src.packs) {
      src.packs = { gta6: { enabled: true, categories: src.categories, extraContext: Array.isArray(src.extraContext) ? src.extraContext : [] } };
    }
    delete src.categories;
    delete src.extraContext;

    const s = Object.assign(base, src);
    s.schema = G.DEFAULT_SETTINGS.schema;
    if (!s.packs || typeof s.packs !== 'object' || Array.isArray(s.packs)) s.packs = {};
    for (const k of ['customRules', 'keywords', 'exceptions', 'disabledSites', 'customSites']) {
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
    return merge(r || s);
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

  const api = { KEY, STATS_KEY, merge, load, save, update, hostOf, siteDisabled, inactiveReason, loadStats };
  root.GSS = root.GSS || {};
  root.GSS.settings = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
