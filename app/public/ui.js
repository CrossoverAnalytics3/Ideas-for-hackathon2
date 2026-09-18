// Small shared helpers: API calls, math rendering, nav mode chip, query params.
window.UI = (function () {
  async function api(path, opts = {}) {
    const r = await fetch(path, { headers: opts.body && !(opts.body instanceof FormData) ? { 'content-type': 'application/json' } : {}, ...opts, body: opts.body instanceof FormData ? opts.body : opts.body ? JSON.stringify(opts.body) : undefined });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
    return r.json();
  }
  // "1/2 + 1/3" -> stacked fractions. Leaves other text alone.
  function math(text) {
    return String(text).replace(/(\d+)\/(\d+)/g, '<span class="frac"><span>$1</span><span>$2</span></span>');
  }
  function q(name) { return new URLSearchParams(location.search).get(name); }
  async function nav(active) {
    const el = document.querySelector('nav');
    if (!el) return;
    el.innerHTML = `<a class="brand" href="/">Understudy</a>
      <a href="/" class="small ${active === 'intake' ? '' : 'dim'}">Photo</a>
      <a href="#" id="navTeach" class="small ${active === 'teach' ? '' : 'dim'}">Teach</a>
      <a href="#" id="navBrief" class="small ${active === 'brief' ? '' : 'dim'}">Brief</a>
      <span class="mode" id="modeChip">…</span>`;
    const s = q('s');
    el.querySelector('#navTeach').href = s ? `/teach.html?s=${s}&q=${q('q') || 0}` : '/';
    el.querySelector('#navBrief').href = s ? `/brief.html?s=${s}` : '/';
    try { const h = await api('/api/health'); const c = el.querySelector('#modeChip'); c.textContent = h.mode === 'live' ? 'live · ' + h.model : 'mock mode'; c.classList.toggle('mock', h.mode !== 'live'); } catch (e) {}
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  return { api, math, q, nav, esc };
})();
