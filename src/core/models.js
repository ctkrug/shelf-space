/**
 * Shelf roster. Context windows and tokenizer ratios are approximations
 * (each vendor's real tokenizer is proprietary) but are kept in one place
 * so a new model release is a data change here, not a rendering change.
 */
export const MODELS = [
  {
    id: "gpt-5.6",
    label: "GPT-5.6",
    vendor: "OpenAI",
    contextWindow: 900_000,
    charsPerToken: 4.0,
    tokensPerWord: 1.3,
  },
  {
    id: "claude",
    label: "Claude",
    vendor: "Anthropic",
    contextWindow: 150_000,
    charsPerToken: 3.7,
    tokensPerWord: 1.25,
  },
  {
    id: "gemini",
    label: "Gemini",
    vendor: "Google",
    contextWindow: 250_000,
    charsPerToken: 4.2,
    tokensPerWord: 1.35,
  },
  {
    id: "kimi-k3",
    label: "Kimi K3",
    vendor: "Moonshot AI",
    contextWindow: 8_000_000,
    charsPerToken: 3.5,
    tokensPerWord: 1.2,
  },
];
