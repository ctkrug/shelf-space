import { describe, expect, it } from "vitest";
import {
  decodeSharedText,
  encodeSharedText,
  shareStateForText,
  sharedTextFromUrl,
  urlWithShareState,
} from "../src/core/share-state.js";

describe("shared text state", () => {
  it("round-trips Unicode text through a URL-safe payload", () => {
    const text = "A library shelf 📚 — café\n第二章";

    expect(decodeSharedText(encodeSharedText(text))).toBe(text);
  });

  it("rejects malformed payloads without throwing", () => {
    expect(decodeSharedText("%%not-a-payload%%")).toBeNull();
  });

  it("only creates a share payload within the URL budget", () => {
    expect(shareStateForText("short text")).toMatchObject({ ok: true });
    expect(shareStateForText("x".repeat(5000))).toEqual({ ok: false, reason: "too-long" });
  });

  it("replaces stale shared state and restores only valid text", () => {
    const shared = urlWithShareState("https://shelf.space/?old=value#room", "hello");

    expect(shared).toMatch(/^https:\/\/shelf\.space\/\?s=/);
    expect(shared).toContain("#room");
    expect(sharedTextFromUrl(shared)).toBe("hello");
    expect(sharedTextFromUrl("https://shelf.space/?s=bad%25payload")).toBeNull();
  });
});
