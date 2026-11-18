// Hidden page the background uses when the on-device model is only available to extension pages.
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (!msg || msg.target !== 'offscreen') return;
  const V = globalThis.GSS.vision;
  if (msg.type === 'vision-status') {
    V.status().then(reply, (e) => reply({ engine: 'none', state: 'unavailable', error: e.message }));
    return true;
  }
  if (msg.type === 'vision-analyze') {
    fetch(msg.url, { credentials: 'omit' })
      .then((r) => r.blob())
      .then((b) => V.analyze(b))
      .then(reply, (e) => reply({ error: e.message }));
    return true;
  }
});
