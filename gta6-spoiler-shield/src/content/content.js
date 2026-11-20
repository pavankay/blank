/*
 * Spoiler Shield content script.
 * Watches the page from document_start, finds the "card" around any spoiler text and covers it
 * before it paints. Big spoiler pages (articles, watch pages) get a full-page shield instead.
 */
(() => {
  'use strict';
  if (window.__gssLoaded) return;
  window.__gssLoaded = true;

  const G = globalThis.GSS;
  const S = G.settings;
  const IS_TOP = window === window.top;
  const HOST = location.hostname.replace(/^www\./, '');
  const SHIELD_TITLE = 'Hidden page';

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'TEMPLATE', 'HEAD', 'TITLE', 'META', 'LINK']);
  const BLOCK_TAGS = new Set(['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TD', 'TH', 'DD', 'DT', 'BLOCKQUOTE', 'FIGCAPTION', 'FIGURE', 'DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'A', 'SPAN', 'LABEL', 'PRE']);
  const NEVER_CONTAINER = new Set(['HTML', 'BODY', 'MAIN', 'HEAD']);
  const SEMANTIC_SEL = 'article, [role="article"], li, figure, blockquote, [role="option"]';
  const ATTR_SEL = 'img[alt], [title], [aria-label]';
  const CARD_TEXT_LIMIT = 600;      // fallback climbs to the largest ancestor with at most this much text
  const MAX_CONTAINER_TEXT = 5000;  // generic containers bigger than this are "the page", not a card
  const MAX_SITE_TEXT = 25000;

  const P = G.packs;
  let siteRule = null;               // from the site rules data (or the user's own rules)
  let SITE_SEL = '';
  let sitesData = null;
  let packList = [];
  const OBSERVE_OPTS = {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['alt', 'title', 'aria-label', 'src', 'poster']
  };
  const shadowRoots = new Set();   // open shadow roots we watch (web-component sites like new Reddit)
  let shadowSeen = false;
  let GENERIC_SEL = G.GENERIC_CONTAINERS.filter((s) => !SEMANTIC_SEL.includes(s)).join(',');

  let settings = null;
  let matcher = null;
  let active = false;
  let assumePacks = [];              // packs the current page itself is about
  let observer = null;
  let resumeTimer = null;

  let sig = new WeakMap();           // container -> text signature at last evaluation
  const revealedSig = new WeakMap(); // container -> signature when the user revealed it
  const counted = new WeakSet();     // containers already counted in stats
  const shielded = new Set();        // containers currently covered
  const candidates = new Set();

  let lastUrl = location.href;
  let realTitle = '';
  const pageRevealedUrls = new Set();
  let pageShield = null;             // { host, result }
  let lastPageCheck = 0;
  let pageCheckTimer = null;
  let lastContextMenuTarget = null;

  // Reports, community feed and image checks
  let itemIdRes = [];                // compiled item-id patterns from the site rules
  const knownKeys = new Map();       // item key -> { source: 'you' | 'community', n }
  let safeKeys = new Set();          // items you marked "not a spoiler"
  let reportedHashes = [];           // [{ h, source, n }] fingerprints of reported pictures
  let safeHashes = [];
  let watchingMedia = false;         // whether pictures alone can trigger a check
  const mediaHosts = new WeakMap();  // card -> elements covering its pictures
  const mediaRevealed = new WeakMap(); // card -> signature when its pictures were revealed
  const imageChecked = new Map();    // picture URL -> fingerprint ('' if none)
  const pendingHash = new Map();     // picture URL -> Set(cards) waiting for a fingerprint
  let hashTimer = null;
  const visionDone = new Map();      // picture URL -> result | 'pending'
  const visionWaiting = new Map();   // picture URL -> Set(cards)
  let visionBudget = 60;             // on-device checks per page

  let statQueue = {};
  let statTimer = null;
  let countTimer = null;

  const resizeObserver = new ResizeObserver((entries) => {
    for (const e of entries) {
      const ov = e.target.__gssOverlay;
      if (!ov) continue;
      const h = e.contentRect.height;
      const w = e.contentRect.width;
      ov.classList.toggle('gss-compact', h < 72 || w < 180);
      ov.classList.toggle('gss-tiny', h < 30);
    }
  });

  /* ---------- helpers ---------- */

  function send(msg) {
    try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (_) { /* extension reloaded */ }
  }

  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return h + ':' + s.length;
  }

  function isOurs(node) {
    const el = node && (node.nodeType === 1 ? node : node.parentElement);
    return !!(el && el.closest && el.closest('.gss-overlay, gss-page-shield'));
  }

  function safeClosest(el, sel) {
    if (!sel) return null;
    try { return el.closest(sel); } catch (_) { return null; }
  }

  function textLen(el) { return (el.textContent || '').length; }

  /* ---------- container detection ---------- */

  function findContainer(el) {
    if (!el || el.nodeType !== 1) return null;
    if (isOurs(el) || el.isContentEditable) return null;
    // Text inside a shadow root: cover the light-DOM host, where our overlay and styles can live.
    const rootNode = el.getRootNode && el.getRootNode();
    if (rootNode && rootNode !== document && rootNode.host) return findContainer(rootNode.host);

    let c = null;
    if (SITE_SEL) {
      const s = safeClosest(el, SITE_SEL);
      if (s && !NEVER_CONTAINER.has(s.tagName) && textLen(s) <= MAX_SITE_TEXT) c = s;
    }
    if (!c) {
      const s = safeClosest(el, SEMANTIC_SEL);
      if (s && !NEVER_CONTAINER.has(s.tagName) && textLen(s) <= MAX_CONTAINER_TEXT) c = s;
    }
    if (!c) {
      const s = safeClosest(el, GENERIC_SEL);
      if (s && !NEVER_CONTAINER.has(s.tagName) && textLen(s) <= MAX_CONTAINER_TEXT) c = s;
    }
    if (!c) {
      // Climb to the largest ancestor that still looks like a single card.
      let n = el;
      let best = null;
      while (n && !NEVER_CONTAINER.has(n.tagName)) {
        const len = textLen(n);
        if (len > CARD_TEXT_LIMIT) break;
        if (BLOCK_TAGS.has(n.tagName) || n.tagName.includes('-')) best = n;
        if (isRepeatedItem(n)) break; // n is one post in a feed of look-alike siblings: stop here
        n = n.parentElement;
      }
      c = best || el;
    }

    // A shadow host without a default slot would not render our overlay; cover its parent instead.
    if (c.shadowRoot && !c.shadowRoot.querySelector('slot:not([name])') && c.parentElement && !NEVER_CONTAINER.has(c.parentElement.tagName)) {
      c = c.parentElement;
    }
    return c;
  }

  function isRepeatedItem(el) {
    const p = el.parentElement;
    if (!p || p.children.length < 2) return false;
    let same = 0;
    for (const sib of p.children) {
      if (sib.tagName === el.tagName && sib.className === el.className && (sib.textContent || '').trim().length > 10) same++;
      if (same >= 2) return true;
    }
    return false;
  }

  function containerText(el) {
    let t = el.textContent || '';
    const own = [el.getAttribute('aria-label'), el.getAttribute('title')];
    t += ' ' + own.filter(Boolean).join(' ');
    const nodes = el.querySelectorAll(ATTR_SEL);
    for (let i = 0; i < nodes.length && i < 60; i++) {
      const n = nodes[i];
      if (isOurs(n)) continue;
      const a = n.getAttribute('alt');
      const ti = n.getAttribute('title');
      const ar = n.getAttribute('aria-label');
      if (a) t += ' ' + a;
      if (ti) t += ' ' + ti;
      if (ar) t += ' ' + ar;
    }
    if (shadowSeen) t += ' ' + shadowText(el, 0);
    return t.length > 30000 ? t.slice(0, 30000) : t;
  }

  function shadowText(el, depth) {
    if (depth > 3) return '';
    let t = '';
    if (el.shadowRoot) t += ' ' + el.shadowRoot.textContent + shadowText(el.shadowRoot, depth + 1);
    const all = el.querySelectorAll('*');
    for (let i = 0; i < all.length && i < 2000; i++) {
      const sr = all[i].shadowRoot;
      if (sr) t += ' ' + sr.textContent + shadowText(sr, depth + 1);
    }
    return t;
  }

  function watchShadowRoot(sr) {
    if (!sr || shadowRoots.has(sr)) return;
    shadowRoots.add(sr);
    shadowSeen = true;
    if (observer && active) observer.observe(sr, OBSERVE_OPTS);
    scanRoot(sr);
  }

  function closestComposed(el, sel) {
    let n = el;
    while (n) {
      const c = n.closest ? n.closest(sel) : null;
      if (c) return c;
      const r = n.getRootNode ? n.getRootNode() : null;
      n = r && r.host ? r.host : null;
    }
    return null;
  }

  /* ---------- pictures, item ids, authors ---------- */

  const MEDIA_WRAP = 'a, picture, figure, ytd-thumbnail, yt-thumbnail-view-model, [class*="thumb"], [class*="Thumb"], [class*="media"], [class*="Media"], [data-testid="tweetPhoto"], [data-testid="videoPlayer"]';

  function mediaSrc(m) {
    const s = m.tagName === 'VIDEO' ? (m.poster || '') : (m.currentSrc || m.getAttribute('src') || m.getAttribute('data-src') || '');
    if (!s) return '';
    try { const u = new URL(s, location.href).href; return /^(https?:|data:image\/)/.test(u) ? u : ''; } catch (_) { return ''; }
  }

  /** Pictures and videos in a card that are worth covering or checking (not avatars, icons or emoji). */
  function mediaIn(el) {
    const out = [];
    const nodes = el.querySelectorAll('img, video');
    for (let i = 0; i < nodes.length && out.length < 4; i++) {
      const m = nodes[i];
      if (isOurs(m) || !mediaSrc(m)) continue;
      const cls = `${typeof m.className === 'string' ? m.className : ''} ${m.getAttribute('alt') || ''}`;
      if (/avatar|emoji|icon|logo|profile|badge|spinner/i.test(cls)) continue;
      if (m.closest('[id*="avatar"], [class*="avatar"], [class*="Avatar"]')) continue;
      const w = m.width || Number(m.getAttribute('width')) || 0;
      const h = m.height || Number(m.getAttribute('height')) || 0;
      if ((w && w < 48) || (h && h < 36)) continue;
      out.push(m);
    }
    return out;
  }

  function mediaHost(m, card) {
    let h = m.parentElement;
    let n = h;
    while (n && n !== card) {
      if ((n.textContent || '').trim().length > 40) break;
      h = n;
      if (n.matches && n.matches(MEDIA_WRAP)) break;
      n = n.parentElement;
    }
    return h;
  }

  function hexHash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(16) + s.length.toString(16);
  }

  /** Keys for a URL: its item ids, or a page key for ordinary pages. */
  function pageKeys(url) {
    if (!url) return [];
    const keys = P.keysFor(url, itemIdRes);
    try { const u = new URL(url, location.href); keys.push('page:' + hexHash(u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/+$/, ''))); } catch (_) {}
    return keys;
  }

  function itemKeysOf(el) {
    if (!itemIdRes.length) return [];
    const keys = new Set();
    const add = (u) => { if (u) for (const k of P.keysFor(u, itemIdRes)) keys.add(k); };
    if (el.href) add(el.href);
    const links = el.querySelectorAll('a[href]');
    for (let i = 0; i < links.length && i < 25; i++) add(links[i].href);
    const media = el.querySelectorAll('img, video, iframe');
    for (let i = 0; i < media.length && i < 8; i++) add(media[i].currentSrc || media[i].src || media[i].poster);
    return Array.from(keys);
  }

  function lookupKeys(keys) {
    let best = null;
    for (const k of keys) {
      const hit = knownKeys.get(k);
      if (hit && (!best || hit.source === 'you' || hit.n > best.n)) best = hit;
    }
    return best;
  }

  function reportedCat(hit) {
    return {
      id: 'custom/reported', pack: 'custom', emoji: '🚩', term: '',
      label: hit.source === 'you' ? 'Reported by you' : `Reported by ${hit.n} ${hit.n === 1 ? 'person' : 'people'}`
    };
  }

  function authorOf(el) {
    if (!el || !siteRule || !siteRule.author) return '';
    for (const sel of siteRule.author) {
      let a = null;
      try { a = el.querySelector(sel); } catch (_) {}
      if (a && a.textContent.trim()) return a.textContent.trim().slice(0, 80);
    }
    return '';
  }

  /* ---------- scanning ---------- */

  function considerText(textNode) {
    const p = textNode.parentElement;
    if (!p || SKIP_TAGS.has(p.tagName) || isOurs(p)) return;
    const data = textNode.data;
    if (!data || data.length < 2) return;
    if (!matcher.mightTrigger(data, assumePacks)) return;
    const c = findContainer(p);
    if (c) candidates.add(c);
  }

  function considerAttrs(el) {
    if (isOurs(el)) return;
    const v = (el.getAttribute('alt') || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('aria-label') || '');
    if (v.length < 3 || !matcher.mightTrigger(v, assumePacks)) return;
    const c = findContainer(el);
    if (c) candidates.add(c);
  }

  function considerMedia(m) {
    if (isOurs(m) || !mediaSrc(m)) return;
    const c = findContainer(m);
    if (c) candidates.add(c);
  }

  function considerLink(a) {
    const keys = P.keysFor(a.href, itemIdRes);
    if (!keys.some((k) => knownKeys.has(k) || safeKeys.has(k))) return;
    const c = findContainer(a);
    if (c) candidates.add(c);
  }

  function scanRoot(root) {
    if (!active || !root) return;
    if (root.nodeType === 3) { considerText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 11) return;
    if (root.nodeType === 1 && (SKIP_TAGS.has(root.tagName) || isOurs(root))) return;
    if (root.shadowRoot) watchShadowRoot(root.shadowRoot);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeType === 3) { considerText(n); continue; }
      if (n.shadowRoot) watchShadowRoot(n.shadowRoot);
      if (watchingMedia && (n.tagName === 'IMG' || n.tagName === 'VIDEO')) considerMedia(n);
      else if (knownKeys.size && n.tagName === 'A') considerLink(n);
    }
    if (root.nodeType === 1 && watchingMedia && (root.tagName === 'IMG' || root.tagName === 'VIDEO')) considerMedia(root);

    if (root.matches && root.matches(ATTR_SEL)) considerAttrs(root);
    const withAttrs = root.querySelectorAll ? root.querySelectorAll(ATTR_SEL) : [];
    for (const el of withAttrs) considerAttrs(el);
  }

  function flush() {
    if (!candidates.size) return;
    const list = Array.from(candidates);
    candidates.clear();
    for (const c of list) evaluateContainer(c);
    scheduleCount();
  }

  function evaluateContainer(el) {
    if (el.__gssCard && el.__gssCard !== el) el = el.__gssCard; // a covered picture: judge its whole card
    if (!el.isConnected || !active) return;
    // A covered ancestor already hides this one.
    const coveredAncestor = el.parentElement && el.parentElement.closest('.gss-shielded:not(.gss-media)');
    if (coveredAncestor) return;

    const media = mediaIn(el);
    const text = containerText(el);
    const h = hash(text + '|' + media.map(mediaSrc).join('|'));
    if (sig.get(el) === h) {
      // Same content, but the site may have thrown our overlay or classes away while re-rendering.
      if (shielded.has(el)) repairShield(el);
      for (const mh of mediaHosts.get(el) || []) if (shielded.has(mh)) repairShield(mh);
      return;
    }
    sig.set(el, h);

    if (revealedSig.has(el)) {
      if (revealedSig.get(el) === h) return;
      revealedSig.delete(el); // recycled element with new content: judge it again
    }

    // 1. You said this one is fine.
    const keys = itemKeysOf(el);
    if (keys.some((k) => safeKeys.has(k))) {
      unshieldMedia(el);
      if (shielded.has(el)) unshieldEl(el);
      return;
    }

    // 2. The words give it away, or 3. you or enough people reported this exact video or post.
    let result = matcher.evaluate(text, { assume: assumePacks });
    if (!result) {
      const hit = lookupKeys(keys);
      if (hit) result = { categories: [reportedCat(hit)] };
    }
    if (result) {
      unshieldMedia(el);
      shieldEl(el, result);
      return;
    }
    if (shielded.has(el) && !el.classList.contains('gss-media')) unshieldEl(el);

    // 4. About the game, with a picture, but no words saying what it shows: cover only the picture.
    const un = media.length ? matcher.unlabeled(text, { assume: assumePacks }) : null;
    if (un) shieldMedia(el, media, un);
    else unshieldMedia(el);

    // 5. The picture itself: a repost of a reported screenshot, or text written inside the thumbnail.
    if (media.length) {
      if (settings.hashImages && reportedHashes.length) queueHashCheck(el, media);
      if (!un) queueVision(el, media, text);
    }
  }

  /* ---------- covering pictures only ---------- */

  function shieldMedia(card, media, cat) {
    if (mediaRevealed.has(card) && mediaRevealed.get(card) === sig.get(card)) return;
    const hosts = [];
    for (const m of media) {
      const host = mediaHost(m, card);
      if (host && !hosts.some((x) => x.contains(host) || host.contains(x))) hosts.push(host);
    }
    for (const old of mediaHosts.get(card) || []) if (!hosts.includes(old)) unshieldEl(old);
    for (const host of hosts) {
      host.__gssCard = card;
      shieldEl(host, { categories: [cat] });
      host.classList.add('gss-media');
    }
    mediaHosts.set(card, hosts);
  }

  function unshieldMedia(card) {
    for (const host of mediaHosts.get(card) || []) if (shielded.has(host)) unshieldEl(host);
    mediaHosts.delete(card);
  }

  /* ---------- picture fingerprints ---------- */

  function queueHashCheck(card, media) {
    for (const m of media.slice(0, 3)) {
      const u = mediaSrc(m);
      if (!u) continue;
      if (imageChecked.has(u)) { applyHash(card, imageChecked.get(u)); continue; }
      if (!pendingHash.has(u)) pendingHash.set(u, new Set());
      pendingHash.get(u).add(card);
    }
    if (pendingHash.size && !hashTimer) hashTimer = setTimeout(flushHashes, 120);
  }

  async function flushHashes() {
    hashTimer = null;
    const batch = new Map(pendingHash);
    pendingHash.clear();
    let res = null;
    try { res = await chrome.runtime.sendMessage({ type: 'hash-images', urls: Array.from(batch.keys()) }); } catch (_) {}
    for (const [u, cards] of batch) {
      const h = (res && res.hashes && res.hashes[u]) || '';
      imageChecked.set(u, h);
      for (const c of cards) applyHash(c, h);
    }
    scheduleCount();
  }

  function applyHash(card, h) {
    if (!h || !active || !card.isConnected || revealedSig.has(card)) return;
    if (shielded.has(card) && !card.classList.contains('gss-media')) return;
    if (safeHashes.some((x) => P.hashDistance(h, x) <= G.HASH_DISTANCE)) return;
    const hit = reportedHashes.find((x) => P.hashDistance(h, x.h) <= G.HASH_DISTANCE);
    if (!hit) return;
    unshieldMedia(card);
    shieldEl(card, { categories: [{
      id: 'custom/reported-image', pack: 'custom', emoji: '🧩', term: '',
      label: hit.source === 'you' ? 'Same picture you reported' : `Same picture ${hit.n} people reported`
    }] });
  }

  /* ---------- on-device vision ---------- */

  function visionActive() {
    return !!settings && settings.vision === 'on' && (assumePacks.length > 0 || !!(siteRule && siteRule.visionFeed));
  }

  function queueVision(card, media, text) {
    if (!visionActive()) return;
    const u = mediaSrc(media[0]);
    if (!u) return;
    const prev = visionDone.get(u);
    if (prev && prev !== 'pending') { applyVision(card, text, prev); return; }
    if (!visionWaiting.has(u)) visionWaiting.set(u, new Set());
    visionWaiting.get(u).add(card);
    if (prev === 'pending' || visionBudget <= 0) return;
    visionBudget--;
    visionDone.set(u, 'pending');
    chrome.runtime.sendMessage({ type: 'vision-analyze', url: u }).then((r) => {
      const v = r && r.ok !== false ? r : { text: '', videoGame: false, game: '' };
      visionDone.set(u, v);
      for (const c of visionWaiting.get(u) || []) applyVision(c, containerText(c), v);
      visionWaiting.delete(u);
      scheduleCount();
    }).catch(() => visionDone.set(u, { text: '', videoGame: false, game: '' }));
  }

  function applyVision(card, text, v) {
    if (!active || !card.isConnected || revealedSig.has(card)) return;
    if (shielded.has(card) && !card.classList.contains('gss-media')) return;
    const seen = `${v.text || ''} ${v.game || ''}`.trim();
    if (!seen) return;
    const r = matcher.evaluate(text + ' \n ' + seen, { assume: assumePacks });
    if (r) {
      r.categories = r.categories.map((c) => Object.assign({}, c, { label: `${c.label} (in the picture)` }));
      unshieldMedia(card);
      shieldEl(card, r);
      return;
    }
    if (v.videoGame) {
      const un = matcher.unlabeled(text + ' ' + (v.game || ''), { assume: assumePacks });
      if (un) shieldMedia(card, mediaIn(card), un);
    }
  }

  /* ---------- covering elements ---------- */

  function actionText() {
    if (settings.revealMode === 'locked') return 'Locked';
    if (settings.revealMode === 'hold') return 'Hold to show';
    return 'Show';
  }

  function reasonsText(result) {
    if (!settings.showReasons) return '';
    const seen = new Set();
    const parts = [];
    for (const c of result.categories) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      parts.push(c.label);
    }
    return parts.slice(0, 2).join(', ');
  }

  function buildOverlay(result) {
    const ov = document.createElement('div');
    ov.className = 'gss-overlay';
    ov.setAttribute('role', 'button');
    ov.tabIndex = 0;
    const reasons = reasonsText(result);
    ov.setAttribute('aria-label', `Possible spoiler${reasons ? ': ' + reasons : ''}. ${actionText()}.`);
    // All visible text comes from CSS (attr()), so the overlay adds nothing to the page's textContent.
    const parts = [
      ['gss-ov-title', 'Possible spoiler'],
      ['gss-ov-reasons', reasons],
      ['gss-ov-action', actionText()]
    ];
    const inner = document.createElement('div');
    inner.className = 'gss-ov-inner';
    for (const [cls, t] of parts) {
      if (!t) continue;
      const s = document.createElement('span');
      s.className = cls;
      s.dataset.t = t;
      inner.appendChild(s);
    }
    const prog = document.createElement('span');
    prog.className = 'gss-ov-progress';
    ov.appendChild(inner);
    ov.appendChild(prog);
    return ov;
  }

  function shieldEl(el, result) {
    // Replace any covered descendants: one overlay per card.
    for (const s of Array.from(shielded)) {
      if (s !== el && el.contains(s)) unshieldEl(s);
    }
    const ids = Array.from(new Set(result.categories.map((c) => c.id)));
    const key = ids.join(',');
    if (shielded.has(el) && el.dataset.gssCats === key && el.__gssOverlay && el.__gssOverlay.isConnected) return;
    if (el.__gssOverlay) el.__gssOverlay.remove();

    el.classList.add('gss-shielded');
    el.classList.remove('gss-style-blur', 'gss-style-redact', 'gss-style-collapse', 'gss-media');
    el.classList.add('gss-style-' + (settings.blockStyle || 'blur'));
    el.classList.toggle('gss-thumbs', !!settings.hideThumbnails);
    el.dataset.gssCats = key;

    const cs = getComputedStyle(el);
    if (cs.position === 'static') el.classList.add('gss-pos');
    if (cs.display === 'inline') el.classList.add('gss-inline');

    const ov = buildOverlay(result);
    el.__gssOverlay = ov;
    el.appendChild(ov);
    shielded.add(el);
    resizeObserver.observe(el);

    if (!counted.has(el)) {
      counted.add(el);
      for (const id of ids) statQueue[id] = (statQueue[id] || 0) + 1;
      scheduleStats();
    }
  }

  function repairShield(el) {
    if (!el.classList.contains('gss-shielded')) {
      el.classList.add('gss-shielded', 'gss-style-' + (settings.blockStyle || 'blur'));
      if (settings.hideThumbnails) el.classList.add('gss-thumbs');
      if (getComputedStyle(el).position === 'static') el.classList.add('gss-pos');
    }
    if (el.__gssOverlay && !el.__gssOverlay.isConnected) el.appendChild(el.__gssOverlay);
  }

  function unshieldEl(el) {
    if (el.__gssOverlay) { el.__gssOverlay.remove(); el.__gssOverlay = null; }
    el.classList.remove('gss-shielded', 'gss-pos', 'gss-inline', 'gss-thumbs', 'gss-style-blur', 'gss-style-redact', 'gss-style-collapse', 'gss-media');
    delete el.dataset.gssCats;
    shielded.delete(el);
    resizeObserver.unobserve(el);
  }

  function revealEl(el) {
    const card = el.__gssCard;
    if (card && card !== el) {
      // Revealing a covered picture: keep its card's text judgement, just show the picture.
      unshieldEl(el);
      mediaRevealed.set(card, sig.get(card));
      mediaHosts.set(card, (mediaHosts.get(card) || []).filter((x) => x !== el));
    } else {
      unshieldEl(el);
      revealedSig.set(el, sig.get(el) || hash(containerText(el)));
      if (card === el) mediaRevealed.set(el, sig.get(el));
    }
    scheduleCount();
  }

  function unshieldAll() {
    for (const el of Array.from(shielded)) unshieldEl(el);
  }

  /* ---------- reveal interactions (capture phase so the page never sees the click) ---------- */

  function overlayFromEvent(e) {
    const t = e.target;
    return t && t.nodeType === 1 && t.closest ? t.closest('.gss-overlay') : null;
  }

  let holdTimer = null;
  let holdEl = null;

  function cancelHold() {
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = null;
    if (holdEl) holdEl.classList.remove('gss-holding');
    holdEl = null;
  }

  function block(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  for (const type of ['click', 'auxclick', 'dblclick', 'mousedown', 'mouseup', 'pointerup', 'touchstart', 'touchend', 'contextmenu']) {
    window.addEventListener(type, (e) => {
      const ov = overlayFromEvent(e);
      if (!ov) return;
      if (type === 'contextmenu') { e.stopPropagation(); return; }
      block(e);
      if (type === 'click' && settings && settings.revealMode === 'click') revealEl(ov.parentElement);
      if ((type === 'mouseup' || type === 'touchend' || type === 'pointerup') && holdEl) cancelHold();
    }, { capture: true, passive: false });
  }

  window.addEventListener('pointerdown', (e) => {
    const ov = overlayFromEvent(e);
    if (!ov) return;
    block(e);
    if (!settings || settings.revealMode !== 'hold') return;
    cancelHold();
    holdEl = ov;
    ov.classList.add('gss-holding');
    holdTimer = setTimeout(() => { const host = ov.parentElement; cancelHold(); revealEl(host); }, 900);
  }, { capture: true, passive: false });

  window.addEventListener('pointercancel', cancelHold, true);
  window.addEventListener('pointerleave', (e) => { if (holdEl && e.target === holdEl) cancelHold(); }, true);

  window.addEventListener('keydown', (e) => {
    const ov = overlayFromEvent(e);
    if (!ov || (e.key !== 'Enter' && e.key !== ' ')) return;
    block(e);
    if (settings && settings.revealMode !== 'locked') revealEl(ov.parentElement);
  }, true);

  window.addEventListener('contextmenu', (e) => { lastContextMenuTarget = e.target; }, true);

  /* ---------- page shield ---------- */

  function getRealTitle() {
    const t = document.title || '';
    if (t !== SHIELD_TITLE) realTitle = t;
    return realTitle;
  }

  function pageHeadline() {
    const h1 = document.querySelector('h1');
    const og = document.querySelector('meta[property="og:title"]');
    return [getRealTitle(), h1 ? h1.textContent : '', og ? og.content : ''].join(' \n ');
  }

  /** Text of the elements that say what the page is about: stream category, channel name, hashtag header. */
  function topicText() {
    if (!siteRule || !siteRule.topic) return '';
    let t = '';
    for (const sel of siteRule.topic) {
      let el = null;
      try { el = document.querySelector(sel); } catch (_) {}
      if (el) t += ' ' + el.textContent;
    }
    return t.slice(0, 600);
  }

  function checkPage() {
    if (!active || !settings) return;
    lastPageCheck = Date.now();
    const url = location.href;
    const headline = pageHeadline();
    let pathWords = '';
    try { pathWords = decodeURIComponent(location.pathname).replace(/[-_/+.]+/g, ' '); } catch (_) {}
    const topic = topicText();

    const urlPacks = matcher.urlPacks(url);
    const topicPacks = topic ? matcher.contextPacks(topic) : [];
    const textPacks = matcher.contextPacks(headline + ' ' + pathWords);
    const next = settings.pageContext ? Array.from(new Set([...urlPacks, ...topicPacks, ...textPacks])).sort() : [];
    if (next.join() !== assumePacks.join()) {
      assumePacks = next;
      rescan();
    }

    if (!IS_TOP) return;
    const keysHere = pageKeys(url);
    if (keysHere.some((k) => safeKeys.has(k))) { hidePageShield(); return; }
    if (!settings.pageShield || G.isSearchPage(url, sitesData && sitesData.searchPages) || pageRevealedUrls.has(url)) { hidePageShield(); return; }
    let result = matcher.evaluate(headline + ' ' + pathWords, { assume: urlPacks });
    if (!result) {
      const hit = lookupKeys(keysHere);
      if (hit) result = { categories: [reportedCat(hit)] };
    }
    // A stream whose category belongs to a pack is live footage of it, whatever the streamer called it.
    if (!result && siteRule && siteRule.live) {
      const live = topicPacks.map((id) => matcher.liveCategory(id)).filter(Boolean);
      if (live.length) result = { categories: live };
    }
    if (result) showPageShield(result);
    else hidePageShield();
  }

  function setSiteRule(r) {
    siteRule = r || null;
    SITE_SEL = siteRule ? siteRule.selectors.join(',') : '';
  }

  /** Self-hosted networks (Mastodon...) are recognised by their page, not their hostname. */
  function resolveSiteRule() {
    if (siteRule) return;
    const r = P.detectRules(sitesData, settings && settings.customSites).find((x) => {
      try { return !!document.querySelector(x.detect); } catch (_) { return false; }
    });
    if (!r) return;
    setSiteRule(r);
    if (active) rescan();
  }

  function schedulePageCheck() {
    if (!siteRule) resolveSiteRule();
    const since = Date.now() - lastPageCheck;
    if (since > 250) { checkPage(); return; }
    if (pageCheckTimer) return;
    pageCheckTimer = setTimeout(() => { pageCheckTimer = null; checkPage(); }, 260 - since);
  }

  function pauseAllMedia() {
    for (const m of document.querySelectorAll('video, audio')) { try { m.pause(); } catch (_) {} }
  }

  document.addEventListener('play', (e) => {
    if (pageShield && settings && settings.pauseVideos) { try { e.target.pause(); } catch (_) {} }
  }, true);

  function showPageShield(result) {
    const reasons = Array.from(new Map(result.categories.map((c) => [c.id, c])).values());
    const key = reasons.map((c) => c.id).join(',');
    if (pageShield && pageShield.key === key && pageShield.host.isConnected) return;
    hidePageShield();

    const host = document.createElement('gss-page-shield');
    const root = host.attachShadow({ mode: 'closed' });
    const locked = settings.revealMode === 'locked';
    root.innerHTML = `
      <style>${PAGE_SHIELD_CSS}</style>
      <div class="wrap" role="dialog" aria-modal="true" aria-labelledby="t">
        <div class="card">
          <p class="eyebrow">Spoiler Shield</p>
          <h1 id="t">This page might spoil ${escapeHtml(packNames(reasons))}</h1>
          ${settings.showReasons ? `<p class="sub">${escapeHtml(reasons.map((c) => c.label).join(', '))}</p>` : ''}
          <div class="actions">
            <button class="primary" data-a="back">Go back</button>
            ${locked ? '' : '<button data-a="show">Show the page</button>'}
          </div>
          <p class="fine">${locked
            ? 'Showing hidden pages is turned off. Pause Spoiler Shield from the toolbar if you need this page.'
            : 'If you show it, posts and pictures on the page stay hidden. <button class="link" data-a="trust">Turn off on this site</button>'}</p>
        </div>
      </div>`;
    root.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('button');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'back') {
        if (history.length > 1) history.back();
        else location.href = 'about:blank';
      } else if (a === 'show') {
        pageRevealedUrls.add(location.href);
        hidePageShield();
      } else if (a === 'trust') {
        send({ type: 'disable-site', host: HOST });
      }
    });
    document.documentElement.appendChild(host);
    document.documentElement.classList.add('gss-page-locked');
    pageShield = { host, key, result };
    if (getRealTitle() && document.title !== SHIELD_TITLE) document.title = SHIELD_TITLE;
    if (settings.pauseVideos) pauseAllMedia();
    const focusBtn = root.querySelector('button.primary');
    if (focusBtn) setTimeout(() => focusBtn.focus(), 0);
    send({ type: 'stats', add: Object.fromEntries(reasons.map((c) => [c.id, 1])), host: HOST, page: true });
    scheduleCount();
  }

  function hidePageShield() {
    if (!pageShield) return;
    pageShield.host.remove();
    pageShield = null;
    document.documentElement.classList.remove('gss-page-locked');
    if (document.title === SHIELD_TITLE && realTitle) document.title = realTitle;
    scheduleCount();
  }

  function packNames(cats) {
    const names = Array.from(new Set(cats.map((c) => c.pack).filter((id) => id && id !== 'custom')))
      .map((id) => (packList.find((p) => p.id === id) || {}).short || id);
    return names.length ? names.join(' + ') : 'Your rules';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- observer ---------- */

  function onMutations(muts) {
    if (!active) return;
    if (location.href !== lastUrl) onNavigate();
    let headChanged = false;
    for (const m of muts) {
      const target = m.target;
      if (isOurs(target)) continue;
      if (target.nodeName === 'TITLE' || (target.parentNode && target.parentNode.nodeName === 'TITLE')) { headChanged = true; continue; }

      if (m.type === 'childList') {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1 && (n.tagName === 'H1' || n.tagName === 'TITLE' || n.tagName === 'META')) headChanged = true;
          if (!isOurs(n)) scanRoot(n);
        }
      } else if (m.type === 'characterData') {
        considerText(target);
      } else if (m.type === 'attributes') {
        if (m.attributeName === 'src' || m.attributeName === 'poster') {
          // A lazy-loaded picture arrived: recheck its card if pictures matter here or the card was judged before.
          const c = findContainer(target);
          if (c && (watchingMedia || sig.has(c))) candidates.add(c);
        } else considerAttrs(target);
      }
      // Content changed inside a covered or revealed card: judge it again (YouTube recycles cards).
      const el = target.nodeType === 1 ? target : target.parentElement;
      const covered = el && closestComposed(el, '.gss-shielded');
      if (covered) candidates.add(covered);
    }
    flush();
    if (headChanged) schedulePageCheck();
  }

  function onNavigate() {
    lastUrl = location.href;
    hidePageShield();
    schedulePageCheck();
  }

  function rescan() {
    sig = new WeakMap();
    unshieldAll();
    scanRoot(document.documentElement);
    flush();
  }

  /* ---------- lifecycle ---------- */

  function start() {
    if (!observer) observer = new MutationObserver(onMutations);
    observer.disconnect();
    observer.observe(document.documentElement, OBSERVE_OPTS);
    for (const sr of shadowRoots) {
      if (sr.host && sr.host.isConnected) observer.observe(sr, OBSERVE_OPTS);
      else shadowRoots.delete(sr);
    }
    checkPage();
    rescan();
  }

  function stop() {
    if (observer) observer.disconnect();
    unshieldAll();
    hidePageShield();
    assumePacks = [];
    scheduleCount();
  }

  function applyData(data) {
    sitesData = data.sites;
    packList = data.packs;
    if (sitesData && Array.isArray(sitesData.generic) && sitesData.generic.length) {
      GENERIC_SEL = sitesData.generic.filter((s) => !SEMANTIC_SEL.includes(s)).join(',');
    }
    const hostRule = P.siteRuleFor(location.hostname, sitesData, data.settings.customSites);
    if (hostRule || (siteRule && siteRule.hosts && siteRule.hosts.length)) setSiteRule(hostRule);

    itemIdRes = P.compileItemIds(sitesData);
    knownKeys.clear();
    const feed = data.community || {};
    for (const [k, n] of Object.entries(feed.items || {})) knownKeys.set(k, { source: 'community', n });
    for (const k of Object.keys(data.reports.items || {})) knownKeys.set(k, { source: 'you', n: 1 });
    safeKeys = new Set(Object.keys(data.reports.safe || {}));
    reportedHashes = (data.reports.hashes || []).map((x) => ({ h: x.h, source: 'you', n: 1 }))
      .concat((feed.hashes || []).map((x) => ({ h: x.h, source: 'community', n: x.n })));
    safeHashes = (data.reports.safeHashes || []).map((x) => x.h);
    watchingMedia = (data.settings.hashImages && reportedHashes.length > 0) || knownKeys.size > 0 || data.settings.vision === 'on';
    visionBudget = 60;
    applySettings(data.settings);
  }

  function applySettings(next) {
    settings = next;
    matcher = G.compile(settings, P.enabledPacks(settings, packList));
    clearTimeout(resumeTimer);
    const reason = S.inactiveReason(settings, HOST);
    const was = active;
    active = !reason;
    document.documentElement.style.setProperty('--gss-blur', (settings.blockStyle === 'redact' ? 0 : 16) + 'px');
    if (active) start();
    else if (was || shielded.size || pageShield) stop();
    if (reason === 'paused') {
      resumeTimer = setTimeout(() => applySettings(settings), Math.max(1000, settings.pausedUntil - Date.now() + 200));
    }
  }

  /* ---------- stats & badge ---------- */

  function scheduleStats() {
    if (statTimer) return;
    statTimer = setTimeout(() => {
      statTimer = null;
      const add = statQueue;
      statQueue = {};
      if (Object.keys(add).length) send({ type: 'stats', add, host: HOST });
    }, 1500);
  }

  function currentCount() { return shielded.size + (pageShield ? 1 : 0); }

  function scheduleCount() {
    if (countTimer) return;
    countTimer = setTimeout(() => {
      countTimer = null;
      send({ type: 'count', count: currentCount(), top: IS_TOP });
    }, 300);
  }

  /* ---------- messages from popup / background ---------- */

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (!msg || !msg.type) return;
    if (msg.type === 'status') {
      if (!IS_TOP) return;
      const cats = {};
      for (const el of shielded) for (const id of (el.dataset.gssCats || '').split(',')) if (id) cats[id] = (cats[id] || 0) + 1;
      reply({
        host: HOST,
        site: siteRule ? siteRule.name : null,
        active,
        reason: settings ? S.inactiveReason(settings, HOST) : 'loading',
        count: shielded.size,
        byCategory: cats,
        pageShielded: !!pageShield,
        pageCategories: pageShield ? pageShield.result.categories.map((c) => c.id) : [],
        pageContext: assumePacks.length > 0,
        pagePacks: assumePacks
      });
      return;
    }
    if (msg.type === 'reveal-all') {
      for (const el of Array.from(shielded)) revealEl(el);
      if (IS_TOP && pageShield) { pageRevealedUrls.add(location.href); hidePageShield(); }
      reply && reply({ ok: true });
      return;
    }
    if (msg.type === 'report-target' || msg.type === 'report-page') {
      if (msg.type === 'report-page' && !IS_TOP) return;
      handleReport(msg.kind || 'report', msg, msg.type === 'report-page').then((r) => reply && reply(r));
      return true;
    }
    if (msg.type === 'shield-target') {
      const t = lastContextMenuTarget;
      if (!t) return;
      const el = findContainer(t.nodeType === 1 ? t : t.parentElement);
      if (el) {
        revealedSig.delete(el);
        shieldEl(el, { categories: [{ id: 'custom/manual', pack: 'custom', label: 'Shielded by you', emoji: '✋', term: '' }] });
        scheduleCount();
      }
    }
  });

  /* ---------- reporting ---------- */

  async function handleReport(kind, info, wholePage) {
    let el = null;
    const t = wholePage ? null : lastContextMenuTarget;
    if (t) {
      const base = t.nodeType === 1 ? t : t.parentElement;
      const ov = base && base.closest && base.closest('.gss-overlay');
      if (ov) el = ov.parentElement;
      else if (base && base !== document.body && base !== document.documentElement && !base.closest('gss-page-shield')) el = findContainer(base);
      if (el && el.__gssCard) el = el.__gssCard;
    }
    const page = !el;
    let keys;
    let title;
    let author = '';
    let urls = [];
    if (page) {
      keys = pageKeys(location.href);
      title = pageHeadline();
      const og = document.querySelector('meta[property="og:image"]');
      if (og && og.content) urls.push(og.content);
    } else {
      keys = itemKeysOf(el).concat(P.keysFor(info.linkUrl, itemIdRes), P.keysFor(info.srcUrl, itemIdRes));
      if (!keys.length) {
        const a = el.matches('a[href]') ? el : el.querySelector('a[href]');
        keys = pageKeys(info.linkUrl || (a && a.href) || '').filter((k) => k.startsWith('page:'));
      }
      title = containerText(el);
      author = authorOf(el);
      urls = mediaIn(el).map(mediaSrc);
      if (info.srcUrl) urls.unshift(info.srcUrl);
    }
    keys = Array.from(new Set(keys));
    urls = Array.from(new Set(urls)).slice(0, 3);
    let hashes = [];
    if (urls.length) {
      try {
        const r = await chrome.runtime.sendMessage({ type: 'hash-images', urls });
        hashes = Object.values((r && r.hashes) || {}).filter(Boolean);
      } catch (_) {}
    }
    const packs = Array.from(new Set(matcher.contextPacks(title + ' ' + (page ? '' : pageHeadline())).concat(assumePacks)));

    if (kind === 'safe') {
      if (el) {
        unshieldMedia(el);
        if (shielded.has(el)) unshieldEl(el);
        revealedSig.set(el, sig.get(el));
      } else {
        pageRevealedUrls.add(location.href);
        hidePageShield();
      }
      scheduleCount();
      return chrome.runtime.sendMessage({ type: 'not-spoiler', keys, hashes }).catch(() => ({ ok: false }));
    }

    // Hide it right away; the background stores it and shares it if you follow a community server.
    const cat = reportedCat({ source: 'you', n: 1 });
    if (el) { unshieldMedia(el); revealedSig.delete(el); shieldEl(el, { categories: [cat] }); }
    else if (IS_TOP) { pageRevealedUrls.delete(location.href); showPageShield({ categories: [cat] }); }
    scheduleCount();
    return chrome.runtime.sendMessage({ type: 'report', keys, hashes, title, author, packs, page }).catch(() => ({ ok: false }));
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if ([S.KEY, P.PACKS_KEY, P.SITES_KEY, P.LEARNED_KEY, P.COMMUNITY_KEY, P.REPORTS_KEY].some((k) => changes[k])) P.loadAll().then(applyData).catch(() => {});
  });

  // SPA navigations that do not touch the DOM right away.
  window.addEventListener('popstate', () => setTimeout(() => { if (location.href !== lastUrl) onNavigate(); }, 50));
  document.addEventListener('yt-navigate-finish', () => onNavigate());
  // Shadow roots created by the page (reported by main-world.js).
  document.addEventListener('gss-shadow-attached', (e) => {
    const host = e.composedPath()[0];
    if (host && host.shadowRoot && active) { watchShadowRoot(host.shadowRoot); flush(); }
  }, true);

  setInterval(() => {
    if (!active) return;
    if (location.href !== lastUrl) onNavigate();
    if (siteRule && siteRule.topic) schedulePageCheck();
    for (const el of shielded) {
      if (!el.isConnected) { shielded.delete(el); continue; }
      repairShield(el);
    }
  }, 1000);
  document.addEventListener('DOMContentLoaded', () => {
    resolveSiteRule();
    if (active) { checkPage(); scanRoot(document.body); flush(); }
  });

  P.loadAll().then(applyData).catch(() => {});

  /* ---------- page shield assets ---------- */

  const PAGE_SHIELD_CSS = `
    :host { all: initial; }
    .wrap { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; padding: 16px; overflow: auto;
      background: #f5f4f0; color: #1d1c1a; font: 14px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    .card { max-width: 440px; width: 100%; }
    .eyebrow { margin: 0 0 10px; font-size: 12px; color: #8a857d; }
    h1 { margin: 0 0 6px; font-size: 22px; line-height: 1.25; font-weight: 600; }
    .sub { margin: 0 0 20px; color: #6c6862; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
    button { all: unset; box-sizing: border-box; cursor: pointer; padding: 7px 14px; border-radius: 6px; font-size: 14px; font-weight: 500;
      border: 1px solid #cfcbc2; background: #fff; color: inherit; }
    button:hover { background: #efede8; }
    button:focus-visible { outline: 2px solid #2d63c8; outline-offset: 2px; }
    button.primary { background: #1d1c1a; border-color: #1d1c1a; color: #f5f4f0; }
    button.primary:hover { background: #3a3835; }
    button.link { padding: 0; border: 0; background: none; text-decoration: underline; text-underline-offset: 2px; font-size: inherit; color: inherit; }
    .fine { margin: 18px 0 0; font-size: 12px; color: #8a857d; }
    @media (prefers-color-scheme: dark) {
      .wrap { background: #17171a; color: #e9e8e4; }
      .eyebrow, .fine { color: #8d8a84; }
      .sub { color: #a19e98; }
      button { background: #1f1f23; border-color: #3d3d44; }
      button:hover { background: #2a2a2f; }
      button.primary { background: #e9e8e4; border-color: #e9e8e4; color: #17171a; }
      button.primary:hover { background: #fff; }
      button.link { background: none; }
    }
  `;
})();
