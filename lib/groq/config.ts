export const GROQ_MODEL =
  process.env.GROQ_MODEL?.trim() ||
  "openai/gpt-oss-120b";

export const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL?.trim() ||
  "qwen/qwen3.6-27b";
