export type Recommendation = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  action: string;
};

export function getRecommendations(
  journey: string
): Recommendation[] {
  switch (journey) {
    case "Founder":
      return [
        {
          id: "validate",
          title: "Talk to 3 potential customers",
          description:
            "Before building more, validate your idea with real people.",
          priority: "high",
          category: "Validation",
          action: "Start Interviews",
        },
        {
          id: "landing-page",
          title: "Create a landing page",
          description:
            "Build a simple landing page to collect emails and test demand.",
          priority: "medium",
          category: "Marketing",
          action: "Build Landing Page",
        },
        {
          id: "mvp",
          title: "Build your MVP",
          description:
            "Focus only on the smallest version that solves the core problem.",
          priority: "high",
          category: "Product",
          action: "Build MVP",
        },
      ];

    case "Creator":
      return [
        {
          id: "publish",
          title: "Publish one valuable post",
          description:
            "Consistency compounds. Create something useful today.",
          priority: "high",
          category: "Content",
          action: "Create Post",
        },
        {
          id: "portfolio",
          title: "Improve your portfolio",
          description:
            "Update your best work so opportunities can find you.",
          priority: "medium",
          category: "Portfolio",
          action: "Update Portfolio",
        },
        {
          id: "audience",
          title: "Engage with your audience",
          description:
            "Reply to comments and build relationships with your community.",
          priority: "low",
          category: "Community",
          action: "Engage Audience",
        },
      ];

    case "Professional":
      return [
        {
          id: "skill",
          title: "Learn one new skill",
          description:
            "Spend 45 minutes improving a skill that moves your career forward.",
          priority: "high",
          category: "Learning",
          action: "Start Learning",
        },
        {
          id: "network",
          title: "Reach out to one new connection",
          description:
            "Opportunities often come from conversations.",
          priority: "medium",
          category: "Networking",
          action: "Send Message",
        },
        {
          id: "resume",
          title: "Refresh your resume",
          description:
            "Keep your resume and LinkedIn profile current.",
          priority: "low",
          category: "Career",
          action: "Update Resume",
        },
      ];

    case "Student":
      return [
        {
          id: "study",
          title: "Complete one deep study session",
          description:
            "Spend at least one uninterrupted hour learning.",
          priority: "high",
          category: "Learning",
          action: "Study Now",
        },
        {
          id: "project",
          title: "Work on a personal project",
          description:
            "Projects teach more than passive learning.",
          priority: "medium",
          category: "Projects",
          action: "Continue Project",
        },
        {
          id: "mentor",
          title: "Ask a mentor one question",
          description:
            "Accelerate your growth by learning from someone ahead of you.",
          priority: "low",
          category: "Mentorship",
          action: "Contact Mentor",
        },
      ];

    default:
      return [
        {
          id: "north-star",
          title: "Reconnect with your North Star",
          description:
            "Take a few minutes to remember why you started this journey.",
          priority: "high",
          category: "Reflection",
          action: "Reflect",
        },
      ];
  }
}