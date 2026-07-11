import { groq } from "./client";

export async function askGroq(prompt: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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