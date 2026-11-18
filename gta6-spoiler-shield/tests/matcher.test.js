// Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../src/shared/defaults.js');
const M = require('../src/shared/matcher.js');
const S = require('../src/shared/settings.js');
const P = require('../src/shared/packs.js');

const GTA = P.validatePack(require('../packs/gta6.json')).pack;
const SITES = P.validateSites(require('../rules/sites.json')).data;
const base = (packs = [GTA]) => P.withPackState(S.merge({}), packs);
const compile = (s, packs = [GTA]) => M.compile(s, packs);
const ids = (r) => (r ? [...new Set(r.categories.map((c) => c.id.split('/').pop()))].sort() : []);

/* ---------- the engine has no built-in topic ---------- */

test('engine defaults contain no topic data', () => {
  const text = JSON.stringify(D);
  assert.ok(!/gta|leonida|rockstar|lucia/i.test(text.replace(/packs\/gta6\.json/, '')));
  const m = M.compile(S.merge({}), []);
  assert.equal(m.evaluate('GTA 6 ending explained: who dies?'), null);
});

test('bundled data files are valid', () => {
  const p = P.validatePack(require('../packs/gta6.json'));
  assert.deepEqual(p.errors, []);
  assert.deepEqual(p.warnings, []);
  const s = P.validateSites(require('../rules/sites.json'));
  assert.deepEqual(s.errors, []);
  assert.ok(s.data.sites.length >= 25);
});

/* ---------- GTA VI pack behaviour ---------- */

test('blocks clear story spoilers', () => {
  const m = compile(base());
  assert.deepEqual(ids(m.evaluate('GTA 6 ending explained: who dies?')), ['story']);
  assert.deepEqual(ids(m.evaluate('Grand Theft Auto VI: the final mission twist')), ['missions', 'story']);
});

test('game name variants all count as context', () => {
  const m = compile(base());
  for (const s of ['GTA6 ending', 'gta-6 ending', 'GTA VI ending', 'Grand Theft Auto Ⅵ ending', '#GTA6 ending', 'gtavi ending']) {
    assert.deepEqual(ids(m.evaluate(s)), ['story'], s);
  }
});

test('plain news stays visible, unrelated text ignored', () => {
  const m = compile(base());
  assert.equal(m.evaluate('Rockstar confirms GTA 6 release date'), null);
  assert.equal(m.evaluate('The ending of this movie was great'), null);
  assert.equal(m.evaluate('I love Vice City Stories'), null);
  assert.deepEqual(ids(m.evaluate('wait, Lucia dies??')), ['story']);
});

test('sensitivity levels', () => {
  const s = base();
  s.sensitivity = 'relaxed';
  assert.equal(compile(s).evaluate('GTA 6 story trailer'), null);
  assert.deepEqual(ids(compile(s).evaluate('GTA 6 story ending')), ['story']);
  s.sensitivity = 'strict';
  assert.deepEqual(ids(compile(s).evaluate('Rockstar confirms GTA 6 release date')), ['general']);
});

test('category on/off and word edits live in settings, not the pack', () => {
  const s = base();
  s.packs.gta6.categories.story.enabled = false;
  assert.equal(compile(s).evaluate('GTA 6 ending explained'), null);
  const s2 = base();
  s2.packs.gta6.categories.map.removed = ['map'];
  s2.packs.gta6.categories.map.extra = ['vice beach boardwalk'];
  assert.equal(compile(s2).evaluate('GTA 6 map'), null);
  assert.deepEqual(ids(compile(s2).evaluate('GTA VI: the vice beach boardwalk')), ['map']);
});

test('extra context words per pack', () => {
  const s = base();
  assert.equal(compile(s).evaluate('sexta entrega: the ending'), null);
  s.packs.gta6.extraContext = ['sexta entrega'];
  assert.deepEqual(ids(compile(s).evaluate('sexta entrega: the ending')), ['story']);
});

test('page context, keywords, exceptions, custom rules', () => {
  const s = base();
  assert.deepEqual(ids(compile(s).evaluate('the ending made me cry', { assume: ['gta6'] })), ['story']);
  s.keywords = ['Brian'];
  s.exceptions = ['vice city stories'];
  s.customRules = [
    { id: 'r1', label: 'Spanish', terms: ['muere', 'traición*'], requireContext: true, enabled: true },
    { id: 'r2', label: 'Streamer', terms: ['/xqc ?plays/'], requireContext: false, enabled: true }
  ];
  const m = compile(s);
  assert.deepEqual(ids(m.evaluate('what happened to brian?')), ['keywords']);
  assert.equal(m.evaluate('GTA 6 vs Vice City Stories ending'), null);
  assert.equal(m.evaluate('muere al final'), null);
  assert.deepEqual(ids(m.evaluate('GTA 6: Jason muere al final')), ['r1']);
  assert.deepEqual(ids(m.evaluate('xQc plays the new game')), ['r2']);
});

test('social-media writing styles', () => {
  const m = compile(base());
  assert.deepEqual(ids(m.evaluate('#GTA6Spoilers the final heist')), ['missions', 'story']);
  assert.deepEqual(ids(m.evaluate('#gta6spoilers jason dies')), ['story']);
  assert.deepEqual(ids(m.evaluate('#GTAVIEasterEggs')), ['secrets']);
  assert.deepEqual(ids(m.evaluate('𝗚𝗧𝗔 𝟲 ending was insane')), ['story']);
  assert.deepEqual(ids(m.evaluate('G​TA 6 map leak')), ['leaks', 'map']);
  assert.deepEqual(ids(m.evaluate("Lucia's death hit hard")), ['story']);
  assert.equal(m.evaluate('#gtavicecity nostalgia ending'), null);
  assert.equal(m.evaluate('GTA 6 first impressions (no spoilers)'), null);
  assert.deepEqual(ids(m.evaluate('no spoilers but Lucia dies lol')), ['story']);
});

