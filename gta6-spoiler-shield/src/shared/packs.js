/*
 * Topic packs and site rules: validation, storage, bundled install, URL subscriptions and updates.
 *
 * A pack is plain JSON (see packs/gta6.json):
 *   { format, id, name, short, version, description, updateUrl,
 *     context: { strong[], weak[], names[], urls[] },
 *     categories: [{ id, label, short, emoji, description, defaultOn, liveStream, terms[], strong[], solo[] }],
 *     examples[], threshold? }
 *
 * Site rules are plain JSON too (see rules/sites.json):
 *   { format, version, sites: [{ name, hosts[], detect, selectors[], topic[], live }], generic[], searchPages[] }
 *
 * Everything from a file or URL is treated as untrusted data: lengths are capped, regexes are checked,
 * and nothing in a pack can run code.
 */
(function (root) {
  'use strict';
  const G = root.GSS || (typeof require === 'function' ? require('./defaults.js') : {});

  const PACKS_KEY = 'packs';
  const SITES_KEY = 'sites';
  const LIMITS = { terms: 800, termLen: 120, regexLen: 120, categories: 40, sites: 300, selectors: 100, selectorLen: 300, urls: 60 };

  /* ---------- small validators ---------- */

  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const slug = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

  // Rejects invalid regexes and the classic catastrophic-backtracking shapes like (a+)+ or (.*)*.
  function safeRegexSource(src) {
    if (typeof src !== 'string' || !src || src.length > LIMITS.regexLen) return false;
    if (/\((?:[^()\\]|\\.)*[+*}](?:[^()\\]|\\.)*\)\s*[+*{]/.test(src)) return false;
    if (/\\[1-9]/.test(src)) return false; // backreferences
    try { new RegExp(src, 'iu'); return true; } catch (_) { return false; }
  }

  function termList(v, warnings, where) {
    if (v == null) return [];
    if (!Array.isArray(v)) { warnings.push(`${where} should be a list`); return []; }
    const out = [];
    for (const t of v.slice(0, LIMITS.terms)) {
      if (typeof t !== 'string') continue;
      const s = t.trim();
      if (!s) continue;
      if (s.length > LIMITS.termLen) { warnings.push(`${where}: skipped a term longer than ${LIMITS.termLen} characters`); continue; }
      const rx = /^\/(.+)\/$/.exec(s);
      if (rx && !safeRegexSource(rx[1])) { warnings.push(`${where}: skipped unsafe or invalid regex ${s}`); continue; }
      out.push(s);
    }
    return Array.from(new Set(out));
  }

  function selectorList(v, warnings, where) {
    if (v == null) return [];
    if (!Array.isArray(v)) { warnings.push(`${where} should be a list`); return []; }
    const out = [];
    for (const s of v.slice(0, LIMITS.selectors)) {
      if (typeof s !== 'string' || !s.trim() || s.length > LIMITS.selectorLen) continue;
      if (typeof document !== 'undefined') {
        try { document.createDocumentFragment().querySelector(s); } catch (_) { warnings.push(`${where}: skipped invalid selector ${s}`); continue; }
      }
      out.push(s.trim());
    }
    return out;
  }

  function cleanUrl(v) {
    if (typeof v !== 'string' || !v.trim()) return '';
    try {
      const u = new URL(v.trim());
      const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(u.hostname);
      if (u.protocol === 'https:' || (u.protocol === 'http:' && local)) return u.toString();
    } catch (_) {}
    return '';
  }

  function compareVersions(a, b) {
    const pa = String(a || '0').split(/[^0-9a-z]+/i);
    const pb = String(b || '0').split(/[^0-9a-z]+/i);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const x = pa[i] || '0';
      const y = pb[i] || '0';
      const nx = Number(x);
      const ny = Number(y);
      const c = !isNaN(nx) && !isNaN(ny) ? nx - ny : x.localeCompare(y);
      if (c) return c > 0 ? 1 : -1;
    }
    return 0;
  }

  /* ---------- packs ---------- */

  /** @returns {{pack?: object, errors: string[], warnings: string[]}} errors are fatal, warnings are skipped bits */
  function validatePack(raw) {
    const errors = [];
    const warnings = [];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { errors: ['This is not a pack (expected a JSON object).'], warnings };
    if (raw.format && raw.format !== G.PACK_FORMAT) errors.push(`Unknown pack format "${raw.format}". Expected "${G.PACK_FORMAT}".`);

    const name = str(raw.name, 60);
    const id = slug(raw.id || name);
    if (!name) errors.push('The pack needs a "name".');
    if (!id) errors.push('The pack needs an "id".');

    const ctx = raw.context && typeof raw.context === 'object' ? raw.context : {};
    const context = {
      strong: termList(ctx.strong, warnings, 'context.strong'),
      weak: termList(ctx.weak, warnings, 'context.weak'),
      names: termList(ctx.names, warnings, 'context.names'),
      urls: []
    };
    for (const u of (Array.isArray(ctx.urls) ? ctx.urls : []).slice(0, LIMITS.urls)) {
      if (safeRegexSource(u)) context.urls.push(u);
      else warnings.push(`context.urls: skipped unsafe or invalid pattern ${u}`);
    }

    const categories = [];
    const seen = new Set();
    for (const c of (Array.isArray(raw.categories) ? raw.categories : []).slice(0, LIMITS.categories)) {
      if (!c || typeof c !== 'object') continue;
      const cid = slug(c.id || c.label);
      if (!cid) { warnings.push('Skipped a category without an id or label.'); continue; }
      if (seen.has(cid)) { warnings.push(`Skipped duplicate category "${cid}".`); continue; }
      seen.add(cid);
      const label = str(c.label, 40) || cid;
      const terms = termList(c.terms, warnings, `${cid}.terms`);
      const solo = termList(c.solo, warnings, `${cid}.solo`);
      if (!terms.length && !solo.length) { warnings.push(`Category "${cid}" has no words, so it never matches.`); }
      categories.push({
        id: cid,
        label,
        short: str(c.short, 16) || label.split(/\s*&\s*|\s+/)[0],
        emoji: str(c.emoji, 8) || '•',
        description: str(c.description, 200),
        defaultOn: c.defaultOn !== false,
        liveStream: c.liveStream === true,
        terms,
        strong: termList(c.strong, warnings, `${cid}.strong`),
        solo
      });
    }
    if (!categories.length) errors.push('The pack needs at least one category.');
    if (!context.strong.length && !context.weak.length && !categories.some((c) => c.solo.length)) {
      errors.push('The pack needs some context words ("context.strong") so it knows when text is about its topic.');
    }

    let threshold = null;
    if (raw.threshold && typeof raw.threshold === 'object') {
      threshold = {};
      for (const k of ['relaxed', 'balanced', 'strict']) {
        const n = Number(raw.threshold[k]);
        threshold[k] = n > 0 && n < 20 ? n : G.CONTEXT_THRESHOLD[k];
      }
    }

    const examples = (Array.isArray(raw.examples) ? raw.examples : [])
      .filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim().slice(0, 200)).slice(0, 20);

    if (errors.length) return { errors, warnings };
    return {
      errors, warnings,
      pack: {
        format: G.PACK_FORMAT, id, name,
        short: str(raw.short, 24) || name,
        version: str(raw.version, 40) || '1',
        description: str(raw.description, 300),
        updateUrl: cleanUrl(raw.updateUrl),
        context, categories, examples, threshold
      }
    };
  }

  /** A starting point for a brand-new pack about any game, show or film. */
  function packTemplate(name) {
    const n = (name || 'My topic').trim();
    return {
      format: G.PACK_FORMAT,
      id: slug(n) || 'my-topic',
      name: n,
      short: n.slice(0, 24),
      version: '1',
      description: `Spoilers for ${n}.`,
      updateUrl: '',
      context: { strong: [n.toLowerCase()], weak: [], names: [], urls: [] },
      categories: [
        {
          id: 'story', label: 'Story & plot', short: 'Story', emoji: '📖', defaultOn: true,
          description: 'Plot points, twists, deaths and endings.',
          terms: ['ending*', 'twist', 'dies', 'died', 'death', 'killed', 'betray*', 'finale', 'spoiler*', 'plot', 'who dies'],
          strong: ['ending*', 'twist', 'dies', 'death', 'betray*', 'finale', 'spoiler*'],
          solo: []
        },
        {
          id: 'characters', label: 'Characters', short: 'Characters', emoji: '🎭', defaultOn: true,
          description: 'Cameos, returning characters and casting.',
          terms: ['cameo*', 'returning', 'new character*', 'cast'],
          strong: ['cameo*', 'returning'],
          solo: []
        },
        {
          id: 'footage', label: 'Clips & footage', short: 'Footage', emoji: '📹', defaultOn: true, liveStream: true,
          description: 'Clips, playthroughs, streams and reactions.',
          terms: ['clip*', 'playthrough*', 'reaction*', 'full episode', 'scene', 'footage', 'leak*'],
          strong: ['playthrough*', 'full episode', 'footage', 'leak*'],
          solo: []
        }
      ],
      examples: [`${n} ending explained`, `${n} release date announced`]
    };
  }

  /* ---------- site rules ---------- */

  function validateSites(raw) {
    const errors = [];
    const warnings = [];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { errors: ['Site rules must be a JSON object.'], warnings };
    if (raw.format && raw.format !== G.SITES_FORMAT) errors.push(`Unknown site rules format "${raw.format}".`);
    const sites = [];
    for (const s of (Array.isArray(raw.sites) ? raw.sites : []).slice(0, LIMITS.sites)) {
      const rule = validateSite(s, warnings);
      if (rule) sites.push(rule);
    }
    const searchPages = [];
    for (const p of (Array.isArray(raw.searchPages) ? raw.searchPages : []).slice(0, 60)) {
      if (safeRegexSource(p)) searchPages.push(p); else warnings.push(`searchPages: skipped ${p}`);
    }
    const generic = raw.generic ? selectorList(raw.generic, warnings, 'generic') : G.GENERIC_CONTAINERS.slice();
    if (errors.length) return { errors, warnings };
    return { errors, warnings, data: { format: G.SITES_FORMAT, version: str(raw.version, 40) || '1', sites, generic, searchPages } };
  }

  function validateSite(s, warnings) {
    if (!s || typeof s !== 'object') return null;
    const name = str(s.name, 40) || 'Site';
    const hosts = (Array.isArray(s.hosts) ? s.hosts : []).map((h) => String(h).trim().toLowerCase().replace(/^www\./, ''))
      .filter((h) => /^[a-z0-9*][a-z0-9.*-]*$/.test(h) && h.length <= 100).slice(0, 20);
    const detect = typeof s.detect === 'string' ? selectorList([s.detect], warnings, `${name}.detect`)[0] || '' : '';
    if (!hosts.length && !detect) { warnings.push(`Site "${name}" has no "hosts" or "detect", skipped.`); return null; }
    const selectors = selectorList(s.selectors, warnings, `${name}.selectors`);
    if (!selectors.length) { warnings.push(`Site "${name}" has no selectors, skipped.`); return null; }
    return { name, hosts, detect, selectors, topic: selectorList(s.topic, warnings, `${name}.topic`), live: s.live === true };
  }

  function hostMatches(host, pattern) {
    host = String(host || '').toLowerCase().replace(/^www\./, '');
    if (!pattern) return false;
    if (pattern.includes('*')) {
      const body = pattern.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[a-z0-9-]+(?:\\.[a-z0-9-]+)*');
      return new RegExp('(^|\\.)' + body + '$').test(host);
    }
    return host === pattern || host.endsWith('.' + pattern);
  }

  /** Site rule for a hostname: the user's own rules first, then the shared rules file. */
  function siteRuleFor(host, sitesData, customSites) {
    const lists = [customSites || [], (sitesData && sitesData.sites) || []];
    for (const list of lists) {
      for (const r of list) if (r && r.hosts && r.hosts.some((h) => hostMatches(host, h))) return r;
    }
    return null;
  }

  function detectRules(sitesData, customSites) {
    return [].concat(customSites || [], (sitesData && sitesData.sites) || []).filter((r) => r && r.detect && !(r.hosts && r.hosts.length));
  }

  /* ---------- pack state inside settings ---------- */

  /** Make sure settings.packs has an entry, with category defaults, for every installed pack. */
  function withPackState(settings, packList) {
    const out = settings.packs && typeof settings.packs === 'object' ? settings.packs : {};
    for (const p of packList) {
      const st = out[p.id] || {};
      const cats = {};
      for (const c of p.categories) {
        const cs = (st.categories && st.categories[c.id]) || {};
        cats[c.id] = {
          enabled: typeof cs.enabled === 'boolean' ? cs.enabled : c.defaultOn,
          extra: Array.isArray(cs.extra) ? cs.extra : [],
          removed: Array.isArray(cs.removed) ? cs.removed : []
        };
      }
      out[p.id] = {
        enabled: typeof st.enabled === 'boolean' ? st.enabled : true,
        extraContext: Array.isArray(st.extraContext) ? st.extraContext : [],
        categories: cats
      };
    }
    settings.packs = out;
    return settings;
  }

  function enabledPacks(settings, packList) {
    return packList.filter((p) => settings.packs[p.id] && settings.packs[p.id].enabled);
  }

  /* ---------- storage (extension contexts only) ---------- */

  async function loadPackStore() {
    const got = await chrome.storage.local.get(PACKS_KEY);
    return got[PACKS_KEY] || {};
  }

  async function savePackStore(store) {
    await chrome.storage.local.set({ [PACKS_KEY]: store });
  }

  async function loadSitesStore() {
    const got = await chrome.storage.local.get(SITES_KEY);
    return got[SITES_KEY] || null;
  }

  function packListFrom(store) {
    return Object.values(store || {}).map((e) => e && e.pack).filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Everything a page, popup or options page needs, in one storage read. */
  async function loadAll() {
    const got = await chrome.storage.local.get([G.settings.KEY, PACKS_KEY, SITES_KEY]);
    return fromRaw(got[G.settings.KEY], got[PACKS_KEY], got[SITES_KEY]);
  }

  function fromRaw(rawSettings, rawPacks, rawSites) {
    const store = rawPacks || {};
    const packs = packListFrom(store);
    const settings = withPackState(G.settings.merge(rawSettings), packs);
    return { settings, packs, packStore: store, sites: (rawSites && rawSites.data) || null, sitesEntry: rawSites || null };
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache', credentials: 'omit', redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.length > 2_000_000) throw new Error('File is too large');
    return JSON.parse(text);
  }

  /** Add or replace a pack. source: bundled | url | file | custom */
  async function putPack(pack, source, url) {
    const store = await loadPackStore();
    store[pack.id] = { pack, source, url: url || '', fetchedAt: Date.now(), error: '' };
    await savePackStore(store);
    return store[pack.id];
  }

  async function removePack(id) {
    const store = await loadPackStore();
    delete store[id];
    await savePackStore(store);
  }

  async function subscribe(url) {
    const clean = cleanUrl(url);
    if (!clean) throw new Error('Use an https:// link.');
    const { pack, errors, warnings } = validatePack(await fetchJson(clean));
    if (!pack) throw new Error(errors.join(' '));
    await putPack(pack, 'url', clean);
    return { pack, warnings };
  }

  /** Copy packs and site rules shipped with the extension into storage, without clobbering newer or edited ones. */
  async function installBundled() {
    const store = await loadPackStore();
    for (const path of G.BUNDLED_PACKS) {
      try {
        const { pack } = validatePack(await fetchJson(chrome.runtime.getURL(path)));
        if (!pack) continue;
        const cur = store[pack.id];
        const keep = cur && (cur.source === 'custom' || (cur.source !== 'bundled' && compareVersions(cur.pack.version, pack.version) >= 0));
        if (!keep) store[pack.id] = { pack, source: 'bundled', url: '', fetchedAt: Date.now(), error: '' };
      } catch (_) { /* a broken bundled file must not break install */ }
    }
    await savePackStore(store);

    const cur = await loadSitesStore();
    try {
      const { data } = validateSites(await fetchJson(chrome.runtime.getURL(G.BUNDLED_SITES)));
      const keep = cur && cur.source === 'url' && compareVersions(cur.data.version, data.version) >= 0;
      if (data && !keep) await chrome.storage.local.set({ [SITES_KEY]: { data, source: 'bundled', url: '', fetchedAt: Date.now(), error: '' } });
    } catch (_) {}
  }

  /** Refresh every pack that has an update URL, and the site rules if the user subscribed to a URL. */
  async function updateAll() {
    const report = { updated: [], failed: [], unchanged: [] };
    const store = await loadPackStore();
    for (const [id, entry] of Object.entries(store)) {
      const url = entry.url || (entry.pack && entry.pack.updateUrl);
      if (!url || entry.source === 'custom') continue;
      try {
        const { pack, errors } = validatePack(await fetchJson(url));
        if (!pack) throw new Error(errors.join(' '));
        if (pack.id !== id) throw new Error(`the file is for pack "${pack.id}", not "${id}"`);
        const changed = JSON.stringify(pack) !== JSON.stringify(entry.pack);
        store[id] = { pack, source: entry.source === 'bundled' ? 'url' : entry.source, url, fetchedAt: Date.now(), error: '' };
        (changed ? report.updated : report.unchanged).push(pack.name);
      } catch (e) {
        store[id] = Object.assign({}, entry, { error: e.message, fetchedAt: Date.now() });
        report.failed.push(`${entry.pack ? entry.pack.name : id}: ${e.message}`);
      }
    }
    await savePackStore(store);

    const s = await G.settings.load();
    if (s.sitesUrl) {
      try {
        const { data, errors } = validateSites(await fetchJson(s.sitesUrl));
        if (!data) throw new Error(errors.join(' '));
        await chrome.storage.local.set({ [SITES_KEY]: { data, source: 'url', url: s.sitesUrl, fetchedAt: Date.now(), error: '' } });
        report.updated.push('Site rules');
      } catch (e) {
        const cur = (await loadSitesStore()) || {};
        await chrome.storage.local.set({ [SITES_KEY]: Object.assign({}, cur, { error: e.message }) });
        report.failed.push(`Site rules: ${e.message}`);
      }
    }
    return report;
  }

  async function resetSitesToBundled() {
    await chrome.storage.local.remove(SITES_KEY);
    await installBundled();
  }

  const api = {
    PACKS_KEY, SITES_KEY, LIMITS,
    slug, safeRegexSource, cleanUrl, compareVersions,
    validatePack, packTemplate, validateSites, validateSite, hostMatches, siteRuleFor, detectRules,
    withPackState, enabledPacks, packListFrom, fromRaw,
    loadAll, loadPackStore, loadSitesStore, putPack, removePack, subscribe, installBundled, updateAll, resetSitesToBundled
  };
  root.GSS = root.GSS || {};
  root.GSS.packs = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
