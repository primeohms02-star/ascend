type Mission = {
  title: string;
  description: string;
};

export function generateMission(
  journey: string,
  completedSteps: number
): Mission {
  const j = journey.toLowerCase();

  // SOFTWARE
  if (j.includes("software") || j.includes("developer")) {
    const missions: Mission[] = [
      {
        title: "Master Your Craft",
        description:
          "Spend 30 minutes writing code without using AI assistance.",
      },
      {
        title: "Build Something Small",
        description:
          "Create one feature or component that solves a real problem.",
      },
      {
        title: "Study Great Engineers",
        description:
          "Read about how a senior engineer solved a difficult problem.",
      },
    ];

    return missions[
      Math.min(completedSteps, missions.length - 1)
    ];
  }

  // BUSINESS
  if (
    j.includes("business") ||
    j.includes("entrepreneur")
  ) {
    const missions: Mission[] = [
      {
        title: "Find One Customer",
        description:
          "Talk to one real customer and learn about their biggest problem.",
      },
      {
        title: "Improve Your Product",
        description:
          "Spend one hour making your product better.",
      },
      {
        title: "Sell",
        description:
          "Make one offer today. Action beats planning.",
      },
    ];

    return missions[
      Math.min(completedSteps, missions.length - 1)
    ];
  }

  // FITNESS
  if (
    j.includes("fitness") ||
    j.includes("health") ||
    j.includes("gym")
  ) {
    const missions: Mission[] = [
      {
        title: "Move",
        description:
          "Exercise for at least 30 minutes today.",
      },
      {
        title: "Fuel",
        description:
          "Eat only meals that move you toward your goal today.",
      },
      {
        title: "Recover",
        description:
          "Sleep at least 8 hours tonight.",
      },
    ];

    return missions[
      Math.min(completedSteps, missions.length - 1)
    ];
  }

  // DEFAULT
  const missions: Mission[] = [
    {
      title: "Build Momentum",
      description:
        "Take one meaningful action that moves you toward your North Star.",
    },
    {
      title: "Deep Work",
      description:
        "Work without distractions for one uninterrupted hour.",
    },
    {
      title: "Reflect",
      description:
        "Write down one lesson you learned today.",
    },
  ];

  return missions[
    Math.min(completedSteps, missions.length - 1)
  ];
}