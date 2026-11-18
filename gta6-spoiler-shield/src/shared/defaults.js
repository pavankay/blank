/*
 * Spoiler Shield engine defaults.
 *
 * Nothing about any particular game or show lives here. What counts as a spoiler comes from
 * topic packs (packs/*.json, imported files, or packs subscribed to by URL), and how each website
 * structures its posts comes from site rules (rules/sites.json or a subscribed URL).
 *
 * Term syntax used in packs and every user-editable list:
 *   - plain words or phrases: "final mission"  (spaces/hyphens/dots are flexible: "gta 6" also hits "GTA-6", "gta6")
 *   - trailing wildcard:      "betray*"        (betray, betrayed, betrayal...)
 *   - raw regular expression: "/rumou?rs?/"
 */
(function (root) {
  'use strict';

  const PACK_FORMAT = 'spoiler-shield-pack@1';
  const SITES_FORMAT = 'spoiler-shield-sites@1';

  // Data files shipped inside the extension. They are copied into storage on install and update,
  // and can be replaced by newer versions from an update URL.
  const BUNDLED_PACKS = ['packs/gta6.json'];
  const BUNDLED_SITES = 'rules/sites.json';

  // How strongly each kind of context word says "this text is about the pack's topic".
  const CONTEXT_WEIGHT = { strong: 2, weak: 1, names: 0.5 };
  // Score needed per sensitivity. A pack may override these with its own "threshold".
  const CONTEXT_THRESHOLD = { relaxed: 1.5, balanced: 1.5, strict: 1 };

  // Fallback "card" selectors used when no site rule matches. The site rules file can replace them.
  const GENERIC_CONTAINERS = [
    'article', '[role="article"]', '[role="listitem"]', 'li', 'figure', 'blockquote', 'aside',
    '.card', '[class*="card"]', '[class*="Card"]', '[class*="post"]', '[class*="Post"]', '[class*="story"]',
    '[class*="tile"]', '[class*="teaser"]', '[class*="item"]', '[class*="comment"]', '[class*="Comment"]'
  ];

  const UPDATE_INTERVAL_HOURS = 6;

  const DEFAULT_SETTINGS = {
    schema: 2,
    enabled: true,
    sensitivity: 'balanced',      // relaxed | balanced | strict
    packs: {},                    // packId -> { enabled, extraContext: [], categories: { catId -> { enabled, extra, removed } } }
    customRules: [],              // [{ id, label, emoji, terms: [], requireContext, enabled }]
    keywords: [],                 // always shielded, no topic context needed
    exceptions: [],               // text containing any of these is never shielded
    disabledSites: [],            // hostnames where the shield is off
    customSites: [],              // the user's own site rules (same shape as rules/sites.json entries); they win
    sitesUrl: '',                 // optional URL that keeps site rules up to date
    autoUpdate: true,             // refresh packs and site rules from their URLs
    blockStyle: 'blur',           // blur | redact | collapse
    revealMode: 'click',          // click | hold | locked
    showReasons: true,
    pageShield: true,             // full-page cover for spoiler articles and videos
    pageContext: true,            // if the page itself is about a topic, judge every block on it as that topic
    hideThumbnails: true,
    pauseVideos: true,
    pausedUntil: 0,
    activeUntil: ''               // 'YYYY-MM-DD'; the shield switches itself off after this date
  };

  const api = {
    PACK_FORMAT, SITES_FORMAT, BUNDLED_PACKS, BUNDLED_SITES,
    CONTEXT_WEIGHT, CONTEXT_THRESHOLD, GENERIC_CONTAINERS, UPDATE_INTERVAL_HOURS, DEFAULT_SETTINGS
  };

  root.GSS = Object.assign(root.GSS || {}, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
