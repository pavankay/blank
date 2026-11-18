/*
 * Spoiler Shield content script.
 * Watches the page from document_start, finds the "card" around any GTA VI spoiler text and covers it
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
  const SHIELD_TITLE = '🛡️ Spoiler shielded';

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'TEMPLATE', 'HEAD', 'TITLE', 'META', 'LINK']);
  const BLOCK_TAGS = new Set(['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TD', 'TH', 'DD', 'DT', 'BLOCKQUOTE', 'FIGCAPTION', 'FIGURE', 'DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'A', 'SPAN', 'LABEL', 'PRE']);
  const NEVER_CONTAINER = new Set(['HTML', 'BODY', 'MAIN', 'HEAD']);
  const SEMANTIC_SEL = 'article, [role="article"], li, figure, blockquote';
  const ATTR_SEL = 'img[alt], [title], [aria-label]';
  const CARD_TEXT_LIMIT = 600;      // fallback climbs to the largest ancestor with at most this much text
  const MAX_CONTAINER_TEXT = 5000;  // generic containers bigger than this are "the page", not a card
  const MAX_SITE_TEXT = 25000;

  const siteRule = G.SITE_CONTAINERS.find((r) => r.host.test(location.hostname));
  const SITE_SEL = siteRule ? siteRule.selectors.join(',') : '';
  const GENERIC_SEL = G.GENERIC_CONTAINERS.filter((s) => !SEMANTIC_SEL.includes(s)).join(',');

  let settings = null;
  let matcher = null;
  let active = false;
  let assumeContext = false;
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
    return t.length > 30000 ? t.slice(0, 30000) : t;
  }

  /* ---------- scanning ---------- */

  function considerText(textNode) {
    const p = textNode.parentElement;
    if (!p || SKIP_TAGS.has(p.tagName) || isOurs(p)) return;
    const data = textNode.data;
    if (!data || data.length < 2) return;
    if (!matcher.mightTrigger(data, assumeContext)) return;
    const c = findContainer(p);
    if (c) candidates.add(c);
  }

  function considerAttrs(el) {
    if (isOurs(el)) return;
    const v = (el.getAttribute('alt') || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('aria-label') || '');
    if (v.length < 3 || !matcher.mightTrigger(v, assumeContext)) return;
    const c = findContainer(el);
    if (c) candidates.add(c);
  }

  function scanRoot(root) {
    if (!active || !root) return;
    if (root.nodeType === 3) { considerText(root); return; }
    if (root.nodeType !== 1) return;
    if (SKIP_TAGS.has(root.tagName) || isOurs(root)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) considerText(n);

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
    if (!el.isConnected || !active) return;
    // A covered ancestor already hides this one.
    const coveredAncestor = el.parentElement && el.parentElement.closest('.gss-shielded');
    if (coveredAncestor) return;

    const text = containerText(el);
    const h = hash(text);
    if (sig.get(el) === h) {
      // Same content, but the site may have thrown our overlay or classes away while re-rendering.
      if (shielded.has(el)) repairShield(el);
      return;
    }
    sig.set(el, h);

    if (revealedSig.has(el)) {
      if (revealedSig.get(el) === h) return;
      revealedSig.delete(el); // recycled element with new content: judge it again
    }

    const result = matcher.evaluate(text, { assumeContext });
    if (result) shieldEl(el, result);
    else if (shielded.has(el)) unshieldEl(el);
  }

  /* ---------- covering elements ---------- */

  function actionText() {
    if (settings.revealMode === 'locked') return 'Locked · pause from the toolbar to view';
    if (settings.revealMode === 'hold') return 'Hold to reveal';
    return 'Click to reveal';
  }

  function reasonsText(result) {
    if (!settings.showReasons) return '';
    const seen = new Set();
    const parts = [];
    for (const c of result.categories) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      parts.push(`${c.emoji} ${c.label}`);
    }
    return parts.slice(0, 3).join('  ·  ');
  }

  function buildOverlay(result) {
    const ov = document.createElement('div');
    ov.className = 'gss-overlay';
    ov.setAttribute('role', 'button');
    ov.tabIndex = 0;
    const reasons = reasonsText(result);
    ov.setAttribute('aria-label', `Spoiler shielded${reasons ? ': ' + result.categories.map((c) => c.label).join(', ') : ''}. ${actionText()}.`);
    // All visible text comes from CSS (attr()), so the overlay adds nothing to the page's textContent.
    const parts = [
      ['gss-ov-badge', '🛡️'],
      ['gss-ov-title', 'Spoiler shielded'],
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
    el.classList.remove('gss-style-blur', 'gss-style-redact', 'gss-style-collapse');
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
    el.classList.remove('gss-shielded', 'gss-pos', 'gss-inline', 'gss-thumbs', 'gss-style-blur', 'gss-style-redact', 'gss-style-collapse');
    delete el.dataset.gssCats;
    shielded.delete(el);
    resizeObserver.unobserve(el);
  }

  function revealEl(el) {
    unshieldEl(el);
    revealedSig.set(el, sig.get(el) || hash(containerText(el)));
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

  function checkPage() {
    if (!active || !settings) return;
    lastPageCheck = Date.now();
    const url = location.href;
    const headline = pageHeadline();
    const pathWords = decodeURIComponent(location.pathname).replace(/[-_/+.]+/g, ' ');

    const urlCtx = G.urlHasContext(url);
    const textCtx = matcher.contextScore(G.normalize(headline + ' ' + pathWords)).score >= matcher.threshold;
    const nextAssume = !!settings.pageContext && (urlCtx || textCtx);
    if (nextAssume !== assumeContext) {
      assumeContext = nextAssume;
      rescan();
    }

    if (!IS_TOP) return;
    if (!settings.pageShield || G.isSearchPage(url) || pageRevealedUrls.has(url)) { hidePageShield(); return; }
    const result = matcher.evaluate(headline + ' ' + pathWords, { assumeContext: urlCtx });
    if (result) showPageShield(result);
    else hidePageShield();
  }

  function schedulePageCheck() {
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
        <div class="glow"></div>
        <div class="card">
          <div class="logo">${SHIELD_SVG}</div>
          <p class="eyebrow">Spoiler Shield · GTA VI</p>
          <h1 id="t">This page looks like a spoiler</h1>
          <p class="sub">${settings.showReasons ? 'It seems to be about:' : 'We covered it before it loaded.'}</p>
          ${settings.showReasons ? `<ul class="chips">${reasons.map((c) => `<li>${c.emoji} ${escapeHtml(c.label)}</li>`).join('')}</ul>` : ''}
          <div class="actions">
            <button class="primary" data-a="back">Take me back</button>
            ${locked ? '' : '<button data-a="show">Show page</button>'}
            ${locked ? '' : '<button class="ghost" data-a="trust">Turn off on this site</button>'}
          </div>
          <p class="fine">${locked ? 'Reveal is locked. Pause the shield from the toolbar to view this page.' : 'Showing the page keeps posts, comments and thumbnails on it shielded.'}</p>
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
        considerAttrs(target);
      }
      // Content changed inside a covered or revealed card: judge it again (YouTube recycles cards).
      const el = target.nodeType === 1 ? target : target.parentElement;
      const covered = el && el.closest && el.closest('.gss-shielded');
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
    observer.observe(document.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['alt', 'title', 'aria-label']
    });
    checkPage();
    rescan();
  }

  function stop() {
    if (observer) observer.disconnect();
    unshieldAll();
    hidePageShield();
    assumeContext = false;
    scheduleCount();
  }

  function applySettings(next) {
    settings = next;
    matcher = G.compile(settings);
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
        active,
        reason: settings ? S.inactiveReason(settings, HOST) : 'loading',
        count: shielded.size,
        byCategory: cats,
        pageShielded: !!pageShield,
        pageCategories: pageShield ? pageShield.result.categories.map((c) => c.id) : [],
        pageContext: assumeContext
      });
      return;
    }
    if (msg.type === 'reveal-all') {
      for (const el of Array.from(shielded)) revealEl(el);
      if (IS_TOP && pageShield) { pageRevealedUrls.add(location.href); hidePageShield(); }
      reply && reply({ ok: true });
      return;
    }
    if (msg.type === 'shield-target') {
      const t = lastContextMenuTarget;
      if (!t) return;
      const el = findContainer(t.nodeType === 1 ? t : t.parentElement);
      if (el) {
        revealedSig.delete(el);
        shieldEl(el, { categories: [{ id: 'manual', label: 'Shielded by you', emoji: '✋', term: '' }] });
        scheduleCount();
      }
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[S.KEY]) applySettings(S.merge(changes[S.KEY].newValue));
  });

  // SPA navigations that do not touch the DOM right away.
  window.addEventListener('popstate', () => setTimeout(() => { if (location.href !== lastUrl) onNavigate(); }, 50));
  document.addEventListener('yt-navigate-finish', () => onNavigate());
  setInterval(() => {
    if (!active) return;
    if (location.href !== lastUrl) onNavigate();
    for (const el of shielded) {
      if (!el.isConnected) { shielded.delete(el); continue; }
      repairShield(el);
    }
  }, 1000);
  document.addEventListener('DOMContentLoaded', () => { if (active) { checkPage(); scanRoot(document.body); flush(); } });

  S.load().then(applySettings).catch(() => {});

  /* ---------- page shield assets ---------- */

  const SHIELD_SVG = `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5fa2"/><stop offset=".55" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ffd166"/></linearGradient></defs><path d="M32 4 8 13v17c0 15.5 10.2 26.6 24 30 13.8-3.4 24-14.5 24-30V13L32 4z" fill="url(#g)"/><path d="M20 33c3.6-5.3 7.6-8 12-8s8.4 2.7 12 8c-3.6 5.3-7.6 8-12 8s-8.4-2.7-12-8z" fill="#1a1033"/><circle cx="32" cy="33" r="4" fill="#ffd166"/><path d="M18 46 46 18" stroke="#1a1033" stroke-width="4.5" stroke-linecap="round"/></svg>`;

  const PAGE_SHIELD_CSS = `
    :host { all: initial; }
    .wrap { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; padding: 16px;
      background: radial-gradient(1200px 700px at 20% 110%, #ff5fa233, transparent 60%),
                  radial-gradient(900px 600px at 90% -10%, #3dd6f533, transparent 60%), #0e0a1f;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #f6f1ff; overflow: auto; }
    .glow { position: absolute; width: 520px; height: 520px; border-radius: 50%; filter: blur(80px);
      background: conic-gradient(from 180deg, #ff5fa2, #ff8a3d, #ffd166, #3dd6f5, #ff5fa2); opacity: .18; animation: spin 18s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .glow { animation: none; } }
    .card { position: relative; max-width: 460px; width: 100%; text-align: center; padding: 36px 28px 26px;
      background: #1a1433e6; border: 1px solid #ffffff1f; border-radius: 22px; box-shadow: 0 30px 80px #0008; }
    .logo { display: grid; place-items: center; margin-bottom: 10px; }
    .eyebrow { margin: 0 0 6px; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #ff9fca; font-weight: 700; }
    h1 { margin: 0 0 8px; font-size: 26px; line-height: 1.2; font-weight: 800; }
    .sub { margin: 0 0 12px; color: #c9bfe6; font-size: 14px; }
    .chips { list-style: none; padding: 0; margin: 0 0 22px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .chips li { padding: 6px 12px; border-radius: 999px; background: #ffffff12; border: 1px solid #ffffff22; font-size: 13px; font-weight: 600; }
    .actions { display: flex; flex-direction: column; gap: 10px; }
    button { all: unset; box-sizing: border-box; cursor: pointer; padding: 12px 16px; border-radius: 12px; font-size: 15px; font-weight: 700;
      background: #ffffff14; color: #f6f1ff; border: 1px solid #ffffff26; text-align: center; transition: transform .12s, background .12s; }
    button:hover { background: #ffffff22; }
    button:active { transform: scale(.98); }
    button:focus-visible { outline: 3px solid #3dd6f5; outline-offset: 2px; }
    button.primary { background: linear-gradient(135deg, #ff5fa2, #ff8a3d); border-color: transparent; color: #1a1033; }
    button.ghost { background: transparent; border-color: transparent; color: #c9bfe6; font-weight: 600; font-size: 13px; }
    .fine { margin: 16px 0 0; font-size: 12px; color: #9c92bd; }
  `;
})();
