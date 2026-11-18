// Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/shared/defaults.js');
const M = require('../src/shared/matcher.js');
const D = globalThis.GSS;

const ids = (r) => (r ? [...new Set(r.categories.map((c) => c.id))].sort() : []);
const base = () => JSON.parse(JSON.stringify(D.DEFAULT_SETTINGS));

test('blocks clear story spoilers', () => {
  const m = M.compile(base());
  assert.deepEqual(ids(m.evaluate('GTA 6 ending explained: who dies?')), ['story']);
  assert.deepEqual(ids(m.evaluate('Grand Theft Auto VI: the final mission twist')), ['missions', 'story']);
});

test('game name variants all count as context', () => {
  const m = M.compile(base());
  for (const s of ['GTA6 ending', 'gta-6 ending', 'GTA VI ending', 'Grand Theft Auto Ⅵ ending', '#GTA6 ending', 'gtavi ending']) {
    assert.deepEqual(ids(m.evaluate(s)), ['story'], s);
  }
});

test('map and leak categories', () => {
  const m = M.compile(base());
  assert.deepEqual(ids(m.evaluate('New GTA VI map leak shows every location')), ['leaks', 'map']);
});

test('plain news stays visible in balanced', () => {
  const m = M.compile(base());
  assert.equal(m.evaluate('Rockstar confirms GTA 6 release date'), null);
  assert.equal(m.evaluate('Best pizza in town'), null);
});

test('no context means no block, except solo phrases', () => {
  const m = M.compile(base());
  assert.equal(m.evaluate('The ending of this movie was great'), null);
  assert.equal(m.evaluate('I love Vice City Stories'), null);
  assert.deepEqual(ids(m.evaluate('wait, Lucia dies??')), ['story']);
});

test('weak signals combine into context', () => {
  const m = M.compile(base());
  assert.equal(m.evaluate('Rockstar ending'), null);
  assert.deepEqual(ids(m.evaluate('Rockstar new GTA ending leaked')), ['leaks', 'story']);
});

test('disabled categories are ignored', () => {
  const s = base();
  s.categories.story.enabled = false;
  assert.equal(M.compile(s).evaluate('GTA 6 ending explained'), null);
});

test('relaxed only uses strong words', () => {
  const s = base();
  s.sensitivity = 'relaxed';
  const m = M.compile(s);
  assert.equal(m.evaluate('GTA 6 story trailer'), null);
  assert.deepEqual(ids(m.evaluate('GTA 6 story ending')), ['story']);
});

test('strict blocks any mention', () => {
  const s = base();
  s.sensitivity = 'strict';
  const m = M.compile(s);
  assert.deepEqual(ids(m.evaluate('Rockstar confirms GTA 6 release date')), ['general']);
  assert.deepEqual(ids(m.evaluate('new GTA trailer')), ['general']);
});

test('page context lets category words trigger alone', () => {
  const m = M.compile(base());
  assert.equal(m.evaluate('the ending made me cry'), null);
  assert.deepEqual(ids(m.evaluate('the ending made me cry', { assumeContext: true })), ['story']);
});

test('custom keywords block anywhere', () => {
  const s = base();
  s.keywords = ['Brian'];
  const m = M.compile(s);
  assert.deepEqual(ids(m.evaluate('what happened to brian?')), ['keywords']);
  assert.ok(m.mightTrigger('brian'));
});

test('exceptions win', () => {
  const s = base();
  s.exceptions = ['vice city stories'];
  assert.equal(M.compile(s).evaluate('GTA 6 vs Vice City Stories ending'), null);
});

test('custom rules with and without context', () => {
  const s = base();
  s.customRules = [
    { id: 'r1', label: 'Spanish', emoji: '🇪🇸', terms: ['muere', 'traición*'], requireContext: true, enabled: true },
    { id: 'r2', label: 'Streamer', emoji: '📺', terms: ['/xqc ?plays/'], requireContext: false, enabled: true }
  ];
  const m = M.compile(s);
  assert.equal(m.evaluate('muere al final'), null);
  assert.deepEqual(ids(m.evaluate('GTA 6: Jason muere al final')), ['r1']);
  assert.deepEqual(ids(m.evaluate('xQc plays the new game')), ['r2']);
});

test('category word edits', () => {
  const s = base();
  s.categories.map.removed = ['map'];
  s.categories.map.extra = ['vice beach boardwalk'];
  const m = M.compile(s);
  assert.equal(m.evaluate('GTA 6 map'), null);
  assert.deepEqual(ids(m.evaluate('GTA VI: the vice beach boardwalk')), ['map']);
});

test('wildcards and word boundaries', () => {
  const m = M.compile(base());
  assert.deepEqual(ids(m.evaluate('GTA 6: Jason betrayal scene')), ['story']);
  // "storyboard" must not count as "story"; "maple" must not count as "map"
  assert.equal(m.evaluate('GTA 6 storyboard artist on maple syrup'), null);
});

test('regex terms and bad regex', () => {
  assert.ok(M.termToSource('/rumou?rs?/'));
  assert.equal(M.termToSource('/(unclosed/'), null);
  assert.equal(M.termToSource('   '), null);
});

test('url context and search pages', () => {
  assert.ok(M.urlHasContext('https://www.reddit.com/r/GTA6/comments/abc'));
  assert.ok(M.urlHasContext('https://example.com/news/gta-6-review'));
  assert.ok(!M.urlHasContext('https://example.com/news/gta-5-review'));
  assert.ok(M.isSearchPage('https://www.google.com/search?q=gta+6'));
  assert.ok(M.isSearchPage('https://www.youtube.com/results?search_query=gta+6'));
  assert.ok(!M.isSearchPage('https://www.youtube.com/watch?v=x'));
});

test('social-media writing styles', () => {
  const m = M.compile(base());
  assert.deepEqual(ids(m.evaluate('#GTA6Spoilers the final heist')), ['missions', 'story']);
  assert.deepEqual(ids(m.evaluate('#GTAVIEasterEggs')), ['secrets']);
  assert.deepEqual(ids(m.evaluate('@RockstarGames new GTA ending')), ['story']);
  assert.deepEqual(ids(m.evaluate('𝗚𝗧𝗔 𝟲 ending was insane')), ['story']);    // styled unicode fonts
  assert.deepEqual(ids(m.evaluate('G​TA 6 map leak')), ['leaks', 'map']); // zero-width evasion
  assert.deepEqual(ids(m.evaluate("Lucia's death hit hard")), ['story']);       // possessive
  assert.equal(m.evaluate('#gtavicecity nostalgia ending'), null);             // the 2002 game, not VI
});

test('"no spoilers" is a promise, not a spoiler', () => {
  const m = M.compile(base());
  assert.equal(m.evaluate('GTA 6 first impressions (no spoilers)'), null);
  assert.equal(m.evaluate('GTA 6 review, no story spoilers'), null);
  assert.equal(m.evaluate('GTA VI spoiler-free review'), null);
  assert.deepEqual(ids(m.evaluate('no spoilers but Lucia dies lol')), ['story']);
});
