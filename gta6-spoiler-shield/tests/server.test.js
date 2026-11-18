// Run: node --test tests/server.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer, phrasesOf, hamming } = require('../server/server.js');

async function start(overrides) {
  const s = createServer(Object.assign({
    dataFile: '', trustProxy: true, itemThreshold: 3, hashThreshold: 3, termThreshold: 3, authorThreshold: 3, ratePerHour: 1000
  }, overrides));
  await new Promise((r) => s.server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${s.server.address().port}`;
  const post = (path, body, ip = '10.0.0.1', headers = {}) => fetch(base + path, {
    method: 'POST', headers: Object.assign({ 'content-type': 'application/json', 'x-forwarded-for': ip }, headers), body: JSON.stringify(body)
  });
  const feed = async () => { s.store.invalidate(); return (await fetch(base + '/v1/feed')).json(); };
  return { s, base, post, feed, stop: () => new Promise((r) => s.server.close(r)) };
}

const client = (i) => `client-${String(i).padStart(4, '0')}-xxxx`;

test('an item is listed only after enough different people report it', async () => {
  const t = await start();
  try {
    const body = (i) => ({ client: client(i), keys: ['youtube:AAAAAAAAAAA'], hashes: [], title: 'bro what 💀', packs: ['gta6'] });
    await t.post('/v1/report', body(1), '10.0.0.1');
    await t.post('/v1/report', body(2), '10.0.0.2');
    assert.equal((await t.feed()).items['youtube:AAAAAAAAAAA'], undefined);
    await t.post('/v1/report', body(3), '10.0.0.3');
    assert.equal((await t.feed()).items['youtube:AAAAAAAAAAA'], 3);
  } finally { await t.stop(); }
});

test('one person with many install ids on one network counts once', async () => {
  const t = await start();
  try {
    for (let i = 0; i < 10; i++) await t.post('/v1/report', { client: client(i), keys: ['x:1234567'], title: 'x' }, '10.9.9.9');
    assert.equal((await t.feed()).items['x:1234567'], undefined);
  } finally { await t.stop(); }
});

test('"not a spoiler" votes pull an item back out', async () => {
  const t = await start();
  try {
    for (let i = 1; i <= 4; i++) await t.post('/v1/report', { client: client(i), keys: ['reddit:abcd12'] }, `10.0.1.${i}`);
    assert.equal((await t.feed()).items['reddit:abcd12'], 4);
    for (let i = 10; i <= 12; i++) await t.post('/v1/safe', { client: client(i), keys: ['reddit:abcd12'] }, `10.0.2.${i}`);
    assert.equal((await t.feed()).items['reddit:abcd12'], undefined);
  } finally { await t.stop(); }
});

test('near-identical picture fingerprints are counted together', async () => {
  const t = await start();
  try {
    const hs = ['ffff0000ffff0000', 'ffff0000ffff0001', 'ffff0000ffff0003'];
    for (let i = 0; i < 3; i++) await t.post('/v1/report', { client: client(i), hashes: [hs[i]] }, `10.0.3.${i}`);
    const f = await t.feed();
    assert.equal(f.hashes.length, 1);
    assert.equal(f.hashes[0].n, 3);
  } finally { await t.stop(); }
});

test('learns names that keep showing up in reported titles, and channels', async () => {
  const t = await start();
  try {
    const titles = ['Night Train mission is insane', 'they did THAT in Night Train??', 'Night Train ending 😭', 'bro what'];
    for (let i = 0; i < titles.length; i++) {
      await t.post('/v1/report', { client: client(i), keys: [`youtube:BBBBBBBBBB${i}`], title: titles[i], author: 'Leonida Leaks', packs: ['gta6'] }, `10.0.4.${i}`);
    }
    const f = await t.feed();
    assert.ok(f.learned.gta6.terms.includes('night train'), JSON.stringify(f.learned));
    assert.ok(!f.learned.gta6.terms.includes('night'), 'single words inside a learned phrase are dropped');
    assert.ok(!f.learned.gta6.terms.some((p) => ['insane', 'mission', 'ending', 'bro'].includes(p)), 'common words are never learned');
    assert.deepEqual(f.learned.gta6.authors, ['Leonida Leaks']);
  } finally { await t.stop(); }
});

test('rejects junk and rate-limits', async () => {
  const t = await start({ ratePerHour: 3 });
  try {
    assert.equal((await t.post('/v1/report', { client: 'short', keys: ['youtube:AAAAAAAAAAA'] })).status, 400);
    assert.equal((await t.post('/v1/report', { client: client(1), keys: ['not a key'] })).status, 400);
    assert.equal((await t.post('/v1/report', { client: client(1), keys: ['youtube:AAAAAAAAAAA'] }, '10.7.7.7')).status, 200);
    await t.post('/v1/report', { client: client(1), keys: ['youtube:AAAAAAAAAAA'] }, '10.7.7.7');
    await t.post('/v1/report', { client: client(1), keys: ['youtube:AAAAAAAAAAA'] }, '10.7.7.7');
    assert.equal((await t.post('/v1/report', { client: client(1), keys: ['youtube:AAAAAAAAAAA'] }, '10.7.7.7')).status, 429);
  } finally { await t.stop(); }
});

test('moderators can remove a listing', async () => {
  const t = await start({ adminToken: 'secret' });
  try {
    for (let i = 1; i <= 3; i++) await t.post('/v1/report', { client: client(i), keys: ['tiktok:123456789012'] }, `10.0.5.${i}`);
    assert.ok((await t.feed()).items['tiktok:123456789012']);
    assert.equal((await t.post('/v1/admin/remove', { keys: ['tiktok:123456789012'] }, '1.1.1.1', { authorization: 'Bearer nope' })).status, 403);
    await t.post('/v1/admin/remove', { keys: ['tiktok:123456789012'] }, '1.1.1.1', { authorization: 'Bearer secret' });
    assert.equal((await t.feed()).items['tiktok:123456789012'], undefined);
  } finally { await t.stop(); }
});

test('helpers', () => {
  assert.equal(hamming('0000000000000000', '000000000000000f'), 4);
  assert.ok(phrasesOf('Jason & Lucia at the Night Train').includes('night train'));
  assert.deepEqual(phrasesOf('the best video ever lol'), []);
});
