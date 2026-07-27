import type { Opportunity } from "./types";
import type { AtlasInsight } from "./insight";

export type ActionPriority = "High" | "Medium" | "Low";

export type ActionPlanItem = {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
};

export type SkillAssessment = {
  identifiedSkills: string[];
  strengths: string[];
  gapsToReview: string[];
};

export type AtlasActionPlan = {
  readinessScore: number;
  readinessLevel: string;
  summary: string;
  applicationSteps: ActionPlanItem[];
  skillAssessment: SkillAssessment;
  resumeActions: ActionPlanItem[];
  interviewActions: ActionPlanItem[];
  learningActions: ActionPlanItem[];
};

const TECHNICAL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "python",
  "java",
  "sql",
  "aws",
  "azure",
  "cloud",
  "data",
  "analytics",
  "machine learning",
  "artificial intelligence",
  "cybersecurity",
  "design",
  "marketing",
  "finance",
  "research",
  "project management",
];

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function createSearchableText(
  opportunity: Opportunity
): string {
  return [
    opportunity.title,
    opportunity.company,
    opportunity.description,
    opportunity.category,
    opportunity.location,
    opportunity.salary,
    ...opportunity.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function createItem(
  id: string,
  title: string,
  description: string,
  priority: ActionPriority
): ActionPlanItem {
  return {
    id,
    title,
    description,
    priority,
  };
}

function getReadinessLevel(score: number): string {
  if (score >= 85) {
    return "Ready to Apply";
  }

  if (score >= 70) {
    return "Nearly Ready";
  }

  if (score >= 55) {
    return "Preparation Needed";
  }

  return "Research First";
}

function buildApplicationSteps(
  opportunity: Opportunity,
  insight: AtlasInsight
): ActionPlanItem[] {
  const steps: ActionPlanItem[] = [];

  steps.push(
    createItem(
      "review-requirements",
      "Review every requirement",
      "Separate the listed requirements into skills you already have, skills you can demonstrate, and gaps that require preparation.",
      "High"
    )
  );

  steps.push(
    createItem(
      "research-company",
      `Research ${opportunity.company}`,
      "Review the organization’s mission, current work, values, reputation, and the problems this opportunity may help it solve.",
      "High"
    )
  );

  steps.push(
    createItem(
      "tailor-resume",
      "Tailor your resume",
      `Connect your strongest experience directly to the responsibilities and skills required for the ${opportunity.title} opportunity.`,
      "High"
    )
  );

  if (opportunity.deadline) {
    steps.push(
      createItem(
        "confirm-deadline",
        "Confirm the application deadline",
        `Verify that ${opportunity.deadline} is still accurate on the original posting and plan your submission time accordingly.`,
        "High"
      )
    );
  } else {
    steps.push(
      createItem(
        "find-deadline",
        "Confirm the application timeline",
        "The deadline is not clearly listed. Check the original posting before investing significant time in the application.",
        "Medium"
      )
    );
  }

  if (!opportunity.salary) {
    steps.push(
      createItem(
        "research-compensation",
        "Research expected compensation",
        "Investigate the likely salary or reward range so you can judge whether the opportunity matches your expectations.",
        "Medium"
      )
    );
  }

  if (insight.score >= 70) {
    steps.push(
      createItem(
        "prepare-application",
        "Prepare a focused application",
        "Build an application that clearly explains your relevant value, evidence of your abilities, and interest in this specific opportunity.",
        "High"
      )
    );
  } else {
    steps.push(
      createItem(
        "verify-fit",
        "Verify the opportunity before applying",
        "Resolve the key concerns Atlas identified and confirm that the opportunity deserves your time before preparing a full application.",
        "High"
      )
    );
  }

  return steps;
}

function buildSkillAssessment(
  opportunity: Opportunity,
  searchableText: string
): SkillAssessment {
  const tagSkills = opportunity.tags
    .map((tag) => tag.trim())
    .filter(Boolean);

  const detectedSkills = TECHNICAL_KEYWORDS.filter(
    (keyword) => searchableText.includes(keyword)
  );

  const identifiedSkills = unique([
    ...tagSkills,
    ...detectedSkills,
  ]).slice(0, 12);

  const strengths =
    identifiedSkills.length > 0
      ? identifiedSkills.slice(0, 5)
      : ["Transferable professional experience"];

  const gapsToReview: string[] = [];

  if (identifiedSkills.length < 3) {
    gapsToReview.push(
      "The posting provides limited skill information. Review the original requirements carefully."
    );
  }

  if (!searchableText.includes("communication")) {
    gapsToReview.push(
      "Confirm the level of written and verbal communication expected."
    );
  }

  if (
    !searchableText.includes("experience") &&
    !searchableText.includes("year")
  ) {
    gapsToReview.push(
      "Confirm the required experience level before applying."
    );
  }

  if (
    !searchableText.includes("degree") &&
    !searchableText.includes("education")
  ) {
    gapsToReview.push(
      "Check whether the employer has education or certification requirements."
    );
  }

  return {
    identifiedSkills,
    strengths,
    gapsToReview: gapsToReview.slice(0, 4),
  };
}

function buildResumeActions(
  opportunity: Opportunity
): ActionPlanItem[] {
  const featuredSkills = opportunity.tags
    .slice(0, 4)
    .join(", ");

  return [
    createItem(
      "resume-headline",
      "Align your professional headline",
      `Adjust your resume headline or summary so it clearly supports the ${opportunity.title} direction.`,
      "High"
    ),

    createItem(
      "resume-skills",
      "Prioritize relevant skills",
      featuredSkills
        ? `Make evidence of ${featuredSkills} easy to find without copying unsupported keywords into your resume.`
        : "Identify the most important skills in the original posting and make genuine evidence of those skills easy to find.",
      "High"
    ),

    createItem(
      "resume-achievements",
      "Strengthen achievement statements",
      "Replace vague responsibility statements with results, measurable outcomes, improvements, or evidence of impact.",
      "High"
    ),

    createItem(
      "resume-proof",
      "Add evidence of your ability",
      "Include relevant projects, work samples, certifications, portfolio links, or accomplishments that support your claims.",
      "Medium"
    ),

    createItem(
      "resume-review",
      "Complete a final quality review",
      "Check spelling, dates, formatting, contact information, links, and consistency before submitting.",
      "Medium"
    ),
  ];
}

function buildInterviewActions(
  opportunity: Opportunity
): ActionPlanItem[] {
  return [
    createItem(
      "interview-introduction",
      "Prepare your professional introduction",
      `Create a concise answer explaining your background, strengths, and interest in the ${opportunity.title} opportunity.`,
      "High"
    ),

    createItem(
      "interview-examples",
      "Prepare evidence-based examples",
      "Develop at least three examples showing how you solved problems, worked with others, learned quickly, or delivered meaningful results.",
      "High"
    ),

    createItem(
      "interview-company",
      "Connect your goals to the organization",
      `Be ready to explain why ${opportunity.company} interests you and how the opportunity supports your career direction.`,
      "High"
    ),

    createItem(
      "interview-questions",
      "Prepare thoughtful questions",
      "Ask about expectations, success measures, team culture, growth opportunities, challenges, and the next stage of the process.",
      "Medium"
    ),

    createItem(
      "interview-practice",
      "Practise your responses",
      "Rehearse aloud and improve answers that sound unclear, overly long, unsupported, or disconnected from the role.",
      "Medium"
    ),
  ];
}

function buildLearningActions(
  opportunity: Opportunity
): ActionPlanItem[] {
  const learningActions: ActionPlanItem[] = [];

  const prioritySkills = opportunity.tags.slice(0, 3);

  if (prioritySkills.length > 0) {
    prioritySkills.forEach((skill, index) => {
      learningActions.push(
        createItem(
          `learn-${index + 1}`,
          `Strengthen ${skill}`,
          `Review the fundamentals of ${skill} and complete a small practical exercise that gives you evidence you can discuss or show.`,
          index === 0 ? "High" : "Medium"
        )
      );
    });
  } else {
    learningActions.push(
      createItem(
        "identify-learning-gaps",
        "Identify the most important skill gap",
        "Review the original requirements, select the skill most likely to affect your application, and create a short improvement plan.",
        "High"
      )
    );
  }

  learningActions.push(
    createItem(
      "learning-proof",
      "Create proof of learning",
      "Turn your preparation into something demonstrable, such as a project, case study, writing sample, portfolio update, or certification.",
      "Medium"
    )
  );

  return learningActions;
}

export function generateAtlasActionPlan(
  opportunity: Opportunity,
  insight: AtlasInsight
): AtlasActionPlan {
  const searchableText =
    createSearchableText(opportunity);

  let readinessScore = insight.score;

  if (opportunity.description?.trim()) {
    readinessScore += 4;
  }

  if (opportunity.tags.length >= 3) {
    readinessScore += 4;
  }

  if (opportunity.url) {
    readinessScore += 2;
  }

  if (!opportunity.salary) {
    readinessScore -= 2;
  }

  if (!opportunity.deadline) {
    readinessScore -= 2;
  }

  readinessScore = clampScore(readinessScore);

  const readinessLevel =
    getReadinessLevel(readinessScore);

  const summary =
    readinessScore >= 70
      ? `You have enough information to begin preparing a focused application for ${opportunity.title}. Complete the high-priority actions before submitting.`
      : `More preparation is needed before committing to ${opportunity.title}. Resolve the high-priority research and skills questions first.`;

  return {
    readinessScore,
    readinessLevel,
    summary,

    applicationSteps: buildApplicationSteps(
      opportunity,
      insight
    ),

    skillAssessment: buildSkillAssessment(
      opportunity,
      searchableText
    ),

    resumeActions: buildResumeActions(opportunity),

    interviewActions:
      buildInterviewActions(opportunity),

    learningActions:
      buildLearningActions(opportunity),
  };
}