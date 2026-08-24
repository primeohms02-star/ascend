import {
  Opportunity,
  RankedOpportunity,
} from "./types";

import { OpportunityProfile } from "./profile";
import { supabaseServer } from "@/lib/supabase-server";
import { calculateOpportunityRelevance } from "./filter";

import {
  isAfricanOpportunity,
  isNigerianOpportunity,
} from "./geography";

function getGeographicScore(
  opportunity: Opportunity
): number {
  const searchable = [
    opportunity.location,
    opportunity.title,
    opportunity.description,
    opportunity.source,
    ...(opportunity.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Nigeria receives the highest priority.

  if (isNigerianOpportunity(opportunity)) {
    return 20;
  }

  // Africa-focused sources and explicitly
  // African opportunities rank next.

  if (isAfricanOpportunity(opportunity)) {
    return 14;
  }

  // Globally accessible and remote opportunities
  // remain useful but receive a smaller boost.

  if (
    opportunity.remote ||
    searchable.includes("worldwide") ||
    searchable.includes("global") ||
    searchable.includes("anywhere")
  ) {
    return 6;
  }

  return 0;
}

function getOpportunityTypeScore(
  opportunity: Opportunity
): number {
  const category =
    opportunity.category
      ?.trim()
      .toLowerCase() ?? "";

  const valuableCategories = [
    "scholarship",
    "fellowship",
    "internship",
    "grant",
    "accelerator",
    "competition",
    "hackathon",
    "mentorship",
    "volunteering",
    "course",
    "program",
  ];

  // This prevents the recommendation engine
  // from treating jobs as the only valuable
  // kind of opportunity.

  return valuableCategories.includes(category)
    ? 5
    : 0;
}

export async function rankOpportunities(
  opportunities: Opportunity[],
  profile: OpportunityProfile
): Promise<RankedOpportunity[]> {
  const { data: preferences } =
    await supabaseServer
      .from("atlas_preferences")
      .select("*")
      .eq("clerk_id", profile.clerkId);

  const { data: learning } =
    await supabaseServer
      .from("atlas_opportunity_impressions")
      .select("*")
      .eq("clerk_id", profile.clerkId);

  return opportunities
    .map((opportunity) => {
      const relevance = calculateOpportunityRelevance(opportunity, profile);

      // -------------------------
      // North Star
      // -------------------------

      // Direction and industry terms come from the complete live onboarding
      // context. Do not require a full goal sentence to appear verbatim in a
      // listing; that made legitimate matches score zero.
      const northStar = Math.min(
        40,
        relevance.direction + relevance.industry,
      );

      // -------------------------
      // Geographic relevance
      // -------------------------

      const geography = getGeographicScore(opportunity);

      // -------------------------
      // Opportunity diversity
      // -------------------------

      const opportunityType = getOpportunityTypeScore(opportunity);

      // -------------------------
      // Remote preference
      // -------------------------

      const remote = relevance.remote;

      // -------------------------
      // Skills
      // -------------------------

      const skills = relevance.skills;

      // -------------------------
      // Learned preferences
      // -------------------------

      let learnedPreference = 0;

      for (const preference of preferences ?? []) {
        const preferenceCategory =
          preference.category
            ?.toLowerCase() ?? "";

        if (
          opportunity.category
            ?.toLowerCase() ===
          preferenceCategory
        ) {
          learnedPreference += Number(preference.score ?? 0);
        }

        const matchesTag =
          opportunity.tags?.some(
            (tag) =>
              tag.toLowerCase() ===
              preferenceCategory
          );

        if (matchesTag) {
          learnedPreference += Math.floor(
            Number(preference.score ?? 0) / 2,
          );
        }
      }

      learnedPreference = Math.max(-10, Math.min(10, learnedPreference));

      // -------------------------
      // Adaptive learning
      // -------------------------

      const seen = learning?.find(
        (item) =>
          item.opportunity_id ===
          opportunity.id
      );

      const saved =
        seen?.saved ? 15 : 0;

      const applied =
        seen?.applied ? 25 : 0;

      let passive = 0;

      const impressionCount =
        seen?.impressions ?? 0;

      if (!seen?.saved && !seen?.applied) {
        if (impressionCount >= 5) {
          passive = -5;
        }

        if (impressionCount >= 10) {
          passive = -10;
        }
      }

      const total = Math.max(
        0,
        Math.min(relevance.score + learnedPreference, 100),
      );

      // Geography, opportunity diversity and engagement influence ordering,
      // not personal-fit truth. Saving an opportunity must never make Atlas
      // claim that the user's skills or North Star suddenly align more closely.
      const discoveryPriority =
        total + geography + opportunityType + saved + applied + passive;

      return {
        ...opportunity,

        score: total,

        ranking: {
          northStar,
          goalCategory: relevance.goalCategory,
          geography,
          opportunityType,
          skills,
          remote,
          learnedPreference,
          saved,
          applied,
          passive,
          total,
          discoveryPriority,
        },
      };
    })
    .sort(
      (a, b) =>
        (b.ranking.discoveryPriority ?? b.score ?? 0) -
        (a.ranking.discoveryPriority ?? a.score ?? 0)
    );
}
