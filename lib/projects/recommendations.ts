// Explainable matching to a saved direction. No inferred readiness or score.
export function directionMatches(direction: string, project: {category:string;title:string;skills:string[]}) {
  const words = new Set(direction.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  const topic = `${project.category} ${project.title} ${project.skills.join(" ")}`.toLowerCase();
  const ignored = new Set(["want","build","learn","work","with","that","this","become","career","student","project","skills"]);
  return [...words].filter(word=>!ignored.has(word)&&new RegExp(`\\b${word.replace(/s$/,"")}s?\\b`).test(topic));
}
