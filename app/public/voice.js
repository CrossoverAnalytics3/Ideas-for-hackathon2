// Voice in, voice out. Push-to-talk on the browser's speech recognizer with
// client-side timing for the fluency signal; TTS through /api/tts when the
// server has a voice configured, else the browser's own synthesizer.
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // ---- speech out ----
  let voices = [];
  function loadVoices() { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

  async function speak(text, { onStart, onEnd } = {}) {
    // Server TTS first (a real child voice, if configured).
    try {
      const r = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
      if (r.status === 200) {
        const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = new Audio(url);
        await new Promise(res => { a.onplay = () => onStart && onStart(); a.onended = () => { onEnd && onEnd(); URL.revokeObjectURL(url); res(); }; a.onerror = () => { onEnd && onEnd(); res(); }; a.play().catch(() => { onEnd && onEnd(); res(); }); });
        return;
      }
    } catch (e) { /* fall through */ }
    if (!window.speechSynthesis) { onStart && onStart(); onEnd && onEnd(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const pref = voices.find(v => /child|kid|junior/i.test(v.name)) || voices.find(v => /en[-_](US|GB)/i.test(v.lang) && /female|samantha|karen|moira|google uk english female/i.test(v.name)) || voices.find(v => /^en/i.test(v.lang));
    if (pref) u.voice = pref;
    u.pitch = 1.5; u.rate = 1.05;
    await new Promise(res => { u.onstart = () => onStart && onStart(); u.onend = () => { onEnd && onEnd(); res(); }; u.onerror = () => { onEnd && onEnd(); res(); }; speechSynthesis.speak(u); });
  }

  // ---- speech in ----
  // Returns a controller: start() begins listening, stop() resolves with
  // {transcript, onsetMs, gapsMs, durationMs, confidence}.
  function recognizer({ onInterim } = {}) {
    if (!SR) return null;
    let rec, chunks, t0, firstAt, lastAt, gaps, final, conf, resolveStop, stopped;
    function start(anchorTime) {
      rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      chunks = []; gaps = []; firstAt = null; lastAt = null; final = ''; conf = 1; stopped = false;
      t0 = anchorTime || performance.now();
      rec.onresult = ev => {
        const now = performance.now();
        if (firstAt == null) firstAt = now; else if (now - lastAt > 500) gaps.push(Math.round(now - lastAt));
        lastAt = now;
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i];
          if (r.isFinal) { final += r[0].transcript + ' '; if (typeof r[0].confidence === 'number' && r[0].confidence > 0) conf = Math.min(conf, r[0].confidence); }
          else interim += r[0].transcript;
        }
        onInterim && onInterim((final + interim).trim());
      };
      rec.onend = () => { if (resolveStop) finish(); };
      rec.onerror = () => { if (resolveStop) finish(); };
      try { rec.start(); } catch (e) {}
    }
    function finish() {
      const now = performance.now();
      const out = {
        transcript: final.trim() || (chunks.join(' ').trim()),
        onsetMs: firstAt == null ? Math.round(now - t0) : Math.round(firstAt - t0),
        gapsMs: gaps, durationMs: firstAt == null ? 0 : Math.round((lastAt || now) - firstAt),
        confidence: conf,
      };
      const r = resolveStop; resolveStop = null; r(out);
    }
    function stop() {
      return new Promise(res => { resolveStop = res; try { rec.stop(); } catch (e) { finish(); } setTimeout(() => { if (resolveStop) finish(); }, 1500); });
    }
    return { start, stop, supported: true };
  }

  window.Voice = { speak, recognizer, supported: !!SR };
})();
