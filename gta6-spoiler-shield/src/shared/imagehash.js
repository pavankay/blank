/*
 * Image fingerprints (difference hash). Two pictures that look the same give fingerprints a few bits
 * apart, even after resizing, recompression or a different caption. Black letterbox bars are trimmed
 * first, so a screenshot inside a 4:3 thumbnail matches the same screenshot at 16:9.
 * Pure functions on pixel arrays: the service worker decodes the image, this file does the math.
 */
(function (root) {
  'use strict';

  /** RGBA bytes -> luminance array. */
  function gray(rgba, w, h) {
    const out = new Float32Array(w * h);
    for (let i = 0, j = 0; i < out.length; i++, j += 4) out[i] = 0.299 * rgba[j] + 0.587 * rgba[j + 1] + 0.114 * rgba[j + 2];
    return out;
  }

  /** Bounding box without near-uniform dark or light borders (letterboxing, frames). */
  function contentBox(g, w, h) {
    const rowFlat = (y) => { let mn = 255, mx = 0; for (let x = 0; x < w; x++) { const v = g[y * w + x]; if (v < mn) mn = v; if (v > mx) mx = v; } return mx - mn < 12 && (mx < 40 || mn > 225); };
    const colFlat = (x) => { let mn = 255, mx = 0; for (let y = 0; y < h; y++) { const v = g[y * w + x]; if (v < mn) mn = v; if (v > mx) mx = v; } return mx - mn < 12 && (mx < 40 || mn > 225); };
    let top = 0, bottom = h - 1, left = 0, right = w - 1;
    while (top < bottom - 8 && rowFlat(top)) top++;
    while (bottom > top + 8 && rowFlat(bottom)) bottom--;
    while (left < right - 8 && colFlat(left)) left++;
    while (right > left + 8 && colFlat(right)) right--;
    return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
  }

  /** Average the box down to (cols x rows). */
  function downsample(g, w, box, cols, rows) {
    const out = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      const y0 = box.y + Math.floor((r * box.h) / rows);
      const y1 = Math.max(y0 + 1, box.y + Math.floor(((r + 1) * box.h) / rows));
      for (let c = 0; c < cols; c++) {
        const x0 = box.x + Math.floor((c * box.w) / cols);
        const x1 = Math.max(x0 + 1, box.x + Math.floor(((c + 1) * box.w) / cols));
        let sum = 0, n = 0;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { sum += g[y * w + x]; n++; }
        out[r * cols + c] = sum / n;
      }
    }
    return out;
  }

  /** 64-bit difference hash as 16 hex digits, or '' for a blank image (not worth matching). */
  function dhash(rgba, w, h) {
    const g = gray(rgba, w, h);
    const box = contentBox(g, w, h);
    const s = downsample(g, w, box, 9, 8);
    let min = 255, max = 0;
    for (const v of s) { if (v < min) min = v; if (v > max) max = v; }
    if (max - min < 6) return '';
    let hex = '';
    for (let r = 0; r < 8; r++) {
      let nibble = 0;
      for (let c = 0; c < 8; c++) {
        nibble = (nibble << 1) | (s[r * 9 + c] < s[r * 9 + c + 1] ? 1 : 0);
        if (c === 3 || c === 7) { hex += nibble.toString(16); nibble = 0; }
      }
    }
    return hex;
  }

  const api = { gray, contentBox, downsample, dhash };
  root.GSS = root.GSS || {};
  root.GSS.imagehash = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
