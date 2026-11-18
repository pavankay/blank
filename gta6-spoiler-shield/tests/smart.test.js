// Run: node --test tests/smart.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/shared/defaults.js');
const M = require('../src/shared/matcher.js');
const S = require('../src/shared/settings.js');
const P = require('../src/shared/packs.js');
const IH = require('../src/shared/imagehash.js');
const C = require('../src/shared/community.js');
const V = require('../src/shared/vision.js');

const GTA = P.validatePack(require('../packs/gta6.json')).pack;
const SITES = P.validateSites(require('../rules/sites.json')).data;
const ids = (r) => (r ? [...new Set(r.categories.map((c) => c.id.split('/').pop()))].sort() : []);
const compile = (packs = [GTA], over = {}) => M.compile(Object.assign(P.withPackState(S.merge({}), packs), over), packs);

/* ---------- unlabeled spoilers ---------- */

test('vague reactions are caught when they are about the game', () => {
  const m = compile();
  assert.deepEqual(ids(m.evaluate('bro what 💀 #GTA6')), ['reactions']);
  assert.deepEqual(ids(m.evaluate("GTA 6: I'm not okay")), ['reactions']);
  assert.equal(m.evaluate('bro what 💀'), null, 'no game, no shield');
});

test('posts about the game with no spoiler words get the picture-only treatment', () => {
  const m = compile();
  assert.equal(m.evaluate('GTA 6 unlock times confirmed'), null);
  assert.equal(m.unlabeled('GTA 6 unlock times confirmed').id, 'gta6/unlabeled');
  assert.equal(m.unlabeled('cooking pasta at home'), null);
  assert.equal(m.unlabeled('cooking pasta at home', { assume: ['gta6'] }).id, 'gta6/unlabeled', 'on a GTA VI page every picture counts');
  assert.equal(compile([GTA], { sensitivity: 'relaxed' }).unlabeled('GTA 6 unlock times'), null, 'Relaxed leaves pictures alone');
  const off = P.withPackState(S.merge({}), [GTA]);
  off.packs.gta6.categories.unlabeled.enabled = false;
  assert.equal(M.compile(off, [GTA]).unlabeled('GTA 6 unlock times'), null);
});

/* ---------- learning ---------- */

test('wiki titles are cleaned before they become words', () => {
  assert.equal(P.cleanWikiTitle('Phil (GTA VI)'), 'Phil');
  assert.equal(P.cleanWikiTitle('Unnamed Marina worker'), '');
  assert.equal(P.cleanWikiTitle('Category:Locations in GTA VI'), '');
  assert.equal(P.cleanWikiTitle('List of radio stations'), '');
});

test('learned and community words are merged into packs, visibly', () => {
  const learned = { gta6: { categories: { missions: ['Night Owl Express', 'robbery'] }, context: { strong: ['Zed Quillfeather'], names: ['Ernesto'] } } };
  const community = { learned: { gta6: { terms: ['midnight ferry', '/(evil)+/'], authors: ['Palm Tree Media'] } } };
  const [p] = P.augmentPacks([GTA], learned, community);
  const missions = p.categories.find((c) => c.id === 'missions');
  assert.deepEqual(missions.learned, ['Night Owl Express'], 'words the pack already has are not duplicated');
  assert.ok(p.context.strong.includes('Zed Quillfeather') && p.context.strong.includes('Palm Tree Media'));
  const comm = p.categories.find((c) => c.id === 'community');
  assert.deepEqual(comm.terms, ['midnight ferry'], 'regexes from the network are dropped');
  assert.equal(GTA.categories.find((c) => c.id === 'missions').learned, undefined, 'the original pack is not modified');

  const m = compile([p]);
  assert.deepEqual(ids(m.evaluate('Zed Quillfeather mission is wild')), ['missions']);
  assert.deepEqual(ids(m.evaluate('GTA 6 midnight ferry')), ['community']);
});

test('a learned word the user removed stays removed', () => {
  const [p] = P.augmentPacks([GTA], { gta6: { categories: { missions: ['Night Owl Express'] } } }, null);
  const s = P.withPackState(S.merge({}), [p]);
  s.packs.gta6.categories.missions.removed = ['Night Owl Express'];
  assert.equal(M.compile(s, [p]).evaluate('GTA 6 Night Owl Express'), null);
});

