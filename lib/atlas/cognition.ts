import { askGroq } from "@/lib/groq/chat";
import type {
  CognitionResult,
} from "@/lib/atlas/types";

export async function runCognition(
  message: string,
  knowledge: string,
  reflections: string
): Promise<CognitionResult> {
  const prompt = `
You are Atlas.

You are analyzing a user.

Perform THREE tasks.

1. Extract permanent knowledge.
2. Produce ONE reflection.
3. Update the user's identity.

Return ONLY valid JSON.

Example:

{
  "knowledge":[
    {
      "category":"Project",
      "fact":"Building ASCEND"
    }
  ],

  "reflection":"The user consistently pursues ambitious goals.",

  "identity":{
    "title":"Disciplined Builder",
    "description":"A person steadily transforming ambitious ideas into reality."
  }
}

Current Message:

${message}

Known Knowledge:

${knowledge}

Current Reflections:

${reflections}
`;

  const response = await askGroq(prompt);

  try {
    return JSON.parse(response) as CognitionResult;
  } catch (error) {
    console.error(
      "Cognition parse failed:",
      response
    );

    return {
      knowledge: [],
      reflection: "",
      identity: {
        title: "Explorer",
        description:
          "A person committed to continuous growth.",
      },
    };
  }
}