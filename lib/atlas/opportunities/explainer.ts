import type {
  RankedOpportunity,
} from "./types";

import type {
  OpportunityProfile,
} from "./profile";

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

type SkillSignal = {
  name: string;
  pattern: RegExp;
  aliases?: string[];
};

function normalize(
  value?: string
): string {
  return (
    value
      ?.trim()
      .toLowerCase() ?? ""
  );
}

const SKILL_SIGNALS: SkillSignal[] =
  [
    {
      name: "Python",
      pattern: /\bpython\b/i,
    },
    {
      name: "JavaScript",
      pattern:
        /\bjavascript\b/i,
    },
    {
      name: "TypeScript",
      pattern:
        /\btypescript\b/i,
    },
    {
      name: "React",
      pattern:
        /\breact(?:\.js|js)?\b/i,
    },
    {
      name: "Node.js",
      pattern:
        /\bnode(?:\.js|js)\b/i,
    },
    {
      name: "SQL",
      pattern: /\bsql\b/i,
    },
    {
      name: "Git",
      pattern: /\bgit\b/i,
    },
    {
      name:
        "Microsoft Excel",
      pattern:
        /\b(?:microsoft\s+)?excel\b/i,
    },
    {
      name: "Power BI",
      pattern:
        /\bpower\s*bi\b/i,
    },
    {
      name: "Data Analysis",
      pattern:
        /\bdata\s+analys(?:is|t|tics)\b/i,
    },
    {
      name:
        "Machine Learning",
      pattern:
        /\bmachine\s+learning\b/i,
    },
    {
      name:
        "Artificial Intelligence",

      pattern:
        /\b(?:artificial\s+intelligence|ai)\b/i,

      aliases: ["AI"],
    },
    {
      name:
        "Cloud Computing",

      pattern:
        /\bcloud\s+computing\b/i,
    },
    {
      name: "AWS",

      pattern:
        /\baws\b|amazon\s+web\s+services/i,
    },
    {
      name: "Cybersecurity",

      pattern:
        /\bcyber\s*security\b/i,
    },
    {
      name:
        "Project Management",

      pattern:
        /\bproject\s+management\b/i,
    },
    {
      name:
        "Product Management",

      pattern:
        /\bproduct\s+management\b/i,
    },
    {
      name:
        "Financial Analysis",

      pattern:
        /\bfinancial\s+analysis\b/i,
    },
    {
      name: "Accounting",

      pattern:
        /\baccounting\b/i,
    },
    {
      name:
        "Customer Service",

      pattern:
        /\bcustomer\s+service\b/i,
    },
    {
      name: "Sales",

      pattern:
        /\bsales\b/i,
    },
    {
      name:
        "Digital Marketing",

      pattern:
        /\bdigital\s+marketing\b/i,
    },
    {
      name:
        "Social Media Marketing",

      pattern:
        /\bsocial\s+media\s+(?:marketing|management)\b/i,
    },
    {
      name: "SEO",

      pattern:
        /\bseo\b|search\s+engine\s+optimisation|search\s+engine\s+optimization/i,
    },
    {
      name:
        "Graphic Design",

      pattern:
        /\bgraphic\s+design\b/i,
    },
    {
      name:
        "UI/UX Design",

      pattern:
        /\bui\s*\/\s*ux\b|\bux\s+design\b|\bui\s+design\b/i,
    },
    {
      name: "Research",

      pattern:
        /\bresearch(?:ing)?\b/i,
    },
    {
      name:
        "Technical Writing",

      pattern:
        /\btechnical\s+writing\b/i,
    },
    {
      name:
        "Communication",

      pattern:
        /\bcommunication\s+skills?\b/i,
    },
    {
      name: "Leadership",

      pattern:
        /\bleadership\s+skills?\b/i,
    },
    {
      name:
        "Problem Solving",

      pattern:
        /\bproblem[ -]solving\b/i,
    },
  ];

function detectOpportunitySkills(
  opportunityText: string
): Array<{
  name: string;
  aliases: string[];
}> {
  return SKILL_SIGNALS
    .filter(
      ({ pattern }) =>
        pattern.test(
          opportunityText
        )
    )
    .map(
      ({
        name,
        aliases = [],
      }) => ({
        name,
        aliases,
      })
    );
}

function clampScore(
  score: number
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score)
    )
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

  return directionSignals.some(
    (signal) => {
      const meaningfulWords =
        signal
          .split(/\s+/)
          .filter(
            (word) =>
              word.length >= 3
          );

      return meaningfulWords.some(
        (word) =>
          opportunityText.includes(
            word
          )
      );
    }
  );
}

export function explainOpportunity(
  opportunity: RankedOpportunity,
  profile: OpportunityProfile
): OpportunityExplanation {
  const reasons: string[] = [];

  const missingSkills:
    string[] = [];

  const score = clampScore(
    opportunity.score ?? 0
  );

  const opportunityText =
    createOpportunityText(
      opportunity
    );

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
    (
      profile.remoteOnly ===
        true ||
      normalize(
        profile.location
      ) === "remote"
    );

  const remoteScore =
    remoteMatch ? 10 : 0;

  if (remoteMatch) {
    reasons.push(
      "Matches your remote-work preference"
    );
  }

  /*
   * Genuine skill alignment
   */

  const profileSkills =
    new Set(
      (
        profile.skills ?? []
      ).map(normalize)
    );

  const detectedSkills =
    detectOpportunitySkills(
      opportunityText
    );

  let matchedSkills = 0;

  for (
    const skill of
      detectedSkills
  ) {
    const acceptedNames = [
      skill.name,
      ...skill.aliases,
    ].map(normalize);

    const hasSkill =
      acceptedNames.some(
        (name) =>
          profileSkills.has(
            name
          )
      );

    if (hasSkill) {
      matchedSkills += 1;
    } else {
      missingSkills.push(
        skill.name
      );
    }
  }

  const skillsScore =
    Math.min(
      matchedSkills * 8,
      40
    );

  if (matchedSkills > 0) {
    reasons.push(
      `${matchedSkills} matching skill${
        matchedSkills === 1
          ? ""
          : "s"
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

  if (
    reasons.length === 0
  ) {
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
  } else if (
    score >= 65
  ) {
    level =
      "Growth Opportunity";
  } else {
    level =
      "Stretch Goal";
  }

  return {
    matchScore: score,

    level,

    reasons,

    missingSkills: [
      ...new Set(
        missingSkills
      ),
    ],

    readinessGain:
      Math.max(
        2,
        Math.min(
          missingSkills.length *
            2,
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

      total: score,
    },
  };
}