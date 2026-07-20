const MAX_SHARE_PAYLOAD_LENGTH = 1800;

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(globalThis.atob(padded), (character) => character.charCodeAt(0));
}

/** Encodes UTF-8 text for the share query without exposing raw text in the URL. */
export function encodeSharedText(text) {
  return toBase64Url(new globalThis.TextEncoder().encode(text));
}

/** Returns decoded shared text, or null for a corrupt/non-UTF-8 payload. */
export function decodeSharedText(payload) {
  if (typeof payload !== "string" || !/^[A-Za-z0-9_-]+$/.test(payload)) return null;
  try {
    return new globalThis.TextDecoder("utf-8", { fatal: true }).decode(fromBase64Url(payload));
  } catch {
    return null;
  }
}

/**
 * Keeps share URLs short enough for common browser and messaging limits. The
 * original input remains local when it will not fit; callers surface the
 * returned reason instead of attempting a broken navigation update.
 */
export function shareStateForText(text) {
  const payload = encodeSharedText(text);
  if (payload.length > MAX_SHARE_PAYLOAD_LENGTH) return { ok: false, reason: "too-long" };
  return { ok: true, payload };
}

/** Restores valid shared text from a URL without trusting malformed input. */
export function sharedTextFromUrl(url) {
  try {
    return decodeSharedText(new globalThis.URL(url).searchParams.get("s"));
  } catch {
    return null;
  }
}

/** Replaces the input query state while preserving the URL's origin and hash. */
export function urlWithShareState(url, text) {
  const next = new globalThis.URL(url);
  next.search = "";
  if (text.length === 0) return next.toString();
  const state = shareStateForText(text);
  if (!state.ok) return null;
  next.searchParams.set("s", state.payload);
  return next.toString();
}
