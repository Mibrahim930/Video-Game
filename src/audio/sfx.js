// Tiny synthesised sound effects. No audio files, one lazily created
// AudioContext (browsers only allow audio after a user gesture).

const MUTE_KEY = 'arena-survival.muted';

let ctx = null;
let master = null;
let muted = loadMuted();

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function ensureContext() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/**
 * Play a single oscillator note.
 * @param {object} o  { type, from, to, duration, gain, delay }
 */
function tone({ type = 'square', from = 440, to = from, duration = 0.08, gain = 1, delay = 0 }) {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  /** Call from any user gesture so the context is unlocked before play. */
  unlock() {
    ensureContext();
  },
  shoot() {
    tone({ type: 'square', from: 880, to: 440, duration: 0.05, gain: 0.5 });
  },
  hit() {
    tone({ type: 'triangle', from: 300, to: 200, duration: 0.04, gain: 0.6 });
  },
  kill() {
    tone({ type: 'sawtooth', from: 520, to: 120, duration: 0.14, gain: 0.8 });
  },
  hurt() {
    tone({ type: 'sawtooth', from: 160, to: 60, duration: 0.2, gain: 1 });
  },
  upgrade() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'square', from: f, duration: 0.1, gain: 0.6, delay: i * 0.07 }));
  },
  waveStart() {
    tone({ type: 'square', from: 392, duration: 0.09, gain: 0.5 });
    tone({ type: 'square', from: 523, duration: 0.12, gain: 0.5, delay: 0.1 });
  },
  gameOver() {
    [392, 330, 262, 196].forEach((f, i) => tone({ type: 'triangle', from: f, duration: 0.22, gain: 0.9, delay: i * 0.18 }));
  },
  isMuted() {
    return muted;
  },
  toggleMute() {
    muted = !muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      // ignore
    }
    return muted;
  },
};
