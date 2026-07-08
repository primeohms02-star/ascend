export type DailyMission = {
  title: string;
  description: string;
};

export function getDailyMission(journey: string): DailyMission {
  switch (journey) {
    case "🎓 Scholar":
      return {
        title: "Deep Study",
        description:
          "Spend one uninterrupted hour studying your most important subject.",
      };

    case "🌱 Explorer":
      return {
        title: "Career Move",
        description:
          "Apply for one internship, graduate role, or networking opportunity.",
      };

    case "💼 Leader":
      return {
        title: "Level Up",
        description:
          "Learn one new professional skill that moves your career forward.",
      };

    case "🚀 Builder":
      return {
        title: "Customer First",
        description:
          "Speak with one potential customer and learn about their biggest problem.",
      };

    case "🌍 Pioneer":
      return {
        title: "Transition",
        description:
          "Spend one focused hour learning the skills needed for your new career.",
      };

    default:
      return {
        title: "Explore",
        description:
          "Discover one new opportunity that excites you today.",
      };
  }
}