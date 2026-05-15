/* ============================================================
   SHARED AUDIO UTILITIES — Mon cours de français
   ============================================================ */

let frenchVoice = null;
let firstAudioClick = true;
let currentAudio = null;

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showStatus(msg, warn) {
  const el = document.getElementById('audioStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = 'audio-status show' + (warn ? ' warn' : '');
  setTimeout(() => el.classList.remove('show'), 4000);
}

function pickFrenchVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  let v = voices.find(v => v.lang === 'fr-FR');
  if (!v) v = voices.find(v => v.lang === 'fr-CA');
  if (!v) v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('fr'));
  return v || null;
}

if ('speechSynthesis' in window) {
  frenchVoice = pickFrenchVoice();
  speechSynthesis.onvoiceschanged = () => { frenchVoice = pickFrenchVoice(); };
  setTimeout(() => { frenchVoice = pickFrenchVoice(); }, 500);
}

function speakViaGoogle(text, btn) {
  if (currentAudio) { try { currentAudio.pause(); } catch(e){} currentAudio = null; }
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=fr&client=tw-ob';
  const audio = new Audio(url);
  currentAudio = audio;
  if (btn) btn.classList.add('playing');
  const cleanup = () => { if (btn) btn.classList.remove('playing'); };
  audio.onended = cleanup; audio.onpause = cleanup;
  audio.onerror = () => { cleanup(); showStatus('Audio no disponible. Revisá conexión.', true); };
  const p = audio.play();
  if (p && p.catch) p.catch(() => { cleanup(); showStatus('Audio bloqueado por el navegador', true); });
}

function speakViaWebSpeech(text, btn) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR'; u.rate = 0.85; u.pitch = 1.0;
  if (frenchVoice) u.voice = frenchVoice;
  if (btn) {
    btn.classList.add('playing');
    u.onend = () => btn.classList.remove('playing');
    u.onerror = () => btn.classList.remove('playing');
  }
  speechSynthesis.speak(u);
}

function speak(text, btn) {
  if (!text) return;
  if (!frenchVoice && 'speechSynthesis' in window) frenchVoice = pickFrenchVoice();
  if (frenchVoice) {
    speakViaWebSpeech(text, btn);
    if (firstAudioClick) { showStatus('Audio: voz nativa · ' + (frenchVoice.name || 'fr-FR')); firstAudioClick = false; }
    return;
  }
  speakViaGoogle(text, btn);
  if (firstAudioClick) { showStatus('Audio: Google TTS · requiere internet'); firstAudioClick = false; }
}
