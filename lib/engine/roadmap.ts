export type RoadmapStep = {
  phase: string;
  completed: boolean;
  title: string;
};

export function getRoadmap(journey: string): RoadmapStep[] {
  switch (journey) {
    case "🎓 Scholar":
      return [
        {
          phase: "Foundation",
          completed: true,
          title: "Complete Compass",
        },
        {
          phase: "Foundation",
          completed: false,
          title: "Create a study plan",
        },
        {
          phase: "Growth",
          completed: false,
          title: "Build a valuable skill",
        },
        {
          phase: "Launch",
          completed: false,
          title: "Prepare for internships",
        },
      ];

    case "🚀 Builder":
      return [
        {
          phase: "Foundation",
          completed: true,
          title: "Validate your business idea",
        },
        {
          phase: "Foundation",
          completed: false,
          title: "Interview 10 customers",
        },
        {
          phase: "Growth",
          completed: false,
          title: "Launch your MVP",
        },
        {
          phase: "Scale",
          completed: false,
          title: "Get your first paying customer",
        },
      ];

    case "💼 Leader":
      return [
        {
          phase: "Foundation",
          completed: true,
          title: "Identify your career goals",
        },
        {
          phase: "Growth",
          completed: false,
          title: "Master one high-value skill",
        },
        {
          phase: "Leadership",
          completed: false,
          title: "Lead an important project",
        },
        {
          phase: "Impact",
          completed: false,
          title: "Mentor someone else",
        },
      ];

    default:
      return [
        {
          phase: "Foundation",
          completed: true,
          title: "Complete Compass",
        },
        {
          phase: "Discovery",
          completed: false,
          title: "Explore possible career paths",
        },
        {
          phase: "Growth",
          completed: false,
          title: "Develop one valuable skill",
        },
        {
          phase: "Future",
          completed: false,
          title: "Define your North Star",
        },
      ];
  }
}