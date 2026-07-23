import { RankedOpportunity } from "./types";
import { OpportunityProfile } from "./profile";

export type OpportunityExplanation = {
  matchScore: number;

  level:
    | "Easy Win"
    | "Growth Opportunity"
    | "Stretch Goal";

  reasons: string[];

  missingSkills: string[];

  readinessGain: number;

  ranking: {
    northStar: number;
    skills: number;
    remote: number;
    saved: number;
    applied: number;
    passive: number;
    total: number;
  };
};


export function explainOpportunity(
  opportunity: RankedOpportunity,
  profile: OpportunityProfile
): OpportunityExplanation {

  const reasons: string[] = [];
  const missingSkills: string[] = [];


  // -------------------------
  // Human Explanation
  // -------------------------

  if (
    opportunity.ranking.northStar > 0
  ) {
    reasons.push(
      "Matches your North Star"
    );
  }


  if (
    opportunity.ranking.remote > 0
  ) {
    reasons.push(
      "Matches your remote preference"
    );
  }


  let matchedSkills = 0;

  for (const tag of opportunity.tags ?? []) {

    const hasSkill =
      profile.skills.some(
        skill =>
          skill.toLowerCase() ===
          tag.toLowerCase()
      );


    if (hasSkill) {
      matchedSkills++;
    } else {
      missingSkills.push(tag);
    }

  }


  if (matchedSkills > 0) {
    reasons.push(
      `${matchedSkills} matching skill${
        matchedSkills === 1 ? "" : "s"
      }`
    );
  }


  // -------------------------
  // Difficulty Level
  // -------------------------

  let level:
    OpportunityExplanation["level"];


  if (
    (opportunity.score ?? 0) >= 85
  ) {

    level = "Easy Win";

  } else if (
    (opportunity.score ??0) >= 65
  ) {

    level = "Growth Opportunity";

  } else {

    level = "Stretch Goal";

  }


  return {

    matchScore:
      opportunity.score ?? 0,

    level,

    reasons,

    missingSkills,

    readinessGain:
      Math.max(
        2,
        missingSkills.length
      ),

    ranking:
      opportunity.ranking,

  };

}