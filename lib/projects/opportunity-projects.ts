export function requirementSkillMatches(requirements: string[], skills: string[]) {
  const text = requirements.join(" ").toLowerCase().replace(/[^a-z0-9+#]+/g, " ");
  return skills.filter(skill => {
    const phrase = skill.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();
    return phrase.length >= 3 && (` ${text} `).includes(` ${phrase} `);
  });
}
