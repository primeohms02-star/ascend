export type JourneyProfile = {
  title: string;
  northStar: string;
  mission: string;
  progress: number;
};

export function getJourneyProfile(firstAnswer: string): JourneyProfile {
  switch (firstAnswer) {
    case "I'm a Student":
      return {
        title: "🎓 Scholar",
        northStar:
          "Become an exceptional graduate and build a strong foundation for your future.",
        mission:
          "Complete one focused study session today.",
        progress: 25,
      };

    case "I Recently Graduated":
      return {
        title: "🌱 Explorer",
        northStar:
          "Launch a meaningful career that aligns with your strengths.",
        mission:
          "Apply for one internship or job opportunity today.",
        progress: 25,
      };

    case "I'm Employed":
      return {
        title: "💼 Leader",
        northStar:
          "Grow into a leader and maximize your professional impact.",
        mission:
          "Learn one valuable skill that advances your career.",
        progress: 25,
      };

    case "I'm Building a Business":
      return {
        title: "🚀 Builder",
        northStar:
          "Build a profitable business that creates lasting value.",
        mission:
          "Speak with one potential customer today.",
        progress: 25,
      };

    case "I'm Changing Careers":
      return {
        title: "🌍 Pioneer",
        northStar:
          "Successfully transition into a career you genuinely enjoy.",
        mission:
          "Spend one hour learning your new field today.",
        progress: 25,
      };

    default:
      return {
        title: "✨ Pathfinder",
        northStar:
          "Discover a direction that matches your talents and ambitions.",
        mission:
          "Explore one new opportunity today.",
        progress: 25,
      };
  }
}