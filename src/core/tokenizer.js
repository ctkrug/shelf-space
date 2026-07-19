/**
 * Blended token estimator: real BPE tokenizers land between a pure
 * character count and a pure word count, so we average both signals
 * rather than trusting either alone (a char-only estimate undercounts
 * dense punctuation/code; a word-only estimate misses subword splits).
 */
export function estimateTokens(text, model) {
  const normalized = (text ?? "").trim();
  if (!normalized) return 0;

  const charEstimate = normalized.length / model.charsPerToken;
  const wordCount = normalized.split(/\s+/).length;
  const wordEstimate = wordCount * model.tokensPerWord;

  return Math.max(1, Math.round((charEstimate + wordEstimate) / 2));
}
