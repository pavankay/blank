(() => {
  'use strict';
  const G = globalThis.GSS;
  const S = G.settings;
  const $ = (id) => document.getElementById(id);

  const SENS_HINTS = {
    relaxed: 'Only clear spoilers: endings, deaths, map leaks, walkthroughs. News and trailers stay visible.',
    balanced: 'Anything about GTA VI that touches a category you picked. The recommended setting.',
    strict: 'Total blackout. Every mention of GTA VI is shielded, whatever it is about.'
  };

  let settings = null;
  let tab = null;
  let status = null;

  function fmt(n) { return new Intl.NumberFormat().format(n || 0); }

  function minutesLeft(ts) {
    const m = Math.ceil((ts - Date.now()) / 60000);
    if (m >= 60 * 20) return 'until tomorrow';
    if (m >= 60) return `for ${Math.floor(m / 60)}h ${m % 60}m`;
    return `for ${m} min`;
  }

  function host() { return status ? status.host : (tab && tab.url ? S.hostOf(tab.url) : ''); }

  function render() {
    if (!settings) return;
    const h = host();
    const reason = S.inactiveReason(settings, h);
    const special = !status && tab && !/^https?:|^file:/.test(tab.url || '');

    document.body.classList.toggle('disabled', !!reason);
    $('enabled').checked = settings.enabled;

    const hero = $('hero');
    const state = special ? 'na' : (reason || 'on');
    hero.dataset.state = state;
    $('status').textContent = ({
      on: status && status.pageShielded ? 'Page shielded' : 'Protecting this page',
      off: 'Shield is off',
      paused: `Paused ${minutesLeft(settings.pausedUntil)}`,
      site: 'Off on this site',
      expired: 'Ended on ' + settings.activeUntil,
      na: 'Not available here'
    })[state];
    $('host').textContent = special ? 'Browser pages cannot be filtered' : (h || 'this page') + (status && status.site ? ` · tuned for ${status.site}` : '');

    const count = status ? status.count + (status.pageShielded ? 1 : 0) : 0;
    $('count').textContent = fmt(count);
    const pct = Math.min(1, count / 25);
    $('ringFg').style.strokeDashoffset = String(327 - 327 * (count ? Math.max(0.06, pct) : 0));

    const mini = $('mini');
    mini.textContent = '';
    if (status && !reason) {
      const by = status.byCategory || {};
      const entries = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 4);
      for (const [id, n] of entries) {
        const c = G.CATEGORIES.find((x) => x.id === id) || (settings.customRules || []).find((x) => x.id === id);
        const s = document.createElement('span');
        s.textContent = `${(c && c.emoji) || (id === 'keywords' ? '🔑' : id === 'manual' ? '✋' : '🛡️')} ${n}`;
        s.title = (c && c.label) || id;
        mini.appendChild(s);
      }
      if (status.pageContext) {
        const s = document.createElement('span');
        s.textContent = '📍 GTA VI page';
        s.title = 'This page is about GTA VI, so every post on it is judged as GTA VI';
        mini.appendChild(s);
      }
    }

    $('pauseBtn').textContent = reason === 'paused' ? '▶ Resume' : '⏸ Pause';
    $('pauseBtn').classList.toggle('on', reason === 'paused');
    const siteOff = h && S.siteDisabled(settings, h);
    $('siteBtn').textContent = siteOff ? '✅ On for this site' : '🚫 Off on this site';
    $('siteBtn').classList.toggle('on', !!siteOff);
    $('siteBtn').disabled = !h || special;
    $('revealBtn').disabled = !count;

    for (const b of $('sensitivity').querySelectorAll('button')) {
      b.setAttribute('aria-checked', String(b.dataset.v === settings.sensitivity));
    }
    $('sensHint').textContent = SENS_HINTS[settings.sensitivity];

    renderCats();
  }

  function chip(id, emoji, label, on, title) {
    const b = document.createElement('button');
    b.className = 'chip-toggle';
    b.type = 'button';
    b.dataset.id = id;
    b.title = title || label;
    b.setAttribute('aria-pressed', String(!!on));
    b.innerHTML = '<span class="em"></span><span class="lbl"></span><span class="dot"></span>';
    b.querySelector('.em').textContent = emoji;
    b.querySelector('.lbl').textContent = label;
    return b;
  }

  function renderCats() {
    const box = $('cats');
    box.textContent = '';
    for (const c of G.CATEGORIES) {
      const b = chip(c.id, c.emoji, c.short || c.label, settings.categories[c.id].enabled, `${c.label}: ${c.description}`);
      b.addEventListener('click', () => save((s) => { s.categories[c.id].enabled = !s.categories[c.id].enabled; }));
      box.appendChild(b);
    }
    const cbox = $('customCats');
    cbox.textContent = '';
    for (const r of settings.customRules || []) {
      const b = chip(r.id, r.emoji || '🧩', r.label || 'Custom rule', r.enabled, (r.terms || []).join(', '));
      b.addEventListener('click', () => save((s) => {
        const x = s.customRules.find((y) => y.id === r.id);
        if (x) x.enabled = !x.enabled;
      }));
      cbox.appendChild(b);
    }
  }

  async function save(mutator) {
    settings = await S.update(mutator);
    render();
  }

  async function refreshStatus() {
    if (!tab) return;
    try {
      status = await chrome.tabs.sendMessage(tab.id, { type: 'status' }, { frameId: 0 });
    } catch (_) {
      status = null;
    }
    render();
  }

  async function init() {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    settings = await S.load();
    render();
    refreshStatus();
    const stats = await S.loadStats();
    $('lifetime').textContent = `${fmt(stats.total)} spoiler${stats.total === 1 ? '' : 's'} shielded so far`;
  }

  /* ---------- events ---------- */

  $('enabled').addEventListener('change', (e) => save((s) => { s.enabled = e.target.checked; if (s.enabled) s.pausedUntil = 0; }));

  $('sensitivity').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) save((s) => { s.sensitivity = b.dataset.v; });
  });

  $('allOn').addEventListener('click', () => save((s) => { for (const k in s.categories) s.categories[k].enabled = true; }));
  $('allOff').addEventListener('click', () => save((s) => { for (const k in s.categories) s.categories[k].enabled = false; }));

  const menu = $('pauseMenu');
  $('pauseBtn').addEventListener('click', () => {
    if (S.inactiveReason(settings, host()) === 'paused') { save((s) => { s.pausedUntil = 0; }); return; }
    menu.hidden = !menu.hidden;
    $('pauseBtn').setAttribute('aria-expanded', String(!menu.hidden));
    if (!menu.hidden) menu.querySelector('button').focus();
  });
  menu.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    menu.hidden = true;
    let minutes = Number(b.dataset.min);
    if (b.dataset.min === 'tomorrow') {
      const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(6, 0, 0, 0);
      minutes = Math.ceil((t - Date.now()) / 60000);
    }
    await chrome.runtime.sendMessage({ type: 'pause', minutes });
    settings = await S.load();
    render();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { menu.hidden = true; $('pauseBtn').focus(); } });
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.pause-wrap')) menu.hidden = true; });

  $('siteBtn').addEventListener('click', () => {
    const h = host();
    if (!h) return;
    save((s) => {
      const i = s.disabledSites.findIndex((d) => d === h || h.endsWith('.' + d));
      if (i >= 0) s.disabledSites.splice(i, 1);
      else s.disabledSites.push(h);
    }).then(() => setTimeout(refreshStatus, 250));
  });

  $('revealBtn').addEventListener('click', async () => {
    if (!tab) return;
    try { await chrome.tabs.sendMessage(tab.id, { type: 'reveal-all' }); } catch (_) {}
    setTimeout(refreshStatus, 150);
  });

  $('quickForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('quickInput').value.trim();
    if (!v) return;
    save((s) => { if (!s.keywords.includes(v)) s.keywords.push(v); }).then(() => {
      $('quickInput').value = '';
      $('quickInput').placeholder = `Added “${v}”. Add another…`;
      setTimeout(refreshStatus, 300);
    });
  });

  $('openOptions').addEventListener('click', () => chrome.runtime.openOptionsPage());

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[S.KEY]) { settings = S.merge(changes[S.KEY].newValue); render(); setTimeout(refreshStatus, 300); }
  });

  init();
})();
