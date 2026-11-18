/*
 * Community reports. When enough different people report the same video, post or screenshot as a spoiler,
 * the community server lists it and every Spoiler Shield that follows that server hides it.
 *
 * What is sent, and only when you report: the item's ids (like "youtube:abc123"), fingerprints of its
 * pictures, its visible title (to learn new names), the channel name, which pack it was about, and a random
 * install id that is not linked to you. Nothing is sent while you browse; the feed is a plain download.
 */
(function (root) {
  'use strict';
  const G = root.GSS || {};

  const KEY_RE = /^[a-z0-9-]+:[A-Za-z0-9_.-]{3,64}$/;
  const HASH_RE = /^[0-9a-f]{16}$/;
  const CLIENT_KEY = 'clientId';

  /** The feed comes from a server: keep only well-formed, bounded data. */
  function validateFeed(raw) {
    const out = { version: '', items: {}, hashes: [], learned: {} };
    if (!raw || typeof raw !== 'object') return out;
    out.version = String(raw.version || '').slice(0, 40);
    let n = 0;
    for (const [k, v] of Object.entries(raw.items || {})) {
      if (++n > 50000) break;
      if (KEY_RE.test(k)) out.items[k] = Math.max(1, Math.min(1e6, Number(v && v.n !== undefined ? v.n : v) || 1));
    }
    for (const h of (Array.isArray(raw.hashes) ? raw.hashes : []).slice(0, 20000)) {
      const hex = typeof h === 'string' ? h : h && h.h;
      if (HASH_RE.test(hex)) out.hashes.push({ h: hex, n: Math.max(1, Number(h.n) || 1) });
    }
    const P = G.packs;
    for (const [packId, l] of Object.entries(raw.learned || {}).slice(0, 50)) {
      if (!/^[a-z0-9-]{1,40}$/.test(packId) || !l) continue;
      out.learned[packId] = { terms: P ? P.plainTerms(l.terms, 300) : [], authors: P ? P.plainTerms(l.authors, 300) : [] };
    }
    return out;
  }

  function base(url) {
    const clean = G.packs ? G.packs.cleanUrl(url) : url;
    return clean ? clean.replace(/\/+$/, '') : '';
  }

  async function clientId() {
    const got = await chrome.storage.local.get(CLIENT_KEY);
    if (got[CLIENT_KEY]) return got[CLIENT_KEY];
    const id = crypto.randomUUID();
    await chrome.storage.local.set({ [CLIENT_KEY]: id });
    return id;
  }

  async function post(url, path, body) {
    const b = base(url);
    if (!b) throw new Error('No community server set');
    const res = await fetch(b + path, {
      method: 'POST', credentials: 'omit', cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.assign({ client: await clientId() }, body))
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json().catch(() => ({}));
  }

  async function sync(url) {
    const b = base(url);
    if (!b) {
      await chrome.storage.local.remove(G.packs.COMMUNITY_KEY);
      return null;
    }
    const prev = (await chrome.storage.local.get(G.packs.COMMUNITY_KEY))[G.packs.COMMUNITY_KEY] || {};
    try {
      const feed = validateFeed(await G.packs.fetchJson(b + '/v1/feed'));
      const entry = Object.assign(feed, { url: b, fetchedAt: Date.now(), error: '' });
      await chrome.storage.local.set({ [G.packs.COMMUNITY_KEY]: entry });
      return entry;
    } catch (e) {
      await chrome.storage.local.set({ [G.packs.COMMUNITY_KEY]: Object.assign({}, prev, { url: b, error: e.message, fetchedAt: Date.now() }) });
      throw e;
    }
  }

  const api = { validateFeed, clientId, post, sync, KEY_RE, HASH_RE };
  root.GSS = root.GSS || {};
  root.GSS.community = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
