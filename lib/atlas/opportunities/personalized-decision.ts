import { unstable_cache } from "next/cache";

import { generateAtlasActionPlan } from "./action-plan";
import {
  assessApplicationReadiness,
  type ApplicationReadinessAssessment,
} from "./application-readiness";
import { buildOpportunityProfile } from "./build-profile";
import { enrichOpportunityFromOriginalSource } from "./detail-enrichment";
import { generateAtlasInsight, type AtlasInsight } from "./insight";
import { rankOpportunities } from "./intelligence";
import {
  getOpportunityStatus,
  type OpportunityStatus,
} from "./memory";
import type { Opportunity, RankedOpportunity } from "./types";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

async function enrichPublicOpportunity(
  baseOpportunity: Opportunity
): Promise<Opportunity> {
  const { score, snapshotId, ...publicOpportunity } = baseOpportunity;

  const loadEnrichedOpportunity = unstable_cache(
    () => enrichOpportunityFromOriginalSource(publicOpportunity),
    [
      "atlas-opportunity-detail",
      "v1",
      baseOpportunity.source,
      baseOpportunity.id,
      baseOpportunity.url ?? "",
    ],
    { revalidate: 3600 },
  );

  const enriched = await loadEnrichedOpportunity();

  return {
    ...enriched,
    ...(score === undefined ? {} : { score }),
    ...(snapshotId === undefined ? {} : { snapshotId }),
  };
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
  atlasScore: number;
  matchScore: number;
  qualityScore: number;
  readiness: ApplicationReadinessAssessment;
  status: OpportunityStatus | null;
  signals: PersonalizedDecisionSignals;
};

export async function buildPersonalizedOpportunityDecision(
  userId: string,
  baseOpportunity: Opportunity
): Promise<PersonalizedOpportunityDecision> {
  const enrichmentPromise = enrichPublicOpportunity(baseOpportunity).catch(
    (error) => {
      console.error("Opportunity detail enrichment skipped:", error);
      return baseOpportunity;
    },
  );

  const [opportunity, profile, status] = await Promise.all([
    enrichmentPromise,
    buildOpportunityProfile({ clerkId: userId }),
    getOpportunityStatus(userId, baseOpportunity.id),
  ]);

  const ranked = await rankOpportunities([opportunity], profile);
  const rankedOpportunity = ranked[0] ?? ({ ...opportunity, score: opportunity.score ?? 50 } as RankedOpportunity);

  const structuralInsight = generateAtlasInsight(opportunity);
  const matchScore = clamp(rankedOpportunity.score ?? 50);
  const qualityScore = clamp(structuralInsight.score);

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

  const level =
    matchScore >= 80
      ? "Strong Alignment"
      : matchScore >= 65
        ? "Promising Alignment"
        : matchScore >= 45
          ? "Investigate Fit"
          : "Limited Alignment";

  const insight: AtlasInsight = {
    ...structuralInsight,
    score: matchScore,
    level,
    strengths: personalizedStrengths,
    considerations: personalizedConsiderations,
  };

  const readiness = assessApplicationReadiness(
    opportunity,
    profile,
    matchScore,
    qualityScore,
  );

  return {
    opportunity: { ...opportunity, ...rankedOpportunity, score: matchScore },
    insight,
    atlasScore: matchScore,
    matchScore,
    qualityScore,
    readiness,
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
  const plan = generateAtlasActionPlan(
    decision.opportunity,
    decision.insight,
    decision.readiness,
  );

  const matched = decision.signals.matchedSkills;
  const matchedNormalized = new Set(matched.map((skill) => skill.toLowerCase()));

  const evidenceToVerify = decision.readiness.skillsToVerify
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
