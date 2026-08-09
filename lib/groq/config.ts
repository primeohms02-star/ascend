export const GROQ_MODEL =
  process.env.GROQ_MODEL?.trim() ||
  "openai/gpt-oss-120b";

export const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL?.trim() ||
  "qwen/qwen3.6-27b";

export function getGroqReasoningOptions(
  model = GROQ_MODEL
) {
  if (model.startsWith("openai/gpt-oss-")) {
    return {
      reasoning_effort: "low" as const,
      include_reasoning: false as const,
    };
  }

  if (model.startsWith("qwen/qwen3.6-")) {
    return {
      reasoning_effort: "none" as const,
      include_reasoning: false as const,
    };
  }

  return {};
}
