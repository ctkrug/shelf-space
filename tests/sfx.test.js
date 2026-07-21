import { afterEach, describe, expect, it, vi } from "vitest";
import { createAudioController } from "../src/audio/sfx.js";

afterEach(() => vi.unstubAllGlobals());

describe("createAudioController", () => {
  it("treats corrupt mute storage as the default preference", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => "{not-a-boolean",
      setItem: vi.fn(),
    });

    expect(createAudioController().isMuted()).toBe(false);
  });

  it("keeps mute controls usable when browser storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new Error("storage blocked"); },
      setItem: () => { throw new Error("storage blocked"); },
    });

    const audio = createAudioController();

    expect(audio.isMuted()).toBe(false);
    expect(audio.toggleMuted()).toBe(true);
  });

  it("tolerates audio construction blocked by browser policy", () => {
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
    vi.stubGlobal("AudioContext", class BlockedAudioContext {
      constructor() {
        throw new Error("audio blocked");
      }
    });

    const audio = createAudioController();

    expect(() => audio.prime()).not.toThrow();
    expect(() => audio.playThunk()).not.toThrow();
  });
});