test('url and search-page data come from files', () => {
  const m = compile(base());
  assert.deepEqual(m.urlPacks('https://www.reddit.com/r/GTA6/comments/abc'), ['gta6']);
  assert.deepEqual(m.urlPacks('https://example.com/news/gta-5-review'), []);
  assert.ok(M.isSearchPage('https://www.google.com/search?q=x', SITES.searchPages));
  assert.ok(!M.isSearchPage('https://www.youtube.com/watch?v=x', SITES.searchPages));
  assert.equal(m.liveCategory('gta6').id, 'gta6/footage');
});

/* ---------- any topic, any number of packs ---------- */

test('a brand-new pack works with no code changes', () => {
  const show = P.validatePack(P.packTemplate('Starfall Saga')).pack;
  const s = base([GTA, show]);
  const m = compile(s, [GTA, show]);
  assert.deepEqual(m.evaluate('Starfall Saga finale: who dies?').categories.map((c) => c.id), ['starfall-saga/story']);
  assert.deepEqual(m.evaluate('#starfallsagafinale').categories.map((c) => c.id), ['starfall-saga/story']);
  // Each pack's categories need that pack's own context.
  assert.deepEqual(m.evaluate('GTA 6 ending').categories.map((c) => c.id), ['gta6/story']);
  // Labels say which pack when several are on.
  assert.match(m.evaluate('GTA 6 ending').categories[0].label, /^GTA VI · /);
});

test('turning a pack off removes it', () => {
  const s = base();
  s.packs.gta6.enabled = false;
  assert.equal(M.compile(s, P.enabledPacks(s, [GTA])).evaluate('GTA 6 ending explained'), null);
});

/* ---------- untrusted pack and site files ---------- */

test('pack validation rejects broken or dangerous files', () => {
  assert.ok(P.validatePack(null).errors.length);
  assert.ok(P.validatePack({ name: 'x' }).errors.length); // no categories
  assert.ok(P.validatePack({ format: 'something-else', name: 'x', categories: [{ id: 'a', terms: ['a'] }], context: { strong: ['x'] } }).errors.length);
  const r = P.validatePack({
    name: 'Evil', context: { strong: ['evil'], urls: ['(a+)+$'] },
    categories: [{ id: 'a', terms: ['ok', '/(a+)+b/', '/(.*)*/', '/(a)\\1/', 'x'.repeat(500)] }],
    updateUrl: 'javascript:alert(1)'
  });
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.pack.categories[0].terms, ['ok']);
  assert.deepEqual(r.pack.context.urls, []);
  assert.equal(r.pack.updateUrl, '');
  assert.ok(r.warnings.length >= 4);
});

test('safe regexes and update links are kept', () => {
  assert.ok(P.safeRegexSource('rumou?rs?'));
  assert.ok(!P.safeRegexSource('(a+)+'));
  assert.equal(P.cleanUrl('https://example.com/p.json'), 'https://example.com/p.json');
  assert.equal(P.cleanUrl('http://example.com/p.json'), '');
  assert.equal(P.cleanUrl('http://127.0.0.1:8080/p.json'), 'http://127.0.0.1:8080/p.json');
});

test('site rules: host patterns, user rules win, detect rules', () => {
  assert.ok(P.hostMatches('www.youtube.com', 'youtube.com'));
  assert.ok(P.hostMatches('m.youtube.com', 'youtube.com'));
  assert.ok(!P.hostMatches('notyoutube.com', 'youtube.com'));
  assert.ok(P.hostMatches('www.google.co.uk', 'google.*'));
  assert.ok(P.hostMatches('news.google.com', 'google.*'));
  assert.equal(P.siteRuleFor('www.youtube.com', SITES, []).name, 'YouTube');
  const mine = [{ name: 'My YouTube', hosts: ['youtube.com'], selectors: ['.x'], topic: [], live: false, detect: '' }];
  assert.equal(P.siteRuleFor('youtube.com', SITES, mine).name, 'My YouTube');
  assert.equal(P.siteRuleFor('example.org', SITES, []), null);
  assert.ok(P.detectRules(SITES, []).some((r) => r.name === 'Mastodon'));
  assert.equal(P.validateSite({ name: 'bad', selectors: ['.a'] }, []), null); // no hosts or detect
});

test('version comparison', () => {
  assert.equal(P.compareVersions('2026.11.18', '2026.11.9'), 1);
  assert.equal(P.compareVersions('1.0', '1.0.0'), 0);
  assert.equal(P.compareVersions('1.2', '1.10'), -1);
});

test('settings from version 1 migrate into the GTA VI pack', () => {
  const old = { enabled: true, categories: { story: { enabled: false, extra: ['x'], removed: [] } }, extraContext: ['sexta entrega'], keywords: ['k'] };
  const s = P.withPackState(S.merge(old), [GTA]);
  assert.equal(s.packs.gta6.categories.story.enabled, false);
  assert.deepEqual(s.packs.gta6.categories.story.extra, ['x']);
  assert.deepEqual(s.packs.gta6.extraContext, ['sexta entrega']);
  assert.equal(s.packs.gta6.categories.map.enabled, true);
  assert.equal(s.categories, undefined);
  assert.deepEqual(s.keywords, ['k']);
});
