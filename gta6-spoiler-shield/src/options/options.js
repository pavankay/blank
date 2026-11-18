(() => {
  'use strict';
  const G = globalThis.GSS;
  const S = G.settings;
  const P = G.packs;
  const $ = (id) => document.getElementById(id);

  let settings = null;
  let packs = [];         // validated packs, sorted by name
  let packStore = {};     // id -> { pack, source, url, fetchedAt, error }
  let sitesEntry = null;  // { data, source, url, fetchedAt, error }
  let editingRuleId = null;
  const openCats = new Set();

  const REVEAL_HINTS = {
    click: 'One click on the cover shows what is underneath.',
    hold: 'Press and hold for about a second, so a stray click on a feed never spoils anything.',
    locked: 'Covers cannot be opened from the page. Pause the shield from the toolbar when you really want to look.'
  };
  const SOURCE_LABEL = { bundled: 'Built in', url: 'From link', file: 'From file', custom: 'Edited by you' };

  /* ---------- helpers ---------- */

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  async function reload() {
    const data = await P.loadAll();
    settings = data.settings;
    packs = data.packs;
    packStore = data.packStore;
    sitesEntry = data.sitesEntry;
  }

  async function save(mutator, msg) {
    await S.update(async (s) => { P.withPackState(s, packs); await mutator(s); });
    await reload();
    render();
    if (msg) toast(msg);
  }

  function splitTerms(raw) {
    const out = [];
    for (const line of String(raw).split(/\n/)) {
      const l = line.trim();
      if (!l) continue;
      if (/^\/.+\/$/.test(l)) { out.push(l); continue; }
      for (const part of l.split(',')) { const p = part.trim(); if (p) out.push(p); }
    }
    return out;
  }

  function validTerm(t) {
    const rx = /^\/(.+)\/$/.exec(t);
    if (rx) return P.safeRegexSource(rx[1]);
    return !!G.termToSource(t);
  }

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

  function sw(checked, label, onChange) {
    const t = el('label', { class: 'switch', title: label }, el('input', { type: 'checkbox', 'aria-label': label }), el('span', { class: 'track' }, el('span', { class: 'thumb' })));
    const cb = t.querySelector('input');
    cb.checked = !!checked;
    cb.addEventListener('change', () => onChange(cb.checked));
    return t;
  }

  function download(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2) + '\n'], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function ago(ts) {
    if (!ts) return '';
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    if (h < 48) return `${h} h ago`;
    return new Date(ts).toLocaleDateString();
  }

  /** Tag editor. items: [{ value, cls?, title? }]. */
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
  }

  function refocus(id) {
    const i = document.querySelector(`#${CSS.escape(id)} input`);
    if (i) i.focus();
  }

  /* ---------- JSON editor dialog ---------- */

  let editorSave = null;
  let editorCheck = null;

  function openEditor({ title, hint, value, check, onSave, readOnly }) {
    $('editorTitle').textContent = title;
    $('editorHint').textContent = hint || '';
    $('editorText').value = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    $('editorText').readOnly = !!readOnly;
    $('editorSave').hidden = !!readOnly;
    $('editorCheck').hidden = !!readOnly;
    $('editorMsg').textContent = '';
    $('editorMsg').className = 'editor-msg';
    editorCheck = check;
    editorSave = onSave;
    $('editor').showModal();
    const ta = $('editorText');
    ta.focus();
    ta.setSelectionRange(0, 0);
    ta.scrollTop = 0;
  }

  function runEditorCheck() {
    const msg = $('editorMsg');
    let raw;
    try { raw = JSON.parse($('editorText').value); } catch (e) {
      msg.className = 'editor-msg bad';
      msg.textContent = `Not valid JSON: ${e.message}`;
      return null;
    }
    const r = editorCheck ? editorCheck(raw) : { value: raw, errors: [], warnings: [] };
    if (r.errors && r.errors.length) {
      msg.className = 'editor-msg bad';
      msg.textContent = r.errors.join('\n');
      return null;
    }
    msg.className = 'editor-msg good';
    msg.textContent = r.warnings && r.warnings.length ? `Looks good, with notes:\n${r.warnings.join('\n')}` : 'Looks good.';
    return r;
  }

  $('editorCheck').addEventListener('click', runEditorCheck);
  $('editorSave').addEventListener('click', async () => {
    const r = runEditorCheck();
    if (!r || !editorSave) return;
    try {
      await editorSave(r);
      $('editor').close();
    } catch (e) {
      $('editorMsg').className = 'editor-msg bad';
      $('editorMsg').textContent = e.message;
    }
  });
  $('editorText').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const t = e.target;
      const a = t.selectionStart;
      t.setRangeText('  ', a, t.selectionEnd, 'end');
    }
  });

  // Storage hands objects back with sorted keys; show packs in a readable order instead.
  const PACK_KEY_ORDER = ['format', 'id', 'name', 'short', 'version', 'description', 'updateUrl', 'threshold', 'context', 'categories', 'examples'];
  const CAT_KEY_ORDER = ['id', 'label', 'short', 'emoji', 'description', 'defaultOn', 'liveStream', 'terms', 'strong', 'solo'];
  function ordered(obj, keys) {
    const out = {};
    for (const k of keys) if (obj[k] !== undefined && obj[k] !== null && !(k === 'updateUrl' && !obj[k])) out[k] = obj[k];
    for (const k of Object.keys(obj)) if (!(k in out) && obj[k] != null && !keys.includes(k)) out[k] = obj[k];
    return out;
  }
  function readablePack(p) {
    const o = ordered(p, PACK_KEY_ORDER);
    if (o.context) o.context = ordered(o.context, ['strong', 'weak', 'names', 'urls']);
    o.categories = (o.categories || []).map((c) => ordered(c, CAT_KEY_ORDER));
    return o;
  }

  const checkPack = (raw) => { const r = P.validatePack(raw); return { value: r.pack, errors: r.errors, warnings: r.warnings }; };

  function editPack(entry) {
    const fromUrl = entry && (entry.url || entry.pack.updateUrl) && entry.source !== 'custom';
    openEditor({
      title: entry ? `Edit pack: ${entry.pack.name}` : 'Create a pack',
      hint: fromUrl
        ? 'Saving your edits stops this pack from updating from its link (so updates never overwrite your changes). For small tweaks, editing words under Categories is better: those survive updates.'
        : 'A pack is plain JSON: context words tell the shield when text is about your topic, categories hold the spoiler words. Use "word*" for endings and "/regex/" for patterns.',
      value: entry ? readablePack(entry.pack) : P.packTemplate('My show'),
      check: checkPack,
      onSave: async ({ value }) => {
        if (entry && value.id !== entry.pack.id && packStore[value.id]) throw new Error(`A pack with id "${value.id}" already exists.`);
        if (entry && value.id !== entry.pack.id) await P.removePack(entry.pack.id);
        if (!entry && packStore[value.id]) throw new Error(`A pack with id "${value.id}" already exists. Change the "id".`);
        await P.putPack(value, 'custom', '');
        await reload();
        await save(() => {}, `Saved ${value.name}`);
      }
    });
  }

  /* ---------- render ---------- */

  function render() {
    $('enabled').checked = settings.enabled;
    const reason = S.inactiveReason(settings, '');
    $('sideStatusText').textContent = ({ '': 'Shield on', off: 'Shield off', paused: 'Paused', expired: 'Ended (date passed)' })[reason] || 'Shield on';
    $('welcomePacks').textContent = packs.length ? packs.map((p) => p.name).join(', ') : 'no';
    const on = packs.filter((p) => settings.packs[p.id].enabled);
    $('edition').textContent = on.length ? `${on.map((p) => p.short).join(' + ')} edition` : 'No packs on';

    for (const group of ['sensitivity', 'blockStyle', 'revealMode']) {
      for (const b of $(group).querySelectorAll('[role="radio"]')) b.setAttribute('aria-checked', String(b.dataset.v === settings[group]));
    }
    $('revealHint').textContent = REVEAL_HINTS[settings.revealMode];
    for (const i of document.querySelectorAll('input[data-key]')) i.checked = !!settings[i.dataset.key];
    $('activeUntil').value = settings.activeUntil || '';

    renderPacks();
    renderCategories();
    renderRules();
    renderWords();
    renderSites();
    renderLabExamples();
    runLab();
  }

  function renderPacks() {
    const list = $('packList');
    list.textContent = '';
    if (!packs.length) list.append(el('p', { class: 'hint', text: 'No packs installed. Install one from a link or file, or create your own.' }));
    for (const p of packs) {
      const entry = packStore[p.id];
      const st = settings.packs[p.id];
      const link = entry.url || p.updateUrl;
      const meta = el('div', { class: 'meta' },
        el('span', { text: `v${p.version}` }),
        el('span', { text: SOURCE_LABEL[entry.source] || entry.source }),
        el('span', { text: `${p.categories.length} ${p.categories.length === 1 ? 'category' : 'categories'}` }),
        link && entry.source !== 'custom' ? el('span', { text: `auto-updates · checked ${ago(entry.fetchedAt)}`, title: link }) : null,
        entry.error ? el('span', { class: 'err', text: `Update failed: ${entry.error}` }) : null);
      list.append(el('div', { class: 'pack' + (st.enabled ? ' on' : '') },
        el('div', { class: 'cat-em', text: '📦', 'aria-hidden': 'true' }),
        el('div', { class: 'cat-info' }, el('b', { text: p.name }), el('small', { text: p.description }), meta),
        el('div', { class: 'btns' },
          el('button', { class: 'btn', type: 'button', text: 'Edit', onclick: () => editPack(entry) }),
          el('button', { class: 'btn', type: 'button', text: 'Export', onclick: () => download(`${p.id}.pack.json`, readablePack(p)) }),
          entry.source === 'bundled' ? null : el('button', {
            class: 'btn danger', type: 'button', text: 'Remove',
            onclick: async () => {
              if (!confirm(`Remove the pack “${p.name}”?`)) return;
              await P.removePack(p.id);
              await save((s) => { delete s.packs[p.id]; }, `${p.name} removed`);
            }
          })),
        sw(st.enabled, `Use the ${p.name} pack`, (v) => save((s) => { s.packs[p.id].enabled = v; }, `${p.name} ${v ? 'on' : 'off'}`))));
    }
  }

  function renderCategories() {
    const list = $('catList');
    list.textContent = '';
    const on = packs.filter((p) => settings.packs[p.id].enabled);
    if (!on.length) { list.append(el('p', { class: 'hint', text: 'Turn a topic pack on to see its categories.' })); return; }
    for (const p of on) {
      const st = settings.packs[p.id];
      const group = el('div', { class: 'pack-group' });
      if (packs.length > 1) group.append(el('h3', { text: `📦 ${p.name}` }));
      const cats = el('div', { class: 'cat-list' });
      for (const c of p.categories) cats.append(categoryCard(p, c, st.categories[c.id]));
      group.append(cats);

      const ctxId = `ctx-${p.id}`;
      const ctx = el('div', { class: 'pack-ctx' },
        el('h4', { text: `📍 Also means ${p.short}` }),
        el('p', { class: 'hint', text: `Extra words that tell the shield a text is about ${p.name}: nicknames, translations, new names revealed after the pack was made.` }),
        el('div', { class: 'tags', id: ctxId }));
      group.append(ctx);
      list.append(group);
      tagEditor(ctx.querySelector('.tags'), st.extraContext.map((v) => ({ value: v })), {
        placeholder: 'Add a word and press Enter', emptyText: 'Nothing yet.',
        onAdd: (vals) => save((s) => { for (const v of vals) if (!s.packs[p.id].extraContext.includes(v)) s.packs[p.id].extraContext.push(v); }).then(() => refocus(ctxId)),
        onRemove: (v) => save((s) => { s.packs[p.id].extraContext = s.packs[p.id].extraContext.filter((x) => x !== v); }).then(() => refocus(ctxId))
      });
    }
  }

  function categoryCard(p, c, st) {
    const key = `${p.id}/${c.id}`;
    const tagsId = `tags-${p.id}-${c.id}`;
    const removed = new Set(st.removed);
    const strong = new Set(c.strong);
    const count = c.terms.filter((t) => !removed.has(t)).length + st.extra.length;
    const isOpen = openCats.has(key);

    const expandBtn = el('button', { class: 'expand', type: 'button', 'aria-expanded': String(isOpen), text: isOpen ? 'Done' : 'Edit words' });
    expandBtn.addEventListener('click', () => {
      if (openCats.has(key)) openCats.delete(key); else openCats.add(key);
      renderCategories();
      if (openCats.has(key)) refocus(tagsId);
    });
    const body = el('div', { class: 'cat-body' });
    body.hidden = !isOpen;

    const card = el('div', { class: 'cat' + (st.enabled ? ' on' : '') },
      el('div', { class: 'cat-head' },
        el('div', { class: 'cat-em', text: c.emoji, 'aria-hidden': 'true' }),
        el('div', { class: 'cat-info' }, el('b', { text: c.label }), el('small', { text: c.description })),
        el('span', { class: 'cat-meta', text: `${count} words${st.extra.length || st.removed.length ? ' · edited' : ''}` }),
        expandBtn,
        sw(st.enabled, `Shield ${c.label}`, (v) => save((s) => { s.packs[p.id].categories[c.id].enabled = v; }, `${c.label} ${v ? 'on' : 'off'}`))),
      body);

    if (isOpen) {
      const tags = el('div', { class: 'tags', id: tagsId });
      const items = c.terms.filter((t) => !removed.has(t)).map((t) => ({ value: t, cls: strong.has(t) ? 'strong' : '', title: strong.has(t) ? 'Clear spoiler word (used by Relaxed mode)' : t }))
        .concat(st.extra.map((t) => ({ value: t, cls: 'added', title: 'Added by you' })));
      tagEditor(tags, items, {
        placeholder: 'Add a word and press Enter',
        onAdd: (vals) => save((s) => {
          const cs = s.packs[p.id].categories[c.id];
          for (const v of vals) {
            if (c.terms.includes(v)) cs.removed = cs.removed.filter((x) => x !== v);
            else if (!cs.extra.includes(v)) cs.extra.push(v);
          }
        }).then(() => refocus(tagsId)),
        onRemove: (v) => save((s) => {
          const cs = s.packs[p.id].categories[c.id];
          if (cs.extra.includes(v)) cs.extra = cs.extra.filter((x) => x !== v);
          else if (!cs.removed.includes(v)) cs.removed.push(v);
        }).then(() => refocus(tagsId))
      });
      body.append(tags);
      if (c.solo.length) body.append(el('p', { class: 'hint', text: `Also shielded anywhere, even without naming the topic: ${c.solo.join(', ')}` }));
      body.append(el('div', { class: 'cat-actions' },
        el('button', {
          class: 'link', type: 'button', text: 'Reset to the pack’s words',
          onclick: () => save((s) => { s.packs[p.id].categories[c.id].extra = []; s.packs[p.id].categories[c.id].removed = []; }, `${c.label} reset`)
        })));
    }
    return card;
  }

  function renderRules() {
    const list = $('ruleList');
    list.textContent = '';
    for (const r of settings.customRules) {
      list.append(el('div', { class: 'rule' },
        el('div', { class: 'cat-em', text: r.emoji || '🧩' }),
        el('div', { class: 'cat-info' },
          el('b', { text: r.label }),
          el('small', { text: `${r.requireContext ? 'Only with topic context · ' : 'Anywhere · '}${r.terms.join(', ')}` })),
        el('div', { class: 'btns' },
          el('button', { class: 'btn', type: 'button', text: 'Edit', onclick: () => editRule(r) }),
          el('button', {
            class: 'btn danger', type: 'button', text: 'Delete',
            onclick: () => { if (confirm(`Delete the rule “${r.label}”?`)) save((s) => { s.customRules = s.customRules.filter((y) => y.id !== r.id); }, 'Rule deleted'); }
          })),
        sw(r.enabled, `Enable ${r.label}`, (v) => save((s) => { const x = s.customRules.find((y) => y.id === r.id); if (x) x.enabled = v; }))));
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
    listEditor('keywords', 'keywords', 'Add a word or name and press Enter', 'Nothing yet.');
    listEditor('exceptions', 'exceptions', 'A phrase that should never be shielded', 'Nothing yet.');
    listEditor('disabledSites', 'disabledSites', 'Add a site, e.g. example.com', 'The shield runs on every site.', (v) => {
      v = v.trim().toLowerCase();
      try { if (/^https?:/.test(v)) v = new URL(v).hostname; } catch (_) {}
      return v.replace(/^www\./, '').replace(/\/.*$/, '');
    });
  }

  function renderSites() {
    const box = $('siteStatus');
    box.textContent = '';
    const d = sitesEntry && sitesEntry.data;
    if (d) {
      box.append(el('span', { text: `${d.sites.length} sites` }), el('span', { text: `v${d.version}` }),
        el('span', { text: SOURCE_LABEL[sitesEntry.source] || sitesEntry.source }));
      if (sitesEntry.fetchedAt) box.append(el('span', { text: `updated ${ago(sitesEntry.fetchedAt)}` }));
    } else box.append(el('span', { text: 'No shared site rules loaded' }));
    if (settings.customSites.length) box.append(el('span', { text: `${settings.customSites.length} of your own` }));
    if (sitesEntry && sitesEntry.error) box.append(el('span', { class: 'err', text: `Update failed: ${sitesEntry.error}` }));
    if (document.activeElement !== $('sitesUrl')) $('sitesUrl').value = settings.sitesUrl || '';
  }

  /* ---------- lab ---------- */

  function renderLabExamples() {
    const box = $('labExamples');
    box.textContent = '';
    const ex = [];
    for (const p of packs) if (settings.packs[p.id].enabled) ex.push(...p.examples);
    for (const e of ex.slice(0, 10)) box.append(el('button', { type: 'button', text: e, onclick: () => { $('labInput').value = e; runLab(); } }));
  }

  function runLab() {
    const out = $('labOut');
    const text = $('labInput').value.trim();
    out.className = 'lab-out';
    out.textContent = '';
    if (!text) { out.append(el('span', { class: 'hint', text: 'Type or pick an example below.' })); return; }
    const on = P.enabledPacks(settings, packs);
    const m = G.compile(settings, on);
    const r = m.evaluate(text, { assume: $('labContext').checked ? on.map((p) => p.id) : [] });
    if (r) {
      out.classList.add('hit');
      out.append(el('div', { class: 'verdict', text: '🛡️ Would be shielded' }));
      for (const c of r.categories) out.append(el('span', { class: 'pill' }, `${c.emoji} ${c.label} `, el('i', { text: `“${c.term}”` })));
    } else {
      out.classList.add('miss');
      out.append(el('div', { class: 'verdict', text: '👀 Would stay visible' }));
    }
    for (const rep of m.contextReport(text)) {
      out.append(el('div', { class: 'ctx', text: rep.hits.length
        ? `${rep.name} signals: ${rep.hits.join(', ')} (score ${rep.score} of ${rep.threshold} needed)`
        : `${rep.name}: no signals (score 0 of ${rep.threshold} needed)` }));
    }
  }

  /* ---------- stats ---------- */

  function describe(key) {
    const [packId, id] = String(key).split('/');
    if (!id) return `🛡️ ${key}`;
    if (packId === 'custom') {
      if (id === 'keywords') return '🔑 Your keywords';
      if (id === 'manual') return '✋ Shielded by you';
      const r = settings.customRules.find((x) => x.id === id);
      return r ? `${r.emoji || '🧩'} ${r.label}` : `🧩 ${id}`;
    }
    const p = packs.find((x) => x.id === packId);
    if (id === 'general') return `🛡️ Anything ${p ? p.short : packId}`;
    const c = p && p.categories.find((x) => x.id === id);
    return c ? `${c.emoji} ${packs.length > 1 ? p.short + ' · ' : ''}${c.label}` : key;
  }

  async function renderStats() {
    const st = await S.loadStats();
    $('statTotal').textContent = new Intl.NumberFormat().format(st.total);
    $('statsSince').textContent = `Spoilers dodged since ${new Date(st.since).toLocaleDateString()}.`;
    const merged = {};
    for (const [k, n] of Object.entries(st.byCategory)) {
      // Stats from version 1 used bare category ids; they belong to the GTA VI pack.
      const key = k.includes('/') ? k : (k === 'keywords' || k === 'manual' ? `custom/${k}` : `gta6/${k}`);
      merged[key] = (merged[key] || 0) + n;
    }
    bars($('statCats'), Object.entries(merged).sort((a, b) => b[1] - a[1]).map(([k, n]) => [describe(k), n]));
    bars($('statSites'), Object.entries(st.bySite).sort((a, b) => b[1] - a[1]).slice(0, 8));
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

  /* ---------- events: protection ---------- */

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

  /* ---------- events: packs ---------- */

  $('subscribeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = $('subscribeUrl').value.trim();
    $('packMsg').textContent = 'Downloading…';
    try {
      const { pack, warnings } = await P.subscribe(url);
      $('subscribeUrl').value = '';
      await reload();
      await save(() => {}, `Installed ${pack.name}`);
      $('packMsg').textContent = `Installed ${pack.name} v${pack.version}. It will keep itself up to date from that link.` + (warnings.length ? ` (${warnings.length} entries skipped)` : '');
    } catch (err) {
      $('packMsg').textContent = `Couldn't install from that link: ${err.message}`;
    }
  });

  $('packFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const { pack, errors, warnings } = P.validatePack(JSON.parse(await f.text()));
      if (!pack) throw new Error(errors.join(' '));
      if (packStore[pack.id] && !confirm(`Replace the installed “${packStore[pack.id].pack.name}” pack with this file?`)) return;
      await P.putPack(pack, 'file', '');
      await reload();
      await save(() => {}, `Installed ${pack.name}`);
      $('packMsg').textContent = `Installed ${pack.name} v${pack.version} from ${f.name}.` + (pack.updateUrl ? ' It will keep itself up to date from its update link.' : '') + (warnings.length ? ` (${warnings.length} entries skipped)` : '');
    } catch (err) {
      $('packMsg').textContent = `That file couldn't be installed: ${err.message}`;
    }
  });

  $('newPackBtn').addEventListener('click', () => editPack(null));

  $('updateAllBtn').addEventListener('click', async () => {
    $('packMsg').textContent = 'Checking for updates…';
    const res = await chrome.runtime.sendMessage({ type: 'update-packs' });
    await reload();
    render();
    if (!res || !res.ok) { $('packMsg').textContent = `Update check failed${res && res.error ? ': ' + res.error : ''}.`; return; }
    const r = res.report;
    const parts = [];
    if (r.updated.length) parts.push(`Updated: ${r.updated.join(', ')}.`);
    if (r.unchanged.length) parts.push(`Already up to date: ${r.unchanged.join(', ')}.`);
    if (r.failed.length) parts.push(`Failed: ${r.failed.join('; ')}.`);
    $('packMsg').textContent = parts.join(' ') || 'Nothing has an update link yet.';
  });

  /* ---------- events: rules, words, sites ---------- */

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

  $('sitesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = $('sitesUrl').value.trim();
    const url = raw ? P.cleanUrl(raw) : '';
    if (raw && !url) { toast('Use an https:// link'); return; }
    await save((s) => { s.sitesUrl = url; });
    if (!url) { toast('Site rules link removed'); return; }
    toast('Updating site rules…');
    const res = await chrome.runtime.sendMessage({ type: 'update-packs' });
    await reload();
    render();
    const failed = res && res.report && res.report.failed.find((f) => f.startsWith('Site rules'));
    toast(failed || 'Site rules updated');
  });

  $('editMySites').addEventListener('click', () => {
    openEditor({
      title: 'My site rules',
      hint: 'A list of rules. Yours win over the shared ones. Each needs "hosts" (or "detect" for self-hosted sites) and "selectors" for the element that wraps one post.',
      value: settings.customSites.length ? settings.customSites : [{ name: 'Example forum', hosts: ['forum.example.com'], selectors: ['.post', '.reply'], topic: ['h1.thread-title'] }],
      check: (raw) => {
        if (!Array.isArray(raw)) return { errors: ['Expected a list: [ { … }, { … } ]'] };
        const warnings = [];
        const value = raw.map((r) => P.validateSite(r, warnings)).filter(Boolean);
        return { value, errors: [], warnings };
      },
      onSave: async ({ value }) => { await save((s) => { s.customSites = value; }, `Saved ${value.length} site rule${value.length === 1 ? '' : 's'}`); }
    });
  });

  $('viewSites').addEventListener('click', () => {
    openEditor({
      title: 'Shared site rules',
      hint: 'Read-only. To change these, copy what you need into "My site rules", or subscribe to a link with your own file.',
      value: (sitesEntry && sitesEntry.data) || {}, readOnly: true
    });
  });

  $('resetSites').addEventListener('click', async () => {
    if (!confirm('Go back to the built-in site rules? Your own site rules are kept.')) return;
    await save((s) => { s.sitesUrl = ''; });
    await P.resetSitesToBundled();
    await reload();
    render();
    toast('Built-in site rules restored');
  });

  /* ---------- events: lab, stats, backup ---------- */

  $('labInput').addEventListener('input', runLab);
  $('labContext').addEventListener('change', runLab);

  $('resetStats').addEventListener('click', async () => {
    if (!confirm('Reset all stats?')) return;
    await chrome.storage.local.set({ [S.STATS_KEY]: { total: 0, byCategory: {}, bySite: {}, since: Date.now() } });
    renderStats();
    toast('Stats reset');
  });

  $('exportBtn').addEventListener('click', () => {
    // Your settings, plus any pack that isn't built in or downloadable again from a link.
    const ownPacks = Object.values(packStore).filter((e) => e.source === 'custom' || e.source === 'file').map((e) => e.pack);
    download(`spoiler-shield-${new Date().toISOString().slice(0, 10)}.json`, { app: 'spoiler-shield', exported: new Date().toISOString(), settings, packs: ownPacks, subscriptions: Object.values(packStore).filter((e) => e.source === 'url').map((e) => e.url) });
  });

  $('importFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data && data.format === G.PACK_FORMAT) throw new Error('this is a topic pack. Install it under Topic packs.');
      const incoming = data && data.settings ? data.settings : data;
      if (!incoming || typeof incoming !== 'object' || !('packs' in incoming || 'categories' in incoming || 'keywords' in incoming)) throw new Error('not a settings file');
      for (const raw of Array.isArray(data.packs) ? data.packs : []) {
        const { pack } = P.validatePack(raw);
        if (pack) await P.putPack(pack, 'file', '');
      }
      for (const url of Array.isArray(data.subscriptions) ? data.subscriptions : []) {
        try { await P.subscribe(url); } catch (_) {}
      }
      await S.save(S.merge(incoming));
      await reload();
      await save(() => {});
      $('backupMsg').textContent = `Imported ${f.name}.`;
      toast('Settings imported');
    } catch (err) {
      $('backupMsg').textContent = `That file couldn't be imported (${err.message}).`;
    }
  });

  $('resetAll').addEventListener('click', async () => {
    if (!confirm('Reset every setting, category edit and custom rule back to the defaults? Installed packs stay.')) return;
    await S.save(JSON.parse(JSON.stringify(G.DEFAULT_SETTINGS)));
    await reload();
    await save(() => {}, 'Everything reset');
  });

  if (new URLSearchParams(location.search).get('welcome')) $('welcome').hidden = false;
  $('dismissWelcome').addEventListener('click', () => { $('welcome').hidden = true; history.replaceState(null, '', location.pathname); });

  const links = Array.from(document.querySelectorAll('.nav a'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      for (const l of links) l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
    }
  }, { rootMargin: '-30% 0px -60% 0px' });
  for (const l of links) { const t = document.querySelector(l.getAttribute('href')); if (t) io.observe(t); }

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') return;
    if (changes[S.KEY] || changes[P.PACKS_KEY] || changes[P.SITES_KEY]) {
      const before = JSON.stringify([settings, packStore, sitesEntry]);
      await reload();
      if (JSON.stringify([settings, packStore, sitesEntry]) !== before && !$('editor').open) {
        const focused = document.activeElement && document.activeElement.closest('.tags');
        render();
        if (focused && focused.id) refocus(focused.id);
      }
    }
    if (changes[S.STATS_KEY]) renderStats();
  });

  reload().then(() => { render(); renderStats(); });
})();
