/**
 * Shelf roster. Context windows match the vendors' published API limits as
 * of July 2026. Tokenizer ratios remain estimates because this static,
 * client-only app does not send pasted text to vendor tokenization APIs.
 */
export const MODELS = [
  {
    id: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    vendor: "OpenAI",
    contextWindow: 1_050_000,
    charsPerToken: 4.0,
    tokensPerWord: 1.3,
  },
  {
    id: "claude-fable-5",
    label: "Claude Fable 5",
    vendor: "Anthropic",
    contextWindow: 1_000_000,
    charsPerToken: 3.7,
    tokensPerWord: 1.25,
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    vendor: "Google",
    contextWindow: 1_000_000,
    charsPerToken: 4.2,
    tokensPerWord: 1.35,
  },
  {
    id: "kimi-k3",
    label: "Kimi K3",
    vendor: "Moonshot AI",
    contextWindow: 1_048_576,
    charsPerToken: 3.5,
    tokensPerWord: 1.2,
  },
];