test('pack sources are validated', () => {
  const r = P.validatePack({
    name: 'X', context: { strong: ['x'] }, categories: [{ id: 'story', terms: ['a'] }],
    sources: [
      { type: 'mediawiki', api: 'https://wiki.example/api.php', category: 'Characters', into: 'story', depth: 9, context: 'auto' },
      { type: 'mediawiki', api: 'http://wiki.example/api.php', category: 'X', into: 'story' },
      { type: 'mediawiki', api: 'https://wiki.example/api.php', category: 'X', into: 'missing' },
      { type: 'scrape-everything', api: 'https://x' }
    ]
  });
  assert.equal(r.pack.sources.length, 1);
  assert.equal(r.pack.sources[0].depth, 2);
  assert.equal(r.warnings.length, 3);
});

/* ---------- identity, fingerprints, feed ---------- */

test('the same video is recognised from links, embeds and thumbnails', () => {
  const c = P.compileItemIds(SITES);
  for (const u of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://m.youtube.com/watch?feature=x&v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg']) {
    assert.deepEqual(P.keysFor(u, c), ['youtube:dQw4w9WgXcQ'], u);
  }
  assert.deepEqual(P.keysFor('https://www.tiktok.com/@a.b/video/7312345678901234567', c), ['tiktok:7312345678901234567']);
  assert.deepEqual(P.keysFor('https://example.com/', c), []);
});

function picture(w, h, fn) {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = fn(x / w, y / h);
    px.set([v, v, v, 255], (y * w + x) * 4);
  }
  return px;
}

test('picture fingerprints: same picture matches, letterboxed copy matches, different picture does not', () => {
  const scene = (x, y) => 128 + 100 * Math.sin(x * 9) * Math.cos(y * 7);
  const a = IH.dhash(picture(64, 64, scene), 64, 64);
  const b = IH.dhash(picture(64, 64, (x, y) => Math.min(255, scene(x, y) * 1.05 + 4)), 64, 64); // brighter recompress
  const boxed = IH.dhash(picture(64, 64, (x, y) => (y < 0.125 || y >= 0.875 ? 0 : scene(x, (y - 0.125) / 0.75))), 64, 64);
  const other = IH.dhash(picture(64, 64, (x, y) => 128 + 100 * Math.cos(x * 4 + y * 11)), 64, 64);
  assert.equal(a.length, 16);
  assert.ok(P.hashDistance(a, b) <= 4, `recompressed ${P.hashDistance(a, b)}`);
  assert.ok(P.hashDistance(a, boxed) <= 12, `letterboxed ${P.hashDistance(a, boxed)}`);
  assert.ok(P.hashDistance(a, other) > 20, `different ${P.hashDistance(a, other)}`);
  assert.equal(IH.dhash(picture(32, 32, () => 90), 32, 32), '', 'blank pictures are not fingerprinted');
});

test('community feed is validated', () => {
  const f = C.validateFeed({
    version: 'v1',
    items: { 'youtube:dQw4w9WgXcQ': 7, 'bad key': 3, 'x:12345678': { n: 4 } },
    hashes: ['0123456789abcdef', { h: 'fedcba9876543210', n: 9 }, 'nothex'],
    learned: { gta6: { terms: ['night train', '/(a+)+/', 'x'], authors: ['Palm Tree Media'] }, 'BAD PACK': { terms: ['y'] } }
  });
  assert.deepEqual(f.items, { 'youtube:dQw4w9WgXcQ': 7, 'x:12345678': 4 });
  assert.equal(f.hashes.length, 2);
  assert.deepEqual(f.learned, { gta6: { terms: ['night train'], authors: ['Palm Tree Media'] } });
});

test('vision answers are parsed defensively', () => {
  assert.deepEqual(V.parse('{"text":"LUCIA DIES","videoGame":true,"game":"GTA VI"}'), { text: 'LUCIA DIES', videoGame: true, game: 'GTA VI' });
  assert.deepEqual(V.parse('```json\n{"text":"x","videoGame":false,"game":""}\n```'), { text: 'x', videoGame: false, game: '' });
  assert.equal(V.parse('not json at all').text, 'not json at all');
  // What the picture says goes through the same matcher as any caption.
  const m = compile();
  assert.deepEqual(ids(m.evaluate('you have to see this \n LUCIA DIES??')), ['story']);
});
