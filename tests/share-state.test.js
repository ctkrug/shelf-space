import { describe, expect, it } from "vitest";
import { decodeSharedText, encodeSharedText, shareStateForText } from "../src/core/share-state.js";

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
});
