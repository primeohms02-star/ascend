import { GROQ_VISION_MODEL } from "@/lib/groq/config";
import { groq } from "@/lib/atlas/groq";

export type AtlasImageInput = {
  dataUrl: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  name?: string;
};

export function isValidAtlasImage(value: unknown): value is AtlasImageInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const image = value as Partial<AtlasImageInput>;
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  return (
    typeof image.dataUrl === "string" &&
    image.dataUrl.length > 0 &&
    image.dataUrl.length <= 3_900_000 &&
    typeof image.mimeType === "string" &&
    allowedTypes.has(image.mimeType) &&
    image.dataUrl.startsWith(`data:${image.mimeType};base64,`)
  );
}

export async function analyzeAtlasImage({
  image,
  userMessage,
}: {
  image: AtlasImageInput;
  userMessage: string;
}) {
  const completion = await groq.chat.completions.create({
    model: GROQ_VISION_MODEL,
    temperature: 0.2,
    max_completion_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are the visual analysis layer for ATLAS inside ASCEND.\n\nUser request: ${
              userMessage || "Please analyze this image."
            }\n\nDescribe only the visual information that is useful for answering the user's request. Be precise and concise. Read visible text when relevant. Do not invent details that are not visible. Return a factual visual summary for another model to use; do not address the user directly.`,
          },
          {
            type: "image_url",
            image_url: {
              url: image.dataUrl,
            },
          },
        ],
      },
    ] as any,
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "The image could not be described reliably."
  );
}
