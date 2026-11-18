/*
 * Spoiler Shield matcher: turns settings into compiled regular expressions and judges text.
 * Pure logic, no DOM, so it runs in content scripts, the options page, the service worker and Node tests.
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
      .replace(/#(gta ?vi(?!ce)|gta ?six|grand ?theft ?auto ?(?:vi|6))(?=[a-z])/g, '#$1 ')
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
   * Build a matcher from settings. The result is cheap to call many times per page.
   */
  function compile(settings) {
    const s = Object.assign({}, D.DEFAULT_SETTINGS, settings || {});
    const catState = s.categories || {};

    const context = {
      strong: compileEach(D.CONTEXT.strong.concat(s.extraContext || [])),
      weak: compileEach(D.CONTEXT.weak),
      names: compileEach(D.CONTEXT.names)
    };

    const categories = [];
    for (const c of D.CATEGORIES) {
      const st = catState[c.id] || { enabled: c.defaultOn };
      if (!st.enabled) continue;
      const terms = applyEdits(c.terms, st);
      categories.push({
        id: c.id,
        label: c.label,
        emoji: c.emoji,
        builtin: true,
        requireContext: true,
        re: compileList(terms),
        strongRe: compileList(c.strong.concat((st && st.extra) || [])),
        soloRe: compileList(c.solo)
      });
    }

    for (const r of s.customRules || []) {
      if (!r || !r.enabled) continue;
      const re = compileList(r.terms);
      if (!re) continue;
      categories.push({
        id: r.id, label: r.label || 'Custom rule', emoji: r.emoji || '🧩', builtin: false,
        requireContext: r.requireContext !== false, re, strongRe: re, soloRe: null
      });
    }

    const keywordRe = compileList(s.keywords);
    if (keywordRe) {
      categories.push({
        id: 'keywords', label: 'Your keywords', emoji: '🔑', builtin: false,
        requireContext: false, re: keywordRe, strongRe: keywordRe, soloRe: null
      });
    }

    const exceptionRe = compileList(s.exceptions);

    // Fast prefilter: if a text node does not hit this, nothing in it can trigger on its own.
    const anyContextSources = []
      .concat(D.CONTEXT.strong, s.extraContext || [], D.CONTEXT.weak, D.CONTEXT.names)
      .concat(...D.CATEGORIES.map((c) => c.solo))
      .concat(s.keywords || []);
    for (const r of s.customRules || []) if (r && r.enabled && r.requireContext === false) anyContextSources.push(...(r.terms || []));
    const triggerRe = compileList(anyContextSources);

    // When the whole page is about GTA VI, any category word is a trigger.
    const everythingRe = compileList(
      anyContextSources.concat(...categories.filter((c) => c.builtin).map((c) => {
        const base = D.CATEGORIES.find((x) => x.id === c.id);
        return applyEdits(base.terms, catState[c.id]);
      })).concat(...(s.customRules || []).filter((r) => r && r.enabled).map((r) => r.terms || []))
    );

    const sensitivity = ['relaxed', 'balanced', 'strict'].includes(s.sensitivity) ? s.sensitivity : 'balanced';

    return {
      sensitivity,
      threshold: D.CONTEXT_THRESHOLD[sensitivity],
      context, categories, exceptionRe, triggerRe, everythingRe,

      contextScore(text) {
        let score = 0;
        const hits = [];
        for (const tier of ['strong', 'weak', 'names']) {
          for (const { term, re } of context[tier]) {
            if (re.test(text)) { score += D.CONTEXT_WEIGHT[tier]; hits.push(term); }
          }
          if (tier === 'strong' && score >= 2) break; // already certain, skip the rest
        }
        return { score, hits };
      },

      /**
       * Judge a piece of text.
       * @param {string} raw
       * @param {{assumeContext?: boolean}} opts  assumeContext: the page itself is about GTA VI
       * @returns {null | {categories: Array<{id,label,emoji,term}>, context: string[], score: number}}
       */
      evaluate(raw, opts) {
        const text = normalize(raw).replace(NEGATED_SPOILER, ' ');
        if (!text || text.length < 2) return null;
        if (exceptionRe && exceptionRe.test(text)) return null;

        const ctx = this.contextScore(text);
        const hasContext = ctx.score >= this.threshold || !!(opts && opts.assumeContext);
        const found = [];

        for (const c of categories) {
          if (!c.re) continue;
          if (c.requireContext && !hasContext) {
            const solo = c.soloRe && c.soloRe.exec(text);
            if (solo) found.push({ id: c.id, label: c.label, emoji: c.emoji, term: solo[0] });
            continue;
          }
          const m = c.re.exec(text);
          if (!m) continue;
          if (sensitivity === 'relaxed' && c.builtin) {
            const sm = (c.strongRe && c.strongRe.exec(text)) || (c.soloRe && c.soloRe.exec(text));
            if (!sm) continue;
            found.push({ id: c.id, label: c.label, emoji: c.emoji, term: sm[0] });
            continue;
          }
          found.push({ id: c.id, label: c.label, emoji: c.emoji, term: m[0] });
        }

        if (!found.length && sensitivity === 'strict' && ctx.score >= this.threshold) {
          found.push({ id: 'general', label: 'Anything GTA VI', emoji: '🛡️', term: ctx.hits[0] });
        }

        return found.length ? { categories: found, context: ctx.hits, score: ctx.score } : null;
      },

      /** Cheap test used before doing any DOM work. */
      mightTrigger(raw, assumeContext) {
        const text = normalize(raw);
        const re = assumeContext ? everythingRe : triggerRe;
        return !!(re && re.test(text));
      }
    };
  }

  /** Does a URL by itself say the page is about GTA VI? */
  function urlHasContext(url) {
    return (D.CONTEXT_URL_PATTERNS || []).some((re) => re.test(url || ''));
  }

  function isSearchPage(url) {
    return (D.SEARCH_PAGE_PATTERNS || []).some((re) => re.test(url || ''));
  }

  const api = { normalize, termToSource, compile, urlHasContext, isSearchPage };
  root.GSS = Object.assign(root.GSS || {}, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
