/*
 * Runs in the page's own JavaScript world. Its only job: tell the content script when the page
 * creates an open shadow root, so text inside web components (new Reddit, many feeds) is checked too.
 * Closed shadow roots are left closed.
 */
(() => {
  const proto = Element.prototype;
  const orig = proto.attachShadow;
  if (!orig || orig.__gssPatched) return;
  function attachShadow(init) {
    const root = orig.call(this, init);
    if (init && init.mode === 'open') {
      const host = this;
      queueMicrotask(() => {
        try { host.dispatchEvent(new CustomEvent('gss-shadow-attached', { bubbles: true, composed: true })); } catch (_) {}
      });
    }
    return root;
  }
  attachShadow.__gssPatched = true;
  Object.defineProperty(proto, 'attachShadow', { value: attachShadow, writable: true, configurable: true });
})();
