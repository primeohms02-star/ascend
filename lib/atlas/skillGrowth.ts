export function getSkillGrowth(journey: string) {
  switch (journey) {
    case "Founder":
      return [
        "Customer Discovery",
        "Product Strategy",
        "Leadership",
      ];

    case "Creator":
      return [
        "Storytelling",
        "Content Creation",
        "Audience Growth",
      ];

    case "Professional":
      return [
        "Communication",
        "Negotiation",
        "Management",
      ];

    case "Student":
      return [
        "Learning",
        "Projects",
        "Critical Thinking",
      ];

    default:
      return [
        "Self Awareness",
        "Consistency",
        "Decision Making",
      ];
  }
}