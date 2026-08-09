export type Recommendation = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  action: string;
  href: string;
};

export function getRecommendations(
  journey: string
): Recommendation[] {
  switch (journey) {
    case "Founder":
      return [
        {
          id: "validate",
          title: "Talk to 3 Potential Customers",
          description:
            "Before building more, validate your idea with real people.",
          priority: "high",
          category: "Validation",
          action: "Start Interviews",
          href: "#opportunities",
        },
        {
          id: "landing-page",
          title: "Create a Landing Page",
          description:
            "Build a simple landing page to collect emails and test demand.",
          priority: "medium",
          category: "Marketing",
          action: "Build Landing Page",
          href: "#mission",
        },
        {
          id: "mvp",
          title: "Build Your MVP",
          description:
            "Focus only on the smallest version that solves the core problem.",
          priority: "high",
          category: "Product",
          action: "Build MVP",
          href: "#mission",
        },
      ];

    case "Creator":
      return [
        {
          id: "publish",
          title: "Publish One Valuable Post",
          description:
            "Consistency compounds. Create something useful today.",
          priority: "high",
          category: "Content",
          action: "Create Post",
          href: "#mission",
        },
        {
          id: "portfolio",
          title: "Improve Your Portfolio",
          description:
            "Update your best work so opportunities can find you.",
          priority: "medium",
          category: "Portfolio",
          action: "Update Portfolio",
          href: "#opportunities",
        },
        {
          id: "audience",
          title: "Engage With Your Audience",
          description:
            "Reply to comments and build relationships with your community.",
          priority: "low",
          category: "Community",
          action: "Engage Audience",
          href: "#opportunities",
        },
      ];

    case "Professional":
      return [
        {
          id: "skill",
          title: "Learn One New Skill",
          description:
            "Spend 45 minutes improving a skill that moves your career forward.",
          priority: "high",
          category: "Learning",
          action: "Start Learning",
          href: "#mission",
        },
        {
          id: "network",
          title: "Reach Out to One New Connection",
          description:
            "Opportunities often come from conversations.",
          priority: "medium",
          category: "Networking",
          action: "Send Message",
          href: "#opportunities",
        },
        {
          id: "resume",
          title: "Refresh Your Resume",
          description:
            "Keep your resume and LinkedIn profile current.",
          priority: "low",
          category: "Career",
          action: "Update Resume",
          href: "#mission",
        },
      ];

    case "Student":
      return [
        {
          id: "study",
          title: "Complete One Deep Study Session",
          description:
            "Spend at least one uninterrupted hour learning.",
          priority: "high",
          category: "Learning",
          action: "Study Now",
          href: "#mission",
        },
        {
          id: "project",
          title: "Work on a Personal Project",
          description:
            "Projects teach more than passive learning.",
          priority: "medium",
          category: "Projects",
          action: "Continue Project",
          href: "#mission",
        },
        {
          id: "mentor",
          title: "Ask a Mentor One Question",
          description:
            "Accelerate your growth by learning from someone ahead of you.",
          priority: "low",
          category: "Mentorship",
          action: "Contact Mentor",
          href: "#opportunities",
        },
      ];

    default:
      return [
        {
          id: "north-star",
          title: "Reconnect with Your North Star",
          description:
            "Take a few minutes to remember why you started this journey.",
          priority: "high",
          category: "Reflection",
          action: "Reflect",
          href: "#compass",
        },
      ];
  }
}