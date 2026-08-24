import type { Opportunity } from "./types";
import {
  analyzeOpportunityDeadline,
  type OpportunityDeadlineAnalysis,
} from "./deadline";

export type AtlasInsight = {
  score: number;
  level: string;
  growth: string;
  strengths: string[];
  considerations: string[];
  bestFor: string[];
  nextStep: string;
};

const GROWTH_KEYWORDS = [
  "mentorship",
  "mentor",
  "training",
  "learning",
  "development",
  "leadership",
  "ownership",
  "strategy",
  "innovation",
  "collaboration",
  "cross-functional",
  "career growth",
  "professional development",
  "certification",
  "management",
];

const EXPERIENCE_KEYWORDS = [
  "entry level",
  "entry-level",
  "graduate",
  "intern",
  "internship",
  "junior",
  "associate",
  "mid-level",
  "senior",
  "lead",
  "manager",
  "director",
];

const RISK_KEYWORDS = [
  "commission only",
  "commission-only",
  "unpaid",
  "volunteer",
  "temporary",
  "short-term contract",
];

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function createSearchableText(opportunity: Opportunity): string {
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

function countKeywordMatches(
  text: string,
  keywords: string[]
): number {
  return keywords.filter((keyword) =>
    text.includes(keyword)
  ).length;
}

function getOpportunityLabel(score: number): string {
  if (score >= 90) {
    return "Outstanding Opportunity";
  }

  if (score >= 80) {
    return "Excellent Opportunity";
  }

  if (score >= 70) {
    return "Strong Opportunity";
  }

  if (score >= 60) {
    return "Promising Opportunity";
  }

  if (score >= 45) {
    return "Consider Carefully";
  }

  return "Limited Information";
}

function getGrowthLevel(
  growthSignals: number,
  tagCount: number,
  descriptionLength: number
): string {
  if (
    growthSignals >= 4 ||
    (growthSignals >= 3 && tagCount >= 5)
  ) {
    return "High";
  }

  if (
    growthSignals >= 2 ||
    tagCount >= 4 ||
    descriptionLength >= 900
  ) {
    return "Moderate";
  }

  return "Limited";
}

function buildBestFor(
  opportunity: Opportunity,
  searchableText: string
): string[] {
  const bestFor: string[] = [];

  const category = normalize(opportunity.category);

  if (
    searchableText.includes("entry level") ||
    searchableText.includes("entry-level") ||
    searchableText.includes("graduate") ||
    searchableText.includes("junior")
  ) {
    bestFor.push(
      "Recent graduates and early-career professionals."
    );
  }

  if (
    searchableText.includes("intern") ||
    category.includes("intern")
  ) {
    bestFor.push(
      "People seeking practical industry experience."
    );
  }

  if (
    searchableText.includes("senior") ||
    searchableText.includes("lead") ||
    searchableText.includes("manager")
  ) {
    bestFor.push(
      "Experienced professionals ready for greater responsibility."
    );
  }

  if (opportunity.remote) {
    bestFor.push(
      "People who value location flexibility and remote work."
    );
  }

  if (
    category === "job" ||
    category.includes("employment") ||
    category.includes("career")
  ) {
    bestFor.push(
      "Job seekers pursuing long-term career progression."
    );
  }

  if (
    category.includes("internship") ||
    category.includes("fellowship")
  ) {
    bestFor.push(
      "People building experience, networks, and career direction."
    );
  }

  if (
    category.includes("course") ||
    category.includes("training") ||
    category.includes("certification")
  ) {
    bestFor.push(
      "Learners developing new professional capabilities."
    );
  }

  if (
    category.includes("competition") ||
    category.includes("hackathon")
  ) {
    bestFor.push(
      "People who want to demonstrate their skills through practical challenges."
    );
  }

  if (
    category.includes("grant") ||
    category.includes("funding")
  ) {
    bestFor.push(
      "Builders and founders seeking financial support."
    );
  }

  if (opportunity.tags.length > 0) {
    const featuredSkills = opportunity.tags
      .slice(0, 3)
      .join(", ");

    bestFor.push(
      `People interested in ${featuredSkills}.`
    );
  }

  if (bestFor.length === 0) {
    bestFor.push(
      "Professionals exploring credible career opportunities."
    );
  }

  return unique(bestFor).slice(0, 4);
}

function buildNextStep({
  score,
  deadline,
  hasDescription,
  hasSalary,
  opportunity,
}: {
  score: number;
  deadline: OpportunityDeadlineAnalysis;
  hasDescription: boolean;
  hasSalary: boolean;
  opportunity: Opportunity;
}): string {
  if (deadline.status === "expired") {
    return "The listed deadline appears to have passed. Check the original posting to confirm whether applications are still being accepted.";
  }

  if (!hasDescription) {
    return "Open the original posting and verify the responsibilities, requirements, compensation, and application conditions before deciding whether to apply.";
  }

  if (
    deadline.status === "urgent" &&
    deadline.daysRemaining !== undefined
  ) {
    const dayLabel =
      deadline.daysRemaining === 1 ? "day" : "days";

    return `The deadline is close, with approximately ${deadline.daysRemaining} ${dayLabel} remaining. Confirm your eligibility, tailor your resume to the strongest requirements, and apply promptly if the opportunity supports your direction.`;
  }

  if (score >= 80) {
    return "Compare the requirements with your strongest skills, tailor your resume around the closest matches, and prepare a focused application that explains why this opportunity fits your career direction.";
  }

  if (score >= 65) {
    return "Review the requirements carefully, identify any important skill gaps, and apply if the role supports the experience and direction you want to build.";
  }

  if (!hasSalary && normalize(opportunity.category) === "job") {
    return "Review the original posting for compensation, employment terms, and detailed requirements before investing significant time in the application.";
  }

  return "Investigate the original posting, verify the opportunity details, and compare its requirements with your current skills and career priorities before proceeding.";
}

export function generateAtlasInsight(
  opportunity: Opportunity
): AtlasInsight {
  let score = 50;

  const strengths: string[] = [];
  const considerations: string[] = [];

  const tags = opportunity.tags ?? [];
  const description = opportunity.description?.trim() ?? "";
  const company = opportunity.company?.trim() ?? "";
  const location = opportunity.location?.trim() ?? "";
  const salary = opportunity.salary?.trim() ?? "";
  const category = opportunity.category?.trim() ?? "";
  const url = opportunity.url?.trim() ?? "";

  const searchableText = createSearchableText({
    ...opportunity,
    tags,
  });

  const deadline = analyzeOpportunityDeadline(opportunity.deadline);

  /*
   * Description quality
   */

  if (description.length >= 1_200) {
    score += 12;

    strengths.push(
      "Provides a detailed description for evaluating the opportunity."
    );
  } else if (description.length >= 600) {
    score += 9;

    strengths.push(
      "Provides enough detail to understand the opportunity."
    );
  } else if (description.length >= 250) {
    score += 5;

    strengths.push(
      "Includes a useful overview of the opportunity."
    );
  } else if (description.length > 0) {
    score -= 2;

    considerations.push(
      "The description is brief, so some important details may require further research."
    );
  } else {
    score -= 10;

    considerations.push(
      "No detailed description is currently available."
    );
  }

  /*
   * Company transparency
   */

  const unknownCompanyNames = [
    "unknown",
    "confidential",
    "not specified",
    "n/a",
  ];

  if (
    company.length >= 2 &&
    !unknownCompanyNames.includes(normalize(company))
  ) {
    score += 5;

    strengths.push(
      `The organization is clearly identified as ${company}.`
    );
  } else {
    score -= 5;

    considerations.push(
      "The organization behind this opportunity is not clearly identified."
    );
  }

  /*
   * Skills and tags
   */

  if (tags.length >= 6) {
    score += 10;

    strengths.push(
      "Identifies a broad set of relevant skills and professional capabilities."
    );
  } else if (tags.length >= 3) {
    score += 7;

    strengths.push(
      "Identifies several useful skills connected to the opportunity."
    );
  } else if (tags.length >= 1) {
    score += 3;

    considerations.push(
      "Only a small number of skills are currently identified."
    );
  } else {
    score -= 6;

    considerations.push(
      "No clear skill information is currently available."
    );
  }

  /*
   * Work arrangement and location
   */

  if (opportunity.remote) {
    score += 4;

    strengths.push(
      "Offers remote work flexibility."
    );
  } else if (location) {
    score += 2;

    strengths.push(
      `Provides a defined work location: ${location}.`
    );

    considerations.push(
      "Confirm that the location and work arrangement are practical for you."
    );
  } else {
    score -= 3;

    considerations.push(
      "The work location or arrangement is not clearly specified."
    );
  }

  /*
   * Compensation transparency
   */

  if (salary) {
    score += 7;

    strengths.push(
      `Compensation information is provided: ${salary}.`
    );
  } else if (normalize(category) === "job") {
    score -= 3;

    considerations.push(
      "Compensation information is not currently provided."
    );
  }

  /*
   * Category and original source
   */

  if (category) {
    score += 3;

    strengths.push(
      `The opportunity is classified as ${category}.`
    );
  } else {
    considerations.push(
      "The opportunity type has not been clearly classified."
    );
  }

  if (url) {
    score += 3;
  } else {
    score -= 6;

    considerations.push(
      "No original posting link is currently available for verification."
    );
  }

  /*
   * Deadline analysis
   */

  switch (deadline.status) {
    case "expired":
      score -= 30;

      considerations.push(
        "The listed application deadline appears to have passed."
      );
      break;

    case "urgent": {
      score -= 2;

      const days = deadline.daysRemaining ?? 0;
      const dayLabel = days === 1 ? "day" : "days";

      considerations.push(
        `The deadline is close, with approximately ${days} ${dayLabel} remaining.`
      );
      break;
    }

    case "soon":
      considerations.push(
        `The application deadline is within approximately ${deadline.daysRemaining} days.`
      );
      break;

    case "open":
      strengths.push(
        "There appears to be sufficient time to prepare a considered application."
      );
      break;

    case "invalid":
      considerations.push(
        "The listed deadline could not be verified."
      );
      break;

    case "none":
      considerations.push(
        "No application deadline is currently listed."
      );
      break;
  }

  /*
   * Career-growth signals
   */

  const growthSignals = countKeywordMatches(
    searchableText,
    GROWTH_KEYWORDS
  );

  if (growthSignals >= 4) {
    score += 9;

    strengths.push(
      "Shows strong signals of learning, responsibility, and career development."
    );
  } else if (growthSignals >= 2) {
    score += 6;

    strengths.push(
      "Contains meaningful signs of professional growth and skill development."
    );
  } else if (growthSignals === 1) {
    score += 2;

    strengths.push(
      "Contains at least one clear professional-development signal."
    );
  } else {
    considerations.push(
      "Career-development opportunities are not clearly explained."
    );
  }

  /*
   * Experience-level clarity
   */

  const experienceSignals = countKeywordMatches(
    searchableText,
    EXPERIENCE_KEYWORDS
  );

  if (experienceSignals > 0) {
    score += 3;

    strengths.push(
      "Provides signals about the intended career or experience level."
    );
  } else {
    considerations.push(
      "The expected experience level is not immediately clear."
    );
  }

  /*
   * Potential risk signals
   */

  const detectedRisks = RISK_KEYWORDS.filter((keyword) =>
    searchableText.includes(keyword)
  );

  if (detectedRisks.length > 0) {
    score -= Math.min(detectedRisks.length * 3, 9);

    considerations.push(
      "Review the employment or participation terms carefully before committing."
    );
  }

  const finalScore = clampScore(score);

  if (strengths.length === 0) {
    strengths.push(
      "The opportunity may still be worth investigating through its original posting."
    );
  }

  const growth = getGrowthLevel(
    growthSignals,
    tags.length,
    description.length
  );

  const bestFor = buildBestFor(
    {
      ...opportunity,
      tags,
    },
    searchableText
  );

  const nextStep = buildNextStep({
    score: finalScore,
    deadline,
    hasDescription: description.length > 0,
    hasSalary: salary.length > 0,
    opportunity,
  });

  return {
    score: finalScore,
    level: getOpportunityLabel(finalScore),
    growth,
    strengths: unique(strengths).slice(0, 6),
    considerations: unique(considerations).slice(0, 6),
    bestFor,
    nextStep,
  };
}
