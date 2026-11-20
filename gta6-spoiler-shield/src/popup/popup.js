(() => {
  'use strict';
  const G = globalThis.GSS;
  const S = G.settings;
  const P = G.packs;
  let packs = [];

  /** Short name for a stats key, e.g. "gta6/story" -> "Story". */
  function describe(key) {
    const [packId, id] = key.split('/');
    if (packId === 'custom') {
      if (id === 'keywords') return 'Your words';
      if (id === 'manual') return 'Hidden by you';
      if (id === 'reported' || id === 'reported-image') return 'Reported';
      const r = (settings.customRules || []).find((x) => x.id === id);
      return r ? r.label : id;
    }
    const p = packs.find((x) => x.id === packId);
    if (id === 'general') return p ? p.short : packId;
    const c = p && p.categories.find((x) => x.id === id);
    return c ? (c.short || c.label) : key;
  }
  const $ = (id) => document.getElementById(id);

  const SENS_HINTS = {
    relaxed: () => 'Only obvious spoilers: endings, deaths, leaks. News and trailers stay up.',
    balanced: (t) => `Anything about ${t} in the categories you've ticked.`,
    strict: (t) => `Every mention of ${t}, even news.`
  };
  const topicNames = () => {
    const on = packs.filter((p) => settings.packs[p.id] && settings.packs[p.id].enabled).map((p) => p.short);
    return on.length ? on.join(' or ') : 'your topics';
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
    const count = status ? status.count + (status.pageShielded ? 1 : 0) : 0;
    $('status').textContent = ({
      on: status && status.pageShielded ? 'page hidden' : 'hidden on this page',
      off: 'Off',
      paused: `Paused ${minutesLeft(settings.pausedUntil)}`,
      site: 'Off on this site',
      expired: `Stopped on ${settings.activeUntil}`,
      na: 'Can’t run here'
    })[state];
    $('host').textContent = special ? 'Chrome doesn’t let extensions into this page' : (h || 'this page');
    $('count').textContent = state === 'on' ? fmt(count) : '–';

    const mini = $('mini');
    mini.textContent = '';
    if (status && !reason) {
      const parts = Object.entries(status.byCategory || {}).sort((a, b) => b[1] - a[1]).slice(0, 4)
        .map(([id, n]) => `${describe(id)} ${n}`);
      if (status.pageContext) {
        const names = (status.pagePacks || []).map((id) => (packs.find((p) => p.id === id) || {}).short || id).join(', ');
        parts.push(`whole page treated as ${names}`);
      }
      mini.textContent = parts.join(' · ');
    }

    $('pauseBtn').textContent = reason === 'paused' ? 'Resume' : 'Pause';
    $('pauseBtn').classList.toggle('on', reason === 'paused');
    const siteOff = h && S.siteDisabled(settings, h);
    $('siteBtn').textContent = siteOff ? 'Turn on here' : 'Turn off here';
    $('siteBtn').classList.toggle('on', !!siteOff);
    $('siteBtn').disabled = !h || special;
    $('revealBtn').disabled = !count;
    $('reportBtn').disabled = !status || !!reason;

    for (const b of $('sensitivity').querySelectorAll('button')) {
      b.setAttribute('aria-checked', String(b.dataset.v === settings.sensitivity));
    }
    $('sensHint').textContent = SENS_HINTS[settings.sensitivity](topicNames());

    renderCats();
  }

  function chip(id, label, on, title) {
    const b = document.createElement('button');
    b.className = 'chip-toggle';
    b.type = 'button';
    b.dataset.id = id;
    b.title = title || label;
    b.setAttribute('aria-pressed', String(!!on));
    const l = document.createElement('span');
    l.className = 'lbl';
    l.textContent = label;
    b.appendChild(l);
    return b;
  }

  function renderCats() {
    const box = $('cats');
    box.textContent = '';
    const on = packs.filter((p) => settings.packs[p.id] && settings.packs[p.id].enabled);
    $('edition').textContent = on.length ? on.map((p) => p.short).join(', ') : 'no packs on';
    if (!packs.length) {
      const e = document.createElement('p');
      e.className = 'hint';
      e.textContent = 'No packs installed. Add one in Settings.';
      box.appendChild(e);
    }
    for (const p of packs) {
      const st = settings.packs[p.id];
      if (packs.length > 1) {
        const h = document.createElement('button');
        h.type = 'button';
        h.className = 'pack-head' + (st.enabled ? ' on' : '');
        h.setAttribute('aria-pressed', String(st.enabled));
        h.title = st.enabled ? `Turn the ${p.name} pack off` : `Turn the ${p.name} pack on`;
        h.textContent = st.enabled ? p.name : `${p.name} (off)`;
        h.addEventListener('click', () => save((s) => { s.packs[p.id].enabled = !s.packs[p.id].enabled; }));
        box.appendChild(h);
      }
      if (!st.enabled) continue;
      for (const c of p.categories) {
        const b = chip(`${p.id}/${c.id}`, c.short || c.label, st.categories[c.id].enabled, `${c.label}${c.description ? ': ' + c.description : ''}`);
        b.addEventListener('click', () => save((s) => { const cs = s.packs[p.id].categories[c.id]; cs.enabled = !cs.enabled; }));
        box.appendChild(b);
      }
    }
    const cbox = $('customCats');
    cbox.textContent = '';
    for (const r of settings.customRules || []) {
      const b = chip(r.id, r.label || 'Custom rule', r.enabled, (r.terms || []).join(', '));
      b.addEventListener('click', () => save((s) => {
        const x = s.customRules.find((y) => y.id === r.id);
        if (x) x.enabled = !x.enabled;
      }));
      cbox.appendChild(b);
    }
  }

  async function reload() {
    const data = await P.loadAll();
    settings = data.settings;
    packs = data.packs;
  }

  async function save(mutator) {
    await S.update(async (s) => { P.withPackState(s, packs); await mutator(s); });
    await reload();
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
    await reload();
    render();
    refreshStatus();
    const stats = await S.loadStats();
    $('lifetime').textContent = `${fmt(stats.total)} hidden so far`;
  }

  /* ---------- events ---------- */

  $('enabled').addEventListener('change', (e) => save((s) => { s.enabled = e.target.checked; if (s.enabled) s.pausedUntil = 0; }));

  $('sensitivity').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) save((s) => { s.sensitivity = b.dataset.v; });
  });

  const setAll = (v) => save((s) => {
    for (const id in s.packs) if (s.packs[id].enabled) for (const k in s.packs[id].categories) s.packs[id].categories[k].enabled = v;
  });
  $('allOn').addEventListener('click', () => setAll(true));
  $('allOff').addEventListener('click', () => setAll(false));

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
    await reload();
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

  $('reportBtn').addEventListener('click', async () => {
    if (!tab) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'report-page', kind: 'report' }, { frameId: 0 });
      $('reportBtn').textContent = 'Reported';
    } catch (_) {
      $('reportBtn').textContent = 'Can’t report here';
    }
    $('reportBtn').disabled = true;
    setTimeout(refreshStatus, 300);
  });

  $('quickForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('quickInput').value.trim();
    if (!v) return;
    save((s) => { if (!s.keywords.includes(v)) s.keywords.push(v); }).then(() => {
      $('quickInput').value = '';
      $('quickInput').placeholder = `Added “${v}”`;
      setTimeout(refreshStatus, 300);
    });
  });

  $('openOptions').addEventListener('click', () => chrome.runtime.openOptionsPage());

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[S.KEY] || changes[P.PACKS_KEY]) { reload().then(() => { render(); setTimeout(refreshStatus, 300); }); }
  });

  init();
})();
