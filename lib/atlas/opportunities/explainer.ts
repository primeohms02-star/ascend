import type { RankedOpportunity } from "./types";
import type { OpportunityProfile } from "./profile";

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

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function clampScore(score: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function createOpportunityText(
  opportunity: RankedOpportunity
): string {
  return [
    opportunity.title,
    opportunity.company,
    opportunity.description,
    opportunity.category,
    ...opportunity.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesProfileDirection(
  opportunityText: string,
  profile: OpportunityProfile
): boolean {
  const directionSignals = [
    profile.careerGoal,
    ...(profile.interests ?? []),
    ...(profile.industries ?? []),
  ]
    .map(normalize)
    .filter(Boolean);

  return directionSignals.some((signal) => {
    const meaningfulWords = signal
      .split(/\s+/)
      .filter((word) => word.length >= 3);

    return meaningfulWords.some((word) =>
      opportunityText.includes(word)
    );
  });
}

export function explainOpportunity(
  opportunity: RankedOpportunity,
  profile: OpportunityProfile
): OpportunityExplanation {
  const reasons: string[] = [];
  const missingSkills: string[] = [];

  const score = clampScore(
    opportunity.score ?? 0
  );

  const opportunityText =
    createOpportunityText(opportunity);

  /*
   * Direction alignment
   */

  const directionMatch =
    matchesProfileDirection(
      opportunityText,
      profile
    );

  const northStarScore =
    directionMatch ? 20 : 0;

  if (directionMatch) {
    reasons.push(
      "Supports your current career direction"
    );
  }

  /*
   * Remote preference
   */

  const remoteMatch =
    opportunity.remote === true &&
    (profile.remoteOnly === true ||
      normalize(profile.location) ===
        "remote");

  const remoteScore =
    remoteMatch ? 10 : 0;

  if (remoteMatch) {
    reasons.push(
      "Matches your remote-work preference"
    );
  }

  /*
   * Skill alignment
   */

  const profileSkills = new Set(
    (profile.skills ?? []).map(normalize)
  );

  let matchedSkills = 0;

  for (const tag of opportunity.tags ?? []) {
    const normalizedTag =
      normalize(tag);

    if (!normalizedTag) {
      continue;
    }

    if (
      profileSkills.has(normalizedTag)
    ) {
      matchedSkills += 1;
    } else {
      missingSkills.push(tag);
    }
  }

  const skillsScore = Math.min(
    matchedSkills * 8,
    40
  );

  if (matchedSkills > 0) {
    reasons.push(
      `${matchedSkills} matching skill${
        matchedSkills === 1 ? "" : "s"
      }`
    );
  }

  if (
    opportunity.remote &&
    !remoteMatch
  ) {
    reasons.push(
      "Offers location flexibility"
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "Contains signals worth investigating"
    );
  }

  /*
   * Opportunity difficulty
   */

  let level:
    OpportunityExplanation["level"];

  if (score >= 85) {
    level = "Easy Win";
  } else if (score >= 65) {
    level = "Growth Opportunity";
  } else {
    level = "Stretch Goal";
  }

  return {
    matchScore: score,

    level,

    reasons,

    missingSkills: [
      ...new Set(missingSkills),
    ],

    readinessGain: Math.max(
      2,
      Math.min(
        missingSkills.length * 2,
        15
      )
    ),

    ranking: {
      northStar:
        northStarScore,

      skills:
        skillsScore,

      remote:
        remoteScore,

      saved: 0,
      applied: 0,
      passive: 0,

      total:
        score,
    },
  };
}