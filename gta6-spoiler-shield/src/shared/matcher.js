/*
 * Spoiler Shield matcher: turns settings + topic packs into compiled regular expressions and judges text.
 * Pure logic, no DOM, so it runs in content scripts, the options page, the service worker and Node tests.
 * It knows nothing about any particular game: every word it looks for comes from a pack or from the user.
 */
(function (root) {
  'use strict';

  const D = root.GSS || (typeof require === 'function' ? require('./defaults.js') : {});

  const SEP = "[\\s\\-_:.,'’/&+#]*";
  const WORD_CHAR = '[\\p{L}\\p{N}]';
  const BEFORE = '(?<![\\p{L}\\p{N}])';
  const AFTER = '(?![\\p{L}\\p{N}])';

  // Split hashtags and handles the way people write them on socials: #GTA6Spoilers -> "gta 6 spoilers".
  function splitTag(tag) {
    return tag
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([A-Za-z])(\d)/g, '$1 $2')
      .replace(/(\d)([A-Za-z])/g, '$1 $2')
      .replace(/_/g, ' ');
  }

  function normalize(text) {
    if (!text) return '';
    return String(text)
      .normalize('NFKD') // also folds fancy fonts: 𝗚𝗧𝗔 𝟲, ＧＴＡ６, Ⅵ
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u200b-\u200d\u2060\ufeff\ufe0f\u20e3\u00ad]/g, '') // zero-width tricks, emoji keycaps
      .replace(/[\u2018\u2019\u02bc\u2032]/g, "'")
      .replace(/([#@])([\p{L}\p{N}_]{3,})/gu, (m, p, t) => p + splitTag(t))
      .toLowerCase()
      .replace(/([\p{L}])'s(?![\p{L}\p{N}])/gu, '$1')
      .replace(/\s+/g, ' ');
  }

  // "no spoilers", "spoiler-free" and friends are promises, not spoilers.
  const NEGATED_SPOILER = /(?<![\p{L}\p{N}])(?:no|zero|without|0|non|not)[\s-]+(?:[\p{L}]+[\s-]+){0,2}spoilers?(?![\p{L}\p{N}])|spoiler[\s-]*(?:free|less|safe)/gu;

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /** Convert one user-facing term into a regex source string, or null if it is unusable. */
  function termToSource(term) {
    if (typeof term !== 'string') return null;
    let t = term.trim();
    if (!t) return null;

    const rx = /^\/(.+)\/$/.exec(t);
    if (rx) {
      try { new RegExp(rx[1], 'iu'); return `(?:${rx[1]})`; } catch (_) { return null; }
    }

    t = normalize(t).trim();
    const wildcardEnd = t.endsWith('*');
    if (wildcardEnd) t = t.slice(0, -1);

    // Split on separators, keep inner "*" as a word-character wildcard.
    const parts = t.split(/[\s\-_:.,/&+]+/).filter(Boolean);
    if (!parts.length) return null;

    const body = parts
      .map((p) => p.split('*').map(escapeRe).join(`${WORD_CHAR}*`))
      .join(SEP);

    const startsWithWord = /^[\p{L}\p{N}]/u.test(parts[0]);
    const last = parts[parts.length - 1];
    const endsWithWord = /[\p{L}\p{N}*]$/u.test(last);

    return (startsWithWord ? BEFORE : '') +
      body +
      (wildcardEnd ? `${WORD_CHAR}*` : '') +
      (endsWithWord || wildcardEnd ? AFTER : '');
  }

  function compileList(terms) {
    const sources = [];
    for (const t of terms || []) {
      const s = termToSource(t);
      if (s) sources.push(s);
    }
    if (!sources.length) return null;
    // Longer alternatives first so the reported match is the most specific phrase.
    sources.sort((a, b) => b.length - a.length);
    return new RegExp(sources.join('|'), 'iu');
  }

  function compileEach(terms) {
    const out = [];
    for (const t of terms || []) {
      const s = termToSource(t);
      if (s) out.push({ term: t, re: new RegExp(s, 'iu') });
    }
    return out;
  }

  function applyEdits(base, state) {
    const removed = new Set((state && state.removed) || []);
    return base.filter((t) => !removed.has(t)).concat((state && state.extra) || []);
  }

  /**
   * Build a matcher from settings and the installed packs. Cheap to call many times per page.
   * @param {object} settings  merged settings (settings.packs holds per-pack state)
   * @param {object[]} packs   validated packs; disabled ones are skipped
   */
  function compile(settings, packs) {
    const s = Object.assign({}, D.DEFAULT_SETTINGS, settings || {});
    const sensitivity = ['relaxed', 'balanced', 'strict'].includes(s.sensitivity) ? s.sensitivity : 'balanced';
    const active = (packs || []).filter((p) => !(s.packs && s.packs[p.id] && s.packs[p.id].enabled === false));
    const multi = active.length > 1;

    const compiled = [];
    const allTriggers = [];
    const everything = [];
    const compactPrefixes = [];
    const spoilerWords = [];

    for (const p of active) {
      const st = (s.packs && s.packs[p.id]) || {};
      const extraCtx = st.extraContext || [];
      const ctx = {
        strong: compileEach(p.context.strong.concat(extraCtx)),
        weak: compileEach(p.context.weak),
        names: compileEach(p.context.names)
      };
      const urls = (p.context.urls || []).map((u) => { try { return new RegExp(u, 'i'); } catch (_) { return null; } }).filter(Boolean);
      const cats = [];
      for (const c of p.categories) {
        const cs = (st.categories && st.categories[c.id]) || { enabled: c.defaultOn };
        if (!cs.enabled) continue;
        const terms = applyEdits(c.terms, cs);
        cats.push({
          key: `${p.id}/${c.id}`, id: c.id, pack: p.id,
          label: multi ? `${p.short} · ${c.label}` : c.label, emoji: c.emoji, liveStream: !!c.liveStream,
          re: compileList(terms),
          strongRe: compileList(c.strong.concat(cs.extra || [])),
          soloRe: compileList(c.solo)
        });
        everything.push(...terms, ...c.solo);
        allTriggers.push(...c.solo);
        spoilerWords.push(...terms);
      }
      const ctxTerms = p.context.strong.concat(extraCtx, p.context.weak, p.context.names);
      allTriggers.push(...ctxTerms);
      everything.push(...ctxTerms);
      for (const t of p.context.strong.concat(extraCtx)) {
        if (/^\/|\*/.test(t)) continue;
        const compact = normalize(t).replace(/[^\p{L}\p{N}]/gu, '');
        if (compact.length >= 3) compactPrefixes.push(compact);
      }
      compiled.push({
        id: p.id, name: p.name, short: p.short, ctx, urls, cats,
        threshold: ((p.threshold || D.CONTEXT_THRESHOLD)[sensitivity])
      });
    }

    // Rules that belong to no pack: the user's custom rules and "always shield" keywords.
    const globalCats = [];
    for (const r of s.customRules || []) {
      if (!r || !r.enabled) continue;
      const re = compileList(r.terms);
      if (!re) continue;
      globalCats.push({ key: `custom/${r.id}`, id: r.id, pack: 'custom', label: r.label || 'Custom rule', emoji: r.emoji || '🧩', requireContext: r.requireContext !== false, re });
      everything.push(...(r.terms || []));
      if (r.requireContext === false) allTriggers.push(...(r.terms || []));
    }
    const keywordRe = compileList(s.keywords);
    if (keywordRe) {
      globalCats.push({ key: 'custom/keywords', id: 'keywords', pack: 'custom', label: 'Your keywords', emoji: '🔑', requireContext: false, re: keywordRe });
      allTriggers.push(...s.keywords);
      everything.push(...s.keywords);
    }

    const exceptionRe = compileList(s.exceptions);
    const triggerRe = compileList(allTriggers);
    const everythingRe = compileList(everything);

    // Glued lowercase hashtags: "#gta6spoilers" -> "#gta6 spoilers" when the tail starts with a spoiler word.
    compactPrefixes.sort((a, b) => b.length - a.length);
    const spoilerStart = compileList(spoilerWords);
    const spoilerStartRe = spoilerStart ? new RegExp('^(?:' + spoilerStart.source + ')', 'iu') : null;

    function prep(raw) {
      let text = normalize(raw);
      if (spoilerStartRe && compactPrefixes.length && text.includes('#')) {
        text = text.replace(/#([\p{L}\p{N}]{4,})/gu, (m, tag) => {
          for (const pre of compactPrefixes) {
            if (tag.length > pre.length && tag.startsWith(pre) && spoilerStartRe.test(tag.slice(pre.length))) return `#${pre} ${tag.slice(pre.length)}`;
          }
          return m;
        });
      }
      return text;
    }

    function scorePack(P, text) {
      let score = 0;
      const hits = [];
      for (const tier of ['strong', 'weak', 'names']) {
        for (const { term, re } of P.ctx[tier]) {
          if (re.test(text)) { score += D.CONTEXT_WEIGHT[tier]; hits.push(term); }
        }
        if (tier === 'strong' && score >= 2) break;
      }
      return { score, hits };
    }

    const asSet = (v) => (v instanceof Set ? v : new Set(v || []));

    return {
      sensitivity,
      packs: compiled,
      globalCats,
      hasPacks: compiled.length > 0,
      prep,

      /** Which packs is this text about? [{ id, name, score, threshold, hits, about }] */
      contextReport(raw) {
        const text = prep(raw);
        return compiled.map((P) => {
          const r = scorePack(P, text);
          return { id: P.id, name: P.name, score: r.score, threshold: P.threshold, hits: r.hits, about: r.score >= P.threshold };
        });
      },

      /** Ids of the packs this text is about. */
      contextPacks(raw) {
        return this.contextReport(raw).filter((r) => r.about).map((r) => r.id);
      },

      /** Ids of the packs whose URL patterns match. */
      urlPacks(url) {
        return compiled.filter((P) => P.urls.some((re) => re.test(url || ''))).map((P) => P.id);
      },

      /** The category that covers live streams of a pack (or a general one in Blackout). */
      liveCategory(packId) {
        const P = compiled.find((x) => x.id === packId);
        if (!P) return null;
        const c = P.cats.find((x) => x.liveStream);
        if (c) return { id: c.key, pack: P.id, label: `Live ${P.short} gameplay`, emoji: c.emoji, term: '' };
        if (sensitivity === 'strict') return { id: `${P.id}/general`, pack: P.id, label: `Live ${P.short}`, emoji: '🛡️', term: '' };
        return null;
      },

      /**
       * Judge a piece of text.
       * @param {string} raw
       * @param {{assume?: Iterable<string>}} opts  assume: packs the page itself is about
       * @returns {null | {categories: Array<{id,pack,label,emoji,term}>, context: string[]}}
       */
      evaluate(raw, opts) {
        const text = prep(raw).replace(NEGATED_SPOILER, ' ');
        if (!text || text.length < 2) return null;
        if (exceptionRe && exceptionRe.test(text)) return null;
        const assume = asSet(opts && opts.assume);

        const found = [];
        const context = [];
        let anyContext = assume.size > 0;

        for (const P of compiled) {
          const ctx = scorePack(P, text);
          const has = ctx.score >= P.threshold || assume.has(P.id);
          if (has) { anyContext = true; context.push(...ctx.hits); }
          const before = found.length;
          for (const c of P.cats) {
            if (!c.re && !c.soloRe) continue;
            if (!has) {
              const solo = c.soloRe && c.soloRe.exec(text);
              if (solo) found.push({ id: c.key, pack: P.id, label: c.label, emoji: c.emoji, term: solo[0] });
              continue;
            }
            const m = c.re && c.re.exec(text);
            if (!m) continue;
            if (sensitivity === 'relaxed') {
              const sm = (c.strongRe && c.strongRe.exec(text)) || (c.soloRe && c.soloRe.exec(text));
              if (!sm) continue;
              found.push({ id: c.key, pack: P.id, label: c.label, emoji: c.emoji, term: sm[0] });
              continue;
            }
            found.push({ id: c.key, pack: P.id, label: c.label, emoji: c.emoji, term: m[0] });
          }
          if (found.length === before && sensitivity === 'strict' && ctx.score >= P.threshold) {
            found.push({ id: `${P.id}/general`, pack: P.id, label: `Anything ${P.short}`, emoji: '🛡️', term: ctx.hits[0] });
          }
        }

        for (const g of globalCats) {
          if (g.requireContext && !anyContext) continue;
          const m = g.re.exec(text);
          if (m) found.push({ id: g.key, pack: 'custom', label: g.label, emoji: g.emoji, term: m[0] });
        }

        return found.length ? { categories: found, context } : null;
      },

      /** Cheap test used before doing any DOM work. */
      mightTrigger(raw, assume) {
        const re = assume && asSet(assume).size ? everythingRe : triggerRe;
        return !!(re && re.test(prep(raw)));
      }
    };
  }

  /** Is this URL a search results page (shielded result by result, never as a whole page)? */
  function isSearchPage(url, patterns) {
    return (patterns || []).some((p) => { try { return new RegExp(p, 'i').test(url || ''); } catch (_) { return false; } });
  }

  const api = { normalize, termToSource, compile, isSearchPage };
  root.GSS = Object.assign(root.GSS || {}, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
