/* Twin Harbours — tiny WebAudio synth. No audio files: every sound is an
 * oscillator envelope, created on first use after a user gesture. */

let audioCtx = null;
let muted = false;
try { muted = localStorage.getItem('twin-harbours-muted') === '1'; } catch (e) { /* private mode */ }

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('twin-harbours-muted', muted ? '1' : '0'); } catch (e) { /* private mode */ }
  return muted;
}

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** One tone: frequency, start delay, length, waveform and peak volume. */
function tone(freq, delay, dur, type, vol) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** A bright two-note chime when a difference is found. */
export function playFound(combo) {
  const base = 660 + Math.min(combo, 6) * 40;
  tone(base, 0, 0.16, 'sine', 0.22);
  tone(base * 1.5, 0.09, 0.24, 'sine', 0.2);
  tone(base * 2, 0.18, 0.3, 'triangle', 0.1);
}

/** A low buzz for a wrong click. */
export function playWrong() {
  tone(140, 0, 0.18, 'sawtooth', 0.12);
  tone(105, 0.05, 0.2, 'sawtooth', 0.1);
}

/** A soft shimmer when a hint is used. */
export function playHint() {
  tone(880, 0, 0.14, 'sine', 0.14);
  tone(1174, 0.08, 0.18, 'sine', 0.12);
  tone(1568, 0.16, 0.22, 'sine', 0.1);
}

/** A rising arpeggio when a level is cleared. */
export function playLevelClear() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.18));
}

/** A short fanfare for finishing the voyage. */
export function playWin() {
  [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.18));
}

/** A gentle tick when time runs low. */
export function playTick() {
  tone(980, 0, 0.06, 'square', 0.05);
}
