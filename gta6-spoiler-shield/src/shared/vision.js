/*
 * Optional on-device vision: reads the words inside a thumbnail and says whether it looks like game footage.
 * Uses Chrome's built-in model (LanguageModel, runs locally, nothing is uploaded) or, failing that, the
 * browser's TextDetector. The answer is plain text that goes through the normal matcher, so packs still
 * decide what is a spoiler: "LUCIA DIES??" written on a thumbnail is caught by the pack's words.
 */
(function (root) {
  'use strict';

  const PROMPT = 'Look at this image. Copy every word written in it exactly (titles, captions, subtitles, on-screen text). ' +
    'Say whether it is a screenshot or footage from a video game, and name the game if you recognise it. ' +
    'Reply only with JSON: {"text": "...", "videoGame": true or false, "game": "..."}';
  const SCHEMA = {
    type: 'object',
    properties: { text: { type: 'string' }, videoGame: { type: 'boolean' }, game: { type: 'string' } },
    required: ['text', 'videoGame', 'game']
  };
  const OPTIONS = {
    expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'image' }],
    expectedOutputs: [{ type: 'text', languages: ['en'] }]
  };

  let base = null;

  /** { engine: 'on-device-model' | 'text-detector' | 'none', state: 'available' | 'downloadable' | 'downloading' | 'unavailable' } */
  async function status() {
    const LM = root.LanguageModel;
    if (LM && typeof LM.availability === 'function') {
      try { return { engine: 'on-device-model', state: await LM.availability(OPTIONS) }; } catch (e) { /* fall through */ }
    }
    if (typeof root.TextDetector === 'function') return { engine: 'text-detector', state: 'available' };
    return { engine: 'none', state: 'unavailable' };
  }

  function parse(raw) {
    const s = String(raw || '').replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '').trim();
    try {
      const j = JSON.parse(s);
      return { text: String(j.text || '').slice(0, 600), videoGame: j.videoGame === true, game: String(j.game || '').slice(0, 80) };
    } catch (_) {
      return { text: s.slice(0, 600), videoGame: false, game: '' };
    }
  }

  async function analyze(blob) {
    const st = await status();
    if (st.engine === 'on-device-model' && st.state === 'available') {
      if (!base) base = await root.LanguageModel.create(OPTIONS);
      // A fresh conversation for every image, so one thumbnail never colours the next answer.
      const session = typeof base.clone === 'function' ? await base.clone() : base;
      try {
        const raw = await session.prompt([{ role: 'user', content: [{ type: 'text', value: PROMPT }, { type: 'image', value: blob }] }], { responseConstraint: SCHEMA });
        return parse(raw);
      } finally {
        if (session !== base && typeof session.destroy === 'function') session.destroy();
      }
    }
    if (st.engine === 'text-detector') {
      const bmp = await createImageBitmap(blob);
      const found = await new root.TextDetector().detect(bmp);
      return { text: found.map((f) => f.rawValue).join(' ').slice(0, 600), videoGame: false, game: '' };
    }
    throw new Error('This browser has no on-device vision');
  }

  /** Starts the one-time model download. Must be called from a click (user activation). */
  async function download(onProgress) {
    const LM = root.LanguageModel;
    if (!LM) throw new Error('This browser has no built-in model');
    const s = await LM.create(Object.assign({}, OPTIONS, {
      monitor(m) { m.addEventListener('downloadprogress', (e) => onProgress && onProgress(e.loaded)); }
    }));
    if (typeof s.destroy === 'function') s.destroy();
  }

  const api = { status, analyze, download, parse, PROMPT };
  root.GSS = root.GSS || {};
  root.GSS.vision = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
