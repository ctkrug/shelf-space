import { describe, expect, it } from "vitest";
import { MODELS } from "../src/core/models.js";

describe("model roster", () => {
  it("uses the published July 2026 API context windows", () => {
    expect(Object.fromEntries(MODELS.map((model) => [model.id, model.contextWindow]))).toEqual({
      "gpt-5.6-sol": 1_050_000,
      "claude-fable-5": 1_000_000,
      "gemini-3.5-flash": 1_000_000,
      "kimi-k3": 1_048_576,
    });
  });
});
