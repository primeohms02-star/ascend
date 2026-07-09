export type Opportunity = {
  id: string;
  title: string;
  provider: string;
  category:
    | "Scholarship"
    | "Job"
    | "Grant"
    | "Accelerator"
    | "Course"
    | "Competition"
    | "Event";

  score: number;

  description: string;

  url: string;
};

export function getOpportunities(
  journey: string
): Opportunity[] {
  switch (journey) {
    case "Founder":
      return [
        {
          id: "startup-school",
          title: "Startup School",
          provider: "Y Combinator",
          category: "Course",
          score: 98,
          description:
            "Learn how to build and grow your startup from one of the world's leading startup accelerators.",
          url: "https://www.startupschool.org",
        },

        {
          id: "founders-hub",
          title: "Microsoft for Startups Founders Hub",
          provider: "Microsoft",
          category: "Accelerator",
          score: 95,
          description:
            "Access cloud credits, mentorship and startup resources.",
          url: "https://foundershub.startups.microsoft.com",
        },

        {
          id: "google-startups",
          title: "Google for Startups",
          provider: "Google",
          category: "Accelerator",
          score: 92,
          description:
            "Programs and support designed to help startups grow.",
          url: "https://startup.google.com",
        },
      ];

    case "Creator":
      return [
        {
          id: "youtube",
          title: "YouTube Creator Academy",
          provider: "YouTube",
          category: "Course",
          score: 97,
          description:
            "Free learning resources for creators looking to grow.",
          url: "https://creatoracademy.youtube.com",
        },
      ];

    case "Professional":
      return [
        {
          id: "coursera",
          title: "Google Professional Certificates",
          provider: "Coursera",
          category: "Course",
          score: 96,
          description:
            "Industry-recognized professional certificates.",
          url: "https://coursera.org",
        },
      ];

    default:
      return [];
  }
}