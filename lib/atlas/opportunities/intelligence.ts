import {
  Opportunity,
  RankedOpportunity,
} from "./types";
import { OpportunityProfile } from "./profile";
import { supabaseServer } from "@/lib/supabase-server";

export async function rankOpportunities(
  opportunities: Opportunity[],
  profile: OpportunityProfile
): Promise<RankedOpportunity[]> {

  // Learned Preferences
  const { data: preferences } = await supabaseServer
    .from("atlas_preferences")
    .select("*")
    .eq("clerk_id", profile.clerkId);

  // Opportunity Learning
  const { data: learning } = await supabaseServer
    .from("atlas_opportunity_impressions")
    .select("*")
    .eq("clerk_id", profile.clerkId);

  return opportunities
    .map((opportunity) => {

      let score = opportunity.score ?? 50;

      // -------------------------
      // North Star
      // -------------------------

      const northStar =
        opportunity.title
          .toLowerCase()
          .includes(profile.careerGoal.toLowerCase())
          ? 20
          : 0;

      score += northStar;

      // -------------------------
      // Remote Preference
      // -------------------------

      const remote =
        opportunity.remote && profile.remoteOnly
          ? 10
          : 0;

      score += remote;

      // -------------------------
      // Skills
      // -------------------------

      let matchedSkills = 0;

      for (const tag of opportunity.tags ?? []) {

        if (
          profile.skills.some(
            skill =>
              skill.toLowerCase() ===
              tag.toLowerCase()
          )
        ) {
          matchedSkills++;
        }

      }

      const skills = matchedSkills * 3;

      score += skills;

      // -------------------------
      // Learned Preferences
      // -------------------------

      for (const preference of preferences ?? []) {

        if (
          opportunity.category ===
          preference.category
        ) {
          score += preference.score;
        }

        if (
          opportunity.tags?.includes(
            preference.category
          )
        ) {
          score += Math.floor(
            preference.score / 2
          );
        }

      }

      // -------------------------
      // Adaptive Learning
      // -------------------------

      const seen = learning?.find(
        item =>
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

      const total =
        Math.max(
          0,
          Math.min(score, 100)
        );

      return {

        ...opportunity,

        score: total,

        ranking: {
          northStar,
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