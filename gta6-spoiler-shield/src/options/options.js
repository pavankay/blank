(() => {
  'use strict';
  const G = globalThis.GSS;
  const S = G.settings;
  const $ = (id) => document.getElementById(id);

  let settings = null;
  let editingRuleId = null;
  const openCats = new Set();

  const REVEAL_HINTS = {
    click: 'One click on the cover shows what is underneath.',
    hold: 'Press and hold for about a second, so a stray click on a feed never spoils anything.',
    locked: 'Covers cannot be opened from the page. Pause the shield from the toolbar when you really want to look.'
  };

  const LAB_EXAMPLES = [
    'GTA 6 ending explained: who dies?',
    'Full GTA VI map leaked, every location compared',
    'Rockstar shares new GTA 6 screenshots',
    'Jason Duval and Lucia Caminos, first 30 minutes no commentary',
    'GTA VI review: a 10/10 masterpiece',
    'I just finished Vice City Stories for the first time',
    'Best pizza in Port Gellhorn?'
  ];

  /* ---------- helpers ---------- */

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  async function save(mutator, msg) {
    settings = await S.update(mutator);
    render();
    if (msg) toast(msg);
  }

  function splitTerms(raw) {
    // Keep /regex/ intact even if it contains commas.
    const out = [];
    for (const line of String(raw).split(/\n/)) {
      const l = line.trim();
      if (!l) continue;
      if (/^\/.+\/$/.test(l)) { out.push(l); continue; }
      for (const part of l.split(',')) { const p = part.trim(); if (p) out.push(p); }
    }
    return out;
  }

  function validTerm(t) { return !!G.termToSource(t); }

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids) if (k != null) e.append(k);
    return e;
  }

  /**
   * Tag editor. items: [{ value, cls? }]. onAdd(values[]) and onRemove(value) persist the change.
   */
  function tagEditor(box, items, { placeholder, onAdd, onRemove, emptyText }) {
    box.textContent = '';
    if (!items.length && emptyText) box.append(el('span', { class: 'empty', text: emptyText }));
    for (const it of items) {
      box.append(el('span', { class: 'tag ' + (it.cls || ''), title: it.title || it.value },
        el('span', { class: 't', text: it.value }),
        el('button', { type: 'button', 'aria-label': `Remove ${it.value}`, text: '×', onclick: () => onRemove(it.value) })
      ));
    }
    const input = el('input', { type: 'text', placeholder, 'aria-label': placeholder, maxlength: '120' });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || (e.key === ',' && !input.value.startsWith('/'))) {
        e.preventDefault();
        const vals = splitTerms(input.value);
        const bad = vals.filter((v) => !validTerm(v));
        if (bad.length) { toast(`Can't use “${bad[0]}”. Check the regex.`); return; }
        if (vals.length) onAdd(vals);
      } else if (e.key === 'Backspace' && !input.value && items.length) {
        onRemove(items[items.length - 1].value);
      }
    });
    input.addEventListener('paste', (e) => {
      const text = (e.clipboardData || window.clipboardData).getData('text');
      if (/[\n,]/.test(text)) {
        e.preventDefault();
        const vals = splitTerms(text).filter(validTerm);
        if (vals.length) onAdd(vals);
      }
    });
    box.append(input);
    box.onclick = (e) => { if (e.target === box) input.focus(); };
    return input;
  }

  function refocus(id) {
    const i = document.querySelector(`#${id} input`);
    if (i) i.focus();
  }

  /* ---------- render ---------- */

  function render() {
    $('enabled').checked = settings.enabled;
    const reason = S.inactiveReason(settings, '');
    $('sideStatusText').textContent = ({ '': 'Shield on', off: 'Shield off', paused: 'Paused', expired: 'Ended (date passed)' })[reason] || 'Shield on';

    for (const group of ['sensitivity', 'blockStyle', 'revealMode']) {
      for (const b of $(group).querySelectorAll('[role="radio"]')) b.setAttribute('aria-checked', String(b.dataset.v === settings[group]));
    }
    $('revealHint').textContent = REVEAL_HINTS[settings.revealMode];
    for (const i of document.querySelectorAll('input[data-key]')) i.checked = !!settings[i.dataset.key];
    $('activeUntil').value = settings.activeUntil || '';

    renderCategories();
    renderRules();
    renderWords();
    runLab();
  }

  function renderCategories() {
    const list = $('catList');
    list.textContent = '';
    for (const c of G.CATEGORIES) {
      const st = settings.categories[c.id];
      const removed = new Set(st.removed);
      const strong = new Set(c.strong);
      const active = c.terms.filter((t) => !removed.has(t)).length + st.extra.length;
      const isOpen = openCats.has(c.id);

      const toggle = el('label', { class: 'switch', title: `Shield ${c.label}` },
        el('input', { type: 'checkbox', 'aria-label': `Shield ${c.label}` }),
        el('span', { class: 'track' }, el('span', { class: 'thumb' })));
      const cb = toggle.querySelector('input');
      cb.checked = st.enabled;
      cb.addEventListener('change', () => save((s) => { s.categories[c.id].enabled = cb.checked; }, `${c.label} ${cb.checked ? 'on' : 'off'}`));

      const expandBtn = el('button', { class: 'expand', type: 'button', 'aria-expanded': String(isOpen), text: isOpen ? 'Done' : 'Edit words' });
      const body = el('div', { class: 'cat-body' });
      body.hidden = !isOpen;
      expandBtn.addEventListener('click', () => {
        if (openCats.has(c.id)) openCats.delete(c.id); else openCats.add(c.id);
        renderCategories();
        if (openCats.has(c.id)) refocus('tags-' + c.id);
      });

      const card = el('div', { class: 'cat' + (st.enabled ? ' on' : '') },
        el('div', { class: 'cat-head' },
          el('div', { class: 'cat-em', text: c.emoji, 'aria-hidden': 'true' }),
          el('div', { class: 'cat-info' }, el('b', { text: c.label }), el('small', { text: c.description })),
          el('span', { class: 'cat-meta', text: `${active} words${st.extra.length || st.removed.length ? ' · edited' : ''}` }),
          expandBtn,
          toggle
        ),
        body
      );

      if (isOpen) {
        const tags = el('div', { class: 'tags', id: 'tags-' + c.id });
        const items = c.terms.filter((t) => !removed.has(t)).map((t) => ({ value: t, cls: strong.has(t) ? 'strong' : '', title: strong.has(t) ? 'Clear spoiler word (used by Relaxed mode)' : t }))
          .concat(st.extra.map((t) => ({ value: t, cls: 'added', title: 'Added by you' })));
        tagEditor(tags, items, {
          placeholder: 'Add a word and press Enter',
          onAdd: (vals) => save((s) => {
            const cs = s.categories[c.id];
            for (const v of vals) {
              if (c.terms.includes(v)) cs.removed = cs.removed.filter((x) => x !== v);
              else if (!cs.extra.includes(v)) cs.extra.push(v);
            }
          }).then(() => refocus('tags-' + c.id)),
          onRemove: (v) => save((s) => {
            const cs = s.categories[c.id];
            if (cs.extra.includes(v)) cs.extra = cs.extra.filter((x) => x !== v);
            else if (!cs.removed.includes(v)) cs.removed.push(v);
          }).then(() => refocus('tags-' + c.id))
        });
        body.append(tags);
        if (c.solo.length) body.append(el('p', { class: 'hint', text: `Also shielded anywhere, even without naming the game: ${c.solo.join(', ')}` }));
        body.append(el('div', { class: 'cat-actions' },
          el('button', {
            class: 'link', type: 'button', text: 'Reset to default words',
            onclick: () => save((s) => { s.categories[c.id].extra = []; s.categories[c.id].removed = []; }, `${c.label} reset`)
          })
        ));
      }
      list.append(card);
    }
  }

  function renderRules() {
    const list = $('ruleList');
    list.textContent = '';
    for (const r of settings.customRules) {
      const toggle = el('label', { class: 'switch' }, el('input', { type: 'checkbox', 'aria-label': `Enable ${r.label}` }), el('span', { class: 'track' }, el('span', { class: 'thumb' })));
      const cb = toggle.querySelector('input');
      cb.checked = r.enabled;
      cb.addEventListener('change', () => save((s) => { const x = s.customRules.find((y) => y.id === r.id); if (x) x.enabled = cb.checked; }));
      list.append(el('div', { class: 'rule' },
        el('div', { class: 'cat-em', text: r.emoji || '🧩' }),
        el('div', { class: 'cat-info' },
          el('b', { text: r.label }),
          el('small', { text: `${r.requireContext ? 'Only with GTA VI context · ' : 'Anywhere · '}${r.terms.join(', ')}` })),
        el('div', { class: 'btns' },
          el('button', { class: 'btn', type: 'button', text: 'Edit', onclick: () => editRule(r) }),
          el('button', {
            class: 'btn danger', type: 'button', text: 'Delete',
            onclick: () => { if (confirm(`Delete the rule “${r.label}”?`)) save((s) => { s.customRules = s.customRules.filter((y) => y.id !== r.id); }, 'Rule deleted'); }
          })),
        toggle));
    }
  }

  function editRule(r) {
    editingRuleId = r.id;
    $('ruleEmoji').value = r.emoji || '🧩';
    $('ruleLabel').value = r.label;
    $('ruleTerms').value = r.terms.join('\n');
    $('ruleContext').checked = r.requireContext !== false;
    $('ruleSubmit').textContent = 'Save rule';
    $('ruleCancel').hidden = false;
    $('ruleLabel').focus();
  }

  function resetRuleForm() {
    editingRuleId = null;
    $('ruleForm').reset();
    $('ruleEmoji').value = '🧩';
    $('ruleSubmit').textContent = 'Add rule';
    $('ruleCancel').hidden = true;
  }

  function listEditor(key, id, placeholder, emptyText, transform) {
    tagEditor($(id), settings[key].map((v) => ({ value: v })), {
      placeholder, emptyText,
      onAdd: (vals) => save((s) => {
        for (let v of vals) { if (transform) v = transform(v); if (v && !s[key].includes(v)) s[key].push(v); }
      }).then(() => refocus(id)),
      onRemove: (v) => save((s) => { s[key] = s[key].filter((x) => x !== v); }).then(() => refocus(id))
    });
  }

  function renderWords() {
    listEditor('keywords', 'keywords', 'Add a word, e.g. a character name, and press Enter', 'Nothing yet.');
    listEditor('exceptions', 'exceptions', 'e.g. vice city stories', 'Nothing yet.');
    listEditor('extraContext', 'extraContext', 'e.g. sexta entrega, gta seis', 'Nothing yet.');
    listEditor('disabledSites', 'disabledSites', 'Add a site, e.g. example.com', 'The shield runs on every site.', (v) => {
      v = v.trim().toLowerCase();
      try { if (/^https?:/.test(v)) v = new URL(v).hostname; } catch (_) {}
      return v.replace(/^www\./, '').replace(/\/.*$/, '');
    });
  }

  /* ---------- lab ---------- */

  function runLab() {
    const out = $('labOut');
    const text = $('labInput').value.trim();
    out.className = 'lab-out';
    out.textContent = '';
    if (!text) { out.append(el('span', { class: 'hint', text: 'Type or pick an example below.' })); return; }
    const m = G.compile(settings);
    const r = m.evaluate(text, { assumeContext: $('labContext').checked });
    const ctx = m.contextScore(G.normalize(text));
    if (r) {
      out.classList.add('hit');
      out.append(el('div', { class: 'verdict', text: '🛡️ Would be shielded' }));
      for (const c of r.categories) out.append(el('span', { class: 'pill' }, `${c.emoji} ${c.label} `, el('i', { text: `“${c.term}”` })));
    } else {
      out.classList.add('miss');
      out.append(el('div', { class: 'verdict', text: '👀 Would stay visible' }));
    }
    const needed = m.threshold;
    out.append(el('div', { class: 'ctx', text: ctx.hits.length
      ? `GTA VI signals: ${ctx.hits.join(', ')} (score ${ctx.score} of ${needed} needed)`
      : `No GTA VI signals found (score 0 of ${needed} needed)${$('labContext').checked ? ', but this page counts as GTA VI' : ''}.` }));
  }

  /* ---------- stats ---------- */

  async function renderStats() {
    const st = await S.loadStats();
    $('statTotal').textContent = new Intl.NumberFormat().format(st.total);
    $('statsSince').textContent = `Spoilers dodged since ${new Date(st.since).toLocaleDateString()}.`;
    const cats = Object.entries(st.byCategory).sort((a, b) => b[1] - a[1]);
    const sites = Object.entries(st.bySite).sort((a, b) => b[1] - a[1]).slice(0, 8);
    bars($('statCats'), cats.map(([id, n]) => {
      const c = G.CATEGORIES.find((x) => x.id === id) || settings.customRules.find((x) => x.id === id);
      const label = c ? `${c.emoji} ${c.label}` : ({ keywords: '🔑 Your keywords', manual: '✋ Shielded by you', general: '🛡️ Anything GTA VI' })[id] || id;
      return [label, n];
    }));
    bars($('statSites'), sites);
  }

  function bars(box, rows) {
    box.textContent = '';
    if (!rows.length) { box.append(el('span', { class: 'empty', text: 'Nothing shielded yet. Lucky you.' })); return; }
    const max = Math.max(...rows.map((r) => r[1]));
    for (const [k, n] of rows) {
      box.append(el('div', { class: 'bar' },
        el('span', { class: 'k', text: k, title: k }),
        el('span', { class: 'track' }, el('span', { class: 'fill', style: `width:${Math.max(3, (n / max) * 100)}%` })),
        el('span', { class: 'n', text: String(n) })));
    }
  }

  /* ---------- events ---------- */

  $('enabled').addEventListener('change', (e) => save((s) => { s.enabled = e.target.checked; if (s.enabled) s.pausedUntil = 0; }, e.target.checked ? 'Shield on' : 'Shield off'));

  for (const group of ['sensitivity', 'blockStyle', 'revealMode']) {
    $(group).addEventListener('click', (e) => {
      const b = e.target.closest('[role="radio"]');
      if (b) save((s) => { s[group] = b.dataset.v; }, 'Saved');
    });
    $(group).addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const btns = Array.from($(group).querySelectorAll('[role="radio"]'));
      const i = btns.findIndex((b) => b.dataset.v === settings[group]);
      const next = btns[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : btns.length - 1)) % btns.length];
      save((s) => { s[group] = next.dataset.v; }).then(() => next.focus());
    });
  }

  for (const i of document.querySelectorAll('input[data-key]')) {
    i.addEventListener('change', () => save((s) => { s[i.dataset.key] = i.checked; }, 'Saved'));
  }

  $('activeUntil').addEventListener('change', (e) => save((s) => { s.activeUntil = e.target.value; }, e.target.value ? `Shield ends after ${e.target.value}` : 'No end date'));
  $('clearDate').addEventListener('click', () => save((s) => { s.activeUntil = ''; }, 'No end date'));

  $('ruleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const terms = splitTerms($('ruleTerms').value);
    const bad = terms.filter((t) => !validTerm(t));
    if (!terms.length) { toast('Add at least one word'); return; }
    if (bad.length) { toast(`Can't use “${bad[0]}”. Check the regex.`); return; }
    const rule = {
      id: editingRuleId || 'rule-' + Date.now().toString(36),
      emoji: $('ruleEmoji').value.trim() || '🧩',
      label: $('ruleLabel').value.trim() || 'Custom rule',
      terms,
      requireContext: $('ruleContext').checked,
      enabled: true
    };
    const editing = !!editingRuleId;
    save((s) => {
      const i = s.customRules.findIndex((r) => r.id === rule.id);
      if (i >= 0) { rule.enabled = s.customRules[i].enabled; s.customRules[i] = rule; } else s.customRules.push(rule);
    }, editing ? 'Rule saved' : 'Rule added').then(resetRuleForm);
  });
  $('ruleCancel').addEventListener('click', resetRuleForm);

  $('labInput').addEventListener('input', runLab);
  $('labContext').addEventListener('change', runLab);
  for (const ex of LAB_EXAMPLES) {
    $('labExamples').append(el('button', { type: 'button', text: ex, onclick: () => { $('labInput').value = ex; runLab(); } }));
  }

  $('resetStats').addEventListener('click', async () => {
    if (!confirm('Reset all stats?')) return;
    await chrome.storage.local.set({ [S.STATS_KEY]: { total: 0, byCategory: {}, bySite: {}, since: Date.now() } });
    renderStats();
    toast('Stats reset');
  });

  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ app: 'spoiler-shield-gta6', exported: new Date().toISOString(), settings }, null, 2)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `spoiler-shield-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $('importFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const incoming = data && data.settings ? data.settings : data;
      if (!incoming || typeof incoming !== 'object' || !('categories' in incoming || 'keywords' in incoming)) throw new Error('not a settings file');
      await S.save(S.merge(incoming));
      settings = await S.load();
      render();
      $('backupMsg').textContent = `Imported ${f.name}.`;
      toast('Settings imported');
    } catch (err) {
      $('backupMsg').textContent = `That file couldn't be imported (${err.message}).`;
    }
    e.target.value = '';
  });

  $('resetAll').addEventListener('click', async () => {
    if (!confirm('Reset every setting, category edit and custom rule back to the defaults?')) return;
    await S.save(JSON.parse(JSON.stringify(G.DEFAULT_SETTINGS)));
    settings = await S.load();
    render();
    toast('Everything reset');
  });

  // Welcome banner on first install
  if (new URLSearchParams(location.search).get('welcome')) $('welcome').hidden = false;
  $('dismissWelcome').addEventListener('click', () => { $('welcome').hidden = true; history.replaceState(null, '', location.pathname); });

  // Highlight the section in view
  const links = Array.from(document.querySelectorAll('.nav a'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      for (const l of links) l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
    }
  }, { rootMargin: '-30% 0px -60% 0px' });
  for (const l of links) { const t = document.querySelector(l.getAttribute('href')); if (t) io.observe(t); }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[S.KEY]) {
      const next = S.merge(changes[S.KEY].newValue);
      if (JSON.stringify(next) !== JSON.stringify(settings)) {
        const focusedId = document.activeElement && document.activeElement.closest('.tags') ? document.activeElement.closest('.tags').id : null;
        settings = next;
        render();
        if (focusedId) refocus(focusedId);
      }
    }
    if (changes[S.STATS_KEY]) renderStats();
  });

  S.load().then((s) => { settings = s; render(); renderStats(); });
})();
