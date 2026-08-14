import {
  Opportunity,
  RankedOpportunity,
} from "./types";

import { OpportunityProfile } from "./profile";
import { supabaseServer } from "@/lib/supabase-server";

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
      let score =
        opportunity.score ?? 50;

      // -------------------------
      // North Star
      // -------------------------

      const careerGoal =
        profile.careerGoal
          ?.trim()
          .toLowerCase() ?? "";

      const opportunityText = [
        opportunity.title,
        opportunity.description,
        opportunity.category,
        ...(opportunity.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const northStar =
        careerGoal &&
        opportunityText.includes(careerGoal)
          ? 20
          : 0;

      score += northStar;

      // -------------------------
      // Geographic relevance
      // -------------------------

      const geography =
        getGeographicScore(opportunity);

      score += geography;

      // -------------------------
      // Opportunity diversity
      // -------------------------

      const opportunityType =
        getOpportunityTypeScore(opportunity);

      score += opportunityType;

      // -------------------------
      // Remote preference
      // -------------------------

      const remote =
        opportunity.remote &&
        profile.remoteOnly
          ? 10
          : 0;

      score += remote;

      // -------------------------
      // Skills
      // -------------------------

      let matchedSkills = 0;

      for (
        const tag of opportunity.tags ?? []
      ) {
        const matchesSkill =
          profile.skills.some(
            (skill) =>
              skill.toLowerCase() ===
              tag.toLowerCase()
          );

        if (matchesSkill) {
          matchedSkills++;
        }
      }

      const skills =
        matchedSkills * 3;

      score += skills;

      // -------------------------
      // Learned preferences
      // -------------------------

      for (
        const preference of preferences ?? []
      ) {
        const preferenceCategory =
          preference.category
            ?.toLowerCase() ?? "";

        if (
          opportunity.category
            ?.toLowerCase() ===
          preferenceCategory
        ) {
          score += preference.score;
        }

        const matchesTag =
          opportunity.tags?.some(
            (tag) =>
              tag.toLowerCase() ===
              preferenceCategory
          );

        if (matchesTag) {
          score += Math.floor(
            preference.score / 2
          );
        }
      }

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

      score += saved;

      const applied =
        seen?.applied ? 25 : 0;

      score += applied;

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

      score += passive;

      const total = Math.max(
        0,
        Math.min(score, 100)
      );

      return {
        ...opportunity,

        score: total,

        ranking: {
          northStar,
          geography,
          opportunityType,
          skills,
          remote,
          saved,
          applied,
          passive,
          total,
        },
      };
    })
    .sort(
      (a, b) =>
        (b.score ?? 0) -
        (a.score ?? 0)
    );
}
