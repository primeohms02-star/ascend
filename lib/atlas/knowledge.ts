type Knowledge = {
  category: string;
  fact: string;
};

export function extractKnowledge(
  message: string
): Knowledge[] {
  const knowledge: Knowledge[] = [];

  const text = message
    .toLowerCase()
    .replace(/[.,!?]/g, "");

  // Goals
  if (
    text.includes("i want to") ||
    text.includes("my goal is") ||
    text.includes("my dream is")
  ) {
    knowledge.push({
      category: "Goal",
      fact: message,
    });
  }

  // Projects
  if (
    text.includes("building") ||
    text.includes("working on") ||
    text.includes("creating") ||
    text.includes("developing")
  ) {
    knowledge.push({
      category: "Project",
      fact: message,
    });
  }

  // Weaknesses
  if (
    text.includes("i struggle with") ||
    text.includes("my weakness is") ||
    text.includes("i procrastinate")
  ) {
    knowledge.push({
      category: "Weakness",
      fact: message,
    });
  }

  // Career
  if (
    text.includes("i am a") ||
    text.includes("i'm a") ||
    text.includes("i work as")
  ) {
    knowledge.push({
      category: "Career",
      fact: message,
    });
  }

  return knowledge;
}