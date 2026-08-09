import { groq } from "./client";
import {
  getGroqReasoningOptions,
  GROQ_MODEL,
} from "./config";

export async function askGroq(prompt: string) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    ...getGroqReasoningOptions(),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  return (
    completion.choices[0]?.message?.content ??
    "I couldn't generate a response."
  );
}
