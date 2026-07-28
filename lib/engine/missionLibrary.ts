export type MissionTemplate = {
  title: string;

  description: string;
};

export type MissionPath =
  | "Explorer"
  | "Scholar"
  | "Builder"
  | "Leader"
  | "Pioneer"
  | "Creator"
  | "Freelancer"
  | "Impact";

export const MissionLibrary: Record<
  MissionPath,
  MissionTemplate[]
> = {
  Explorer: [
    {
      title:
        "Opportunity Shortlist",

      description:
        "Find three opportunities aligned with your North Star, compare their requirements, and save the strongest match.",
    },
    {
      title:
        "Career Evidence",

      description:
        "Improve one section of your resume or portfolio using evidence from a real project, achievement or responsibility.",
    },
    {
      title:
        "Professional Conversation",

      description:
        "Contact one professional whose path interests you and ask one focused question about entering or growing in their field.",
    },
    {
      title:
        "Role Requirements Map",

      description:
        "Choose one target role and list its five most common skills or experience requirements.",
    },
    {
      title:
        "Application Progress",

      description:
        "Choose one relevant opportunity and complete a tailored first draft of your application.",
    },
  ],

  Scholar: [
    {
      title:
        "Scholarship Shortlist",

      description:
        "Find three scholarships or fellowships aligned with your academic direction and create a requirement checklist for the strongest one.",
    },
    {
      title:
        "Focused Learning Session",

      description:
        "Complete one uninterrupted learning session on the skill or subject most important to your North Star, then record what you learned.",
    },
    {
      title:
        "Academic Evidence",

      description:
        "Improve one piece of academic evidence today: a research summary, personal statement, project, writing sample or portfolio entry.",
    },
    {
      title:
        "Research Direction",

      description:
        "Write one clear research or learning question connected to your North Star and identify three credible resources that can help answer it.",
    },
    {
      title:
        "Application Foundation",

      description:
        "Draft one paragraph explaining your academic direction, relevant experience and the impact you want to create.",
    },
  ],

  Builder: [
    {
      title:
        "Customer Discovery",

      description:
        "Speak with one potential customer and ask focused questions about the problem you want your business to solve.",
    },
    {
      title:
        "Problem Definition",

      description:
        "Write a one-paragraph definition of your target customer, their most important problem and why existing solutions are insufficient.",
    },
    {
      title:
        "Offer Test",

      description:
        "Create one simple offer for your target customer and present it to one real person for feedback.",
    },
    {
      title:
        "Funding Readiness",

      description:
        "Identify three grants, accelerators or funding programmes aligned with your venture and record their major requirements.",
    },
    {
      title:
        "Minimum Viable Progress",

      description:
        "Build or improve the smallest usable part of your product that demonstrates its core value.",
    },
  ],

  Leader: [
    {
      title:
        "Leadership Evidence",

      description:
        "Take responsibility for one meaningful outcome today and document how your action improved the result for another person or team.",
    },
    {
      title:
        "Strategic Relationship",

      description:
        "Contact one person who could become a valuable mentor, collaborator or professional connection and begin a focused conversation.",
    },
    {
      title:
        "Impact Review",

      description:
        "Review one recent project, identify its strongest result and define one action that would increase its future impact.",
    },
    {
      title:
        "Mentorship Action",

      description:
        "Help one person solve a specific problem by sharing relevant experience, feedback or guidance.",
    },
    {
      title:
        "Next-Level Readiness",

      description:
        "Choose the next position or responsibility you want and identify one visible action that demonstrates your readiness for it.",
    },
  ],

  Pioneer: [
    {
      title:
        "Career Transition Map",

      description:
        "Choose one target role, compare its requirements with your current experience and identify your three most important gaps.",
    },
    {
      title:
        "Transferable Skills",

      description:
        "Write five skills from your existing experience that can create value in your intended career or industry.",
    },
    {
      title:
        "Transition Project",

      description:
        "Define one small project that can demonstrate your ability in the career you want to enter and complete its first meaningful step.",
    },
    {
      title:
        "Industry Conversation",

      description:
        "Contact one person working in your target industry and ask one specific question about making a successful transition.",
    },
    {
      title:
        "Learning Priority",

      description:
        "Identify the highest-priority skill for your intended career and complete one focused learning session on it.",
    },
  ],

  Creator: [
    {
      title:
        "Publish Useful Work",

      description:
        "Create and publish one useful piece of work that solves a real audience problem connected to your direction.",
    },
    {
      title:
        "Portfolio Improvement",

      description:
        "Improve one portfolio piece so it communicates the problem, your creative process and the result more clearly.",
    },
    {
      title:
        "Audience Insight",

      description:
        "Speak with or study five people in your intended audience and record one recurring need you can address through your work.",
    },
    {
      title:
        "Creative Opportunity",

      description:
        "Find three competitions, grants, collaborations or commissions aligned with your creative direction and save the strongest match.",
    },
    {
      title:
        "Distribution Practice",

      description:
        "Share one valuable piece of work through the channel most likely to reach your intended audience and record the response.",
    },
  ],

  Freelancer: [
    {
      title:
        "Define Your Offer",

      description:
        "Write one clear freelance offer describing the client, their problem, your service and the result you provide.",
    },
    {
      title:
        "Client Outreach",

      description:
        "Identify three potential clients and send one thoughtful message offering help with a specific problem.",
    },
    {
      title:
        "Proof of Work",

      description:
        "Create or improve one portfolio example that demonstrates the result your freelance service can deliver.",
    },
    {
      title:
        "Market Research",

      description:
        "Review five professionals offering a similar service and identify one way to make your positioning clearer or more valuable.",
    },
    {
      title:
        "Testimonial Progress",

      description:
        "Contact one previous client, collaborator or colleague and request specific feedback about the value of your work.",
    },
  ],

  Impact: [
    {
      title:
        "Impact Problem Map",

      description:
        "Define one community or development problem, the people affected and the measurable change you want to create.",
    },
    {
      title:
        "Funding Opportunity",

      description:
        "Find three grants, fellowships or programmes aligned with your impact direction and create a checklist for the strongest one.",
    },
    {
      title:
        "Stakeholder Conversation",

      description:
        "Speak with one person directly affected by the problem you want to solve and record what you learned.",
    },
    {
      title:
        "Impact Evidence",

      description:
        "Document one concrete result from your work and explain why it matters to the people or community you serve.",
    },
    {
      title:
        "Partnership Progress",

      description:
        "Identify one organization or person whose work complements yours and send a focused collaboration message.",
    },
  ],
};