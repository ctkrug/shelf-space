import { afterEach, describe, expect, it, vi } from "vitest";
import { createAudioController } from "../src/audio/sfx.js";

afterEach(() => vi.unstubAllGlobals());

describe("createAudioController", () => {
  it("keeps mute controls usable when browser storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new Error("storage blocked"); },
      setItem: () => { throw new Error("storage blocked"); },
    });

    const audio = createAudioController();

    expect(audio.isMuted()).toBe(false);
    expect(audio.toggleMuted()).toBe(true);
  });
});
