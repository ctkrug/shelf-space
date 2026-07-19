import { describe, expect, it } from "vitest";
import { estimateTokens } from "../src/core/tokenizer.js";
import { MODELS } from "../src/core/models.js";

const gpt = MODELS.find((m) => m.id === "gpt-5.6");
const claude = MODELS.find((m) => m.id === "claude");

describe("estimateTokens", () => {
  it("returns 0 for empty or whitespace-only text", () => {
    expect(estimateTokens("", gpt)).toBe(0);
    expect(estimateTokens("   \n\t  ", gpt)).toBe(0);
  });

  it("returns at least 1 token for any non-empty text", () => {
    expect(estimateTokens("hi", gpt)).toBeGreaterThanOrEqual(1);
  });

  it("scales roughly linearly with input length", () => {
    const short = estimateTokens("the quick brown fox", gpt);
    const long = estimateTokens("the quick brown fox ".repeat(50), gpt);
    expect(long).toBeGreaterThan(short * 30);
  });

  it("produces different counts for different models on the same text", () => {
    const text = "the quick brown fox jumps over the lazy dog ".repeat(20);
    const gptTokens = estimateTokens(text, gpt);
    const claudeTokens = estimateTokens(text, claude);
    expect(gptTokens).not.toBe(claudeTokens);
  });

  it("is deterministic for the same input", () => {
    const text = "shelf space is a physical metaphor for context windows";
    expect(estimateTokens(text, gpt)).toBe(estimateTokens(text, gpt));
  });
});
