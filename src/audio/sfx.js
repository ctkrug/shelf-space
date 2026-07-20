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
 * AudioContext is created lazily on first use since it's always
 * called from inside a user-gesture-driven handler (typing/clicking).
 */
export function createAudioController() {
  let ctx = null;
  let muted = readMutedPreference();

  function ensureContext() {
    if (ctx) return ctx;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
    return ctx;
  }

  function playTone({ frequency, duration, type, gain }) {
    if (muted) return;
    const audioCtx = ensureContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gainNode).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playThunk() {
    playTone({ frequency: 130, duration: 0.1, type: "sine", gain: 0.09 });
  }

  function playClatter() {
    playTone({ frequency: 85, duration: 0.24, type: "square", gain: 0.05 });
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

  return { playThunk, playClatter, isMuted, setMuted, toggleMuted };
}
