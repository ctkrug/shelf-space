const MUTE_STORAGE_KEY = "shelf-space:muted";

function readMutedPreference() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function persistMutedPreference(muted) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
  } catch {
    // Private browsing or storage policies should not disable the controls.
  }
}

/**
 * WebAudio-synthesized SFX (oscillators only, no audio files): a soft
 * "thunk" when books land and a lower "clatter" when a shelf spills
 * onto the floor. Mute state persists to localStorage; the
 * AudioContext is created lazily by `prime`, which the entry point calls from
 * the first pointer or keyboard gesture to satisfy browser autoplay policy.
 */
export function createAudioController() {
  let ctx = null;
  let muted = readMutedPreference();
  let lastRustleAt = -Infinity;

  function ensureContext() {
    if (ctx) return ctx;
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return null;
    try {
      ctx = new AudioContextClass();
    } catch {
      return null;
    }
    return ctx;
  }

  function prime() {
    const audioCtx = ensureContext();
    if (audioCtx?.state === "suspended") Promise.resolve(audioCtx.resume()).catch(() => {});
  }

  function playTone({ frequency, duration, type, gain, delay = 0 }) {
    if (muted) return;
    const audioCtx = ensureContext();
    if (!audioCtx) return;

    try {
      const startAt = audioCtx.currentTime + delay;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startAt);
      gainNode.gain.setValueAtTime(gain, startAt);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      osc.connect(gainNode).connect(audioCtx.destination);
      osc.start(startAt);
      osc.stop(startAt + duration);
    } catch {
      // A suspended or policy-blocked context must never interrupt the toy.
    }
  }

  function playThunk() {
    playTone({ frequency: 130, duration: 0.1, type: "sine", gain: 0.09 });
  }

  function playClatter() {
    playTone({ frequency: 85, duration: 0.24, type: "square", gain: 0.05 });
  }

  function playChime() {
    playTone({ frequency: 392, duration: 0.16, type: "sine", gain: 0.045 });
    playTone({ frequency: 523, duration: 0.2, type: "sine", gain: 0.04, delay: 0.1 });
  }

  function playRustle() {
    if (!ctx || ctx.currentTime - lastRustleAt < 0.08) return;
    lastRustleAt = ctx.currentTime;
    playTone({ frequency: 220, duration: 0.035, type: "triangle", gain: 0.018 });
  }

  function isMuted() {
    return muted;
  }

  function setMuted(next) {
    muted = next;
    persistMutedPreference(muted);
  }

  function toggleMuted() {
    setMuted(!muted);
    return muted;
  }

  return { prime, playThunk, playClatter, playChime, playRustle, isMuted, setMuted, toggleMuted };
}
