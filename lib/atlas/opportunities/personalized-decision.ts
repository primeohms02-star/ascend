import { generateAtlasActionPlan } from "./action-plan";
import { buildOpportunityProfile } from "./build-profile";
import { enrichOpportunityFromOriginalSource } from "./detail-enrichment";
import { generateAtlasInsight, type AtlasInsight } from "./insight";
import { rankOpportunities } from "./intelligence";
import { getOpportunityStatus } from "./memory";
import type { Opportunity, RankedOpportunity } from "./types";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function decisionLevel(score: number): string {
  if (score >= 85) return "Highly Aligned";
  if (score >= 72) return "Strong Fit";
  if (score >= 58) return "Worth Considering";
  if (score >= 42) return "Consider Carefully";
  return "Low Alignment";
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

export type PersonalizedDecisionSignals = {
  careerGoal: string;
  matchedSkills: string[];
  matchedIndustries: string[];
  locationSignal: string;
  remotePreferenceMatched: boolean;
};

export type PersonalizedOpportunityDecision = {
  opportunity: RankedOpportunity;
  insight: AtlasInsight;
  matchScore: number;
  qualityScore: number;
  status: string | null;
  signals: PersonalizedDecisionSignals;
};

export async function buildPersonalizedOpportunityDecision(
  userId: string,
  baseOpportunity: Opportunity
): Promise<PersonalizedOpportunityDecision> {
  let opportunity = baseOpportunity;

  try {
    opportunity = await enrichOpportunityFromOriginalSource(baseOpportunity);
  } catch (error) {
    console.error("Opportunity detail enrichment skipped:", error);
  }

  const profile = await buildOpportunityProfile({ clerkId: userId });
  const ranked = await rankOpportunities([opportunity], profile);
  const rankedOpportunity = ranked[0] ?? ({ ...opportunity, score: opportunity.score ?? 50 } as RankedOpportunity);

  const structuralInsight = generateAtlasInsight(opportunity);
  const matchScore = clamp(rankedOpportunity.score ?? 50);
  const qualityScore = clamp(structuralInsight.score);

  // ASCEND Decision should answer “is this credible?” and “is this aligned to me?”.
  // Personal alignment gets the larger share while structural quality still matters.
  const combinedScore = clamp(matchScore * 0.65 + qualityScore * 0.35);

  const opportunityTags = (opportunity.tags ?? []).map((value) => value.toLowerCase());
  const matchedSkills = profile.skills.filter((skill) =>
    opportunityTags.some((tag) => tag === skill.toLowerCase() || tag.includes(skill.toLowerCase()))
  );

  const searchable = [
    opportunity.title,
    opportunity.company,
    opportunity.category,
    opportunity.description,
    opportunity.location,
    ...(opportunity.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchedIndustries = profile.industries.filter((industry) =>
    searchable.includes(industry.toLowerCase())
  );

  const locationSignal = opportunity.remote
    ? "Remote"
    : opportunity.location?.trim() || "Location not clearly specified";

  const personalizedStrengths = unique([
    ...(matchedSkills.length > 0
      ? [`Matches declared skills: ${matchedSkills.slice(0, 4).join(", ")}.`]
      : []),
    ...(matchedIndustries.length > 0
      ? [`Connects with your interests in ${matchedIndustries.slice(0, 3).join(", ")}.`]
      : []),
    ...(profile.remoteOnly && opportunity.remote
      ? ["Matches your remote-work preference."]
      : []),
    ...structuralInsight.strengths,
  ]).slice(0, 6);

  const personalizedConsiderations = unique([
    ...(matchedSkills.length === 0 && profile.skills.length > 0
      ? ["The listed opportunity tags do not clearly overlap with your declared skills, so verify the requirements carefully."]
      : []),
    ...(profile.remoteOnly && !opportunity.remote
      ? ["This opportunity is not marked remote, which may conflict with your stated work preference."]
      : []),
    ...structuralInsight.considerations,
  ]).slice(0, 6);

  const insight: AtlasInsight = {
    ...structuralInsight,
    score: combinedScore,
    level: decisionLevel(combinedScore),
    strengths: personalizedStrengths,
    considerations: personalizedConsiderations,
    nextStep:
      combinedScore >= 72
        ? "Verify the original posting, confirm the requirements, and prepare a focused application if the opportunity still fits your judgment."
        : combinedScore >= 50
          ? "Research the strongest uncertainties before deciding whether the opportunity deserves your time."
          : "Do not rush into this opportunity. Compare it with options that align more closely with your direction and capabilities.",
  };

  const status = await getOpportunityStatus(userId, opportunity.id);

  return {
    opportunity: { ...rankedOpportunity, ...opportunity, score: combinedScore },
    insight,
    matchScore,
    qualityScore,
    status,
    signals: {
      careerGoal: profile.careerGoal,
      matchedSkills: matchedSkills.slice(0, 6),
      matchedIndustries: matchedIndustries.slice(0, 5),
      locationSignal,
      remotePreferenceMatched: Boolean(profile.remoteOnly && opportunity.remote),
    },
  };
}

export async function buildPersonalizedOpportunityActionPlan(
  decision: PersonalizedOpportunityDecision
) {
  const plan = generateAtlasActionPlan(decision.opportunity, decision.insight);

  const matched = decision.signals.matchedSkills;
  const matchedNormalized = new Set(matched.map((skill) => skill.toLowerCase()));

  const evidenceToVerify = plan.skillAssessment.identifiedSkills
    .filter((skill) => !matchedNormalized.has(skill.toLowerCase()))
    .slice(0, 4)
    .map((skill) => `Verify that you can show credible evidence for ${skill}; ASCEND has not confirmed it from your declared skills.`);

  return {
    ...plan,
    summary:
      matched.length > 0
        ? `${plan.summary} Your current ASCEND profile shows a clear declared-skill overlap in ${matched.slice(0, 4).join(", ")}.`
        : `${plan.summary} No strong declared-skill overlap has been confirmed yet, so validate the requirements before investing heavily in the application.`,
    skillAssessment: {
      ...plan.skillAssessment,
      strengths:
        matched.length > 0
          ? matched.slice(0, 6)
          : ["No declared skill match confirmed yet"],
      gapsToReview: unique([
        ...evidenceToVerify,
        ...plan.skillAssessment.gapsToReview,
      ]).slice(0, 6),
    },
  };
}
