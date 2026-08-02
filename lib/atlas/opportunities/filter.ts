import type {
  OpportunityProfile,
} from "./profile";

import type {
  Opportunity,
} from "./types";

const STOP_WORDS =
  new Set([
    "about",
    "achieve",
    "advance",
    "and",
    "are",
    "build",
    "career",
    "care",
    "discover",
    "family",
    "find",
    "for",
    "from",
    "get",
    "goal",
    "grow",
    "have",
    "into",
    "job",
    "join",
    "learn",
    "make",
    "myself",
    "new",
    "paid",
    "purpose",
    "skills",
    "take",
    "that",
    "the",
    "their",
    "this",
    "through",
    "toward",
    "want",
    "well",
    "with",
    "work",
  ]);

type GoalCategoryMap = {
  primary: string[];

  adjacent: string[];
};

const GOAL_CATEGORIES:
  Record<
    string,
    GoalCategoryMap
  > = {
    "find a job": {
      primary: [
        "job",
      ],

      adjacent: [
        "internship",
        "course",
        "mentorship",
      ],
    },

    "find an internship": {
      primary: [
        "internship",
      ],

      adjacent: [
        "job",
        "course",
        "mentorship",
      ],
    },

    "win a scholarship": {
      primary: [
        "scholarship",
      ],

      adjacent: [
        "fellowship",
        "course",
        "programme",
      ],
    },

    "join a fellowship": {
      primary: [
        "fellowship",
      ],

      adjacent: [
        "scholarship",
        "programme",
        "mentorship",
      ],
    },

    "find grants or funding": {
      primary: [
        "grant",
      ],

      adjacent: [
        "accelerator",
        "competition",
        "programme",
      ],
    },

    "build a business": {
      primary: [
        "accelerator",
        "grant",
        "competition",
      ],

      adjacent: [
        "mentorship",
        "course",
        "programme",
      ],
    },

    "learn new skills": {
      primary: [
        "course",
      ],

      adjacent: [
        "mentorship",
        "internship",
        "scholarship",
        "programme",
      ],
    },

    "change careers": {
      primary: [
        "job",
        "internship",
        "course",
      ],

      adjacent: [
        "fellowship",
        "mentorship",
        "programme",
      ],
    },

    "advance my career": {
      primary: [
        "job",
        "fellowship",
        "course",
      ],

      adjacent: [
        "mentorship",
        "programme",
        "competition",
      ],
    },

    "grow my freelance career": {
      primary: [
        "job",
        "competition",
        "grant",
      ],

      adjacent: [
        "course",
        "mentorship",
        "programme",
      ],
    },

    "grow as a creator": {
      primary: [
        "competition",
        "grant",
        "fellowship",
      ],

      adjacent: [
        "job",
        "course",
        "programme",
      ],
    },

    "build my network": {
      primary: [
        "mentorship",
        "fellowship",
        "volunteering",
      ],

      adjacent: [
        "programme",
        "course",
        "competition",
      ],
    },

    "discover my purpose": {
      primary: [
        "job",
        "internship",
        "scholarship",
        "fellowship",
        "grant",
        "course",
        "competition",
        "mentorship",
        "volunteering",
        "accelerator",
        "programme",
      ],

      adjacent: [],
    },
  };

const SKILL_ALIASES:
  Record<
    string,
    string[]
  > = {
    "artificial intelligence": [
      "artificial intelligence",
      "machine intelligence",
      "ai",
    ],

    communication: [
      "communication",
      "communications",
      "communication skills",
    ],

    "digital marketing": [
      "digital marketing",
      "digital marketer",
    ],

    "graphic design": [
      "graphic design",
      "graphic designer",
    ],

    leadership: [
      "leadership",
      "leader",
      "team lead",
    ],

    "microsoft excel": [
      "microsoft excel",
      "excel",
      "spreadsheets",
    ],

    "node.js": [
      "node.js",
      "nodejs",
      "node js",
    ],

    "power bi": [
      "power bi",
      "powerbi",
    ],

    "problem solving": [
      "problem solving",
      "problem-solving",
    ],

    "product management": [
      "product management",
      "product manager",
    ],

    "project management": [
      "project management",
      "project manager",
    ],

    research: [
      "research",
      "researcher",
    ],

    "social media marketing": [
      "social media marketing",
      "social media management",
      "social media manager",
    ],

    "ui/ux design": [
      "ui/ux",
      "ui design",
      "ux design",
      "user interface",
      "user experience",
    ],
  };

export type OpportunityRelevance = {
  score: number;

  goalCategory: number;

  skills: number;

  direction: number;

  industry: number;

  remote: number;
};

function normalize(
  value?: string
): string {
  const normalized =
    value
      ?.toLowerCase()
      .replace(
        /[^a-z0-9+#./-]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim() ?? "";

  return ` ${normalized} `;
}

function normalizeCategory(
  value?: string
): string {
  const category =
    normalize(value)
      .trim();

  if (
    category === "program" ||
    category === "programs" ||
    category === "programmes"
  ) {
    return "programme";
  }

  if (
    category ===
    "training"
  ) {
    return "course";
  }

  if (
    category.endsWith("s")
  ) {
    return category.slice(
      0,
      -1
    );
  }

  return category;
}

function buildOpportunityText(
  opportunity: Opportunity
): string {
  return normalize(
    [
      opportunity.title,
      opportunity.company,
      opportunity.description,
      opportunity.category,
      opportunity.location,
      ...(
        opportunity.tags ?? []
      ),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function extractDirectionTerms(
  profile:
    OpportunityProfile
): string[] {
  const directionText = [
    profile.careerGoal,
    ...(
      profile.interests ?? []
    ),
    ...(
      profile.industries ?? []
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return Array.from(
    new Set(
      directionText
        .replace(
          /[^a-z0-9+#./-]+/g,
          " "
        )
        .split(/\s+/)
        .map(
          (term) =>
            term.trim()
        )
        .filter(
          (term) =>
            term.length >= 3 &&
            !STOP_WORDS.has(
              term
            )
        )
    )
  ).slice(0, 24);
}

function skillMatches(
  opportunityText: string,
  skill: string
): boolean {
  const normalizedSkill =
    normalize(skill)
      .trim();

  if (!normalizedSkill) {
    return false;
  }

  const signals =
    SKILL_ALIASES[
      normalizedSkill
    ] ?? [
      normalizedSkill,
    ];

  return signals.some(
    (signal) => {
      const normalizedSignal =
        normalize(signal)
          .trim();

      if (
        !normalizedSignal
      ) {
        return false;
      }

      return opportunityText.includes(
        ` ${normalizedSignal} `
      );
    }
  );
}

export function calculateOpportunityRelevance(
  opportunity: Opportunity,
  profile:
    OpportunityProfile
): OpportunityRelevance {
  const opportunityText =
    buildOpportunityText(
      opportunity
    );

  const category =
    normalizeCategory(
      opportunity.category
    );

  const goal =
    normalize(
      profile.careerGoal
    ).trim();

  const categoryMap =
    GOAL_CATEGORIES[goal];

  let goalCategory = 0;

  if (
    categoryMap?.primary.includes(
      category
    )
  ) {
    goalCategory = 24;
  } else if (
    categoryMap?.adjacent.includes(
      category
    )
  ) {
    goalCategory = 12;
  }

  const matchedSkills =
    (
      profile.skills ?? []
    ).filter(
      (skill) =>
        skillMatches(
          opportunityText,
          skill
        )
    ).length;

  const skills =
    Math.min(
      44,
      matchedSkills * 22
    );

  const directionMatches =
    extractDirectionTerms(
      profile
    ).filter(
      (term) =>
        opportunityText.includes(
          ` ${term} `
        )
    ).length;

  const direction =
    Math.min(
      28,
      directionMatches * 7
    );

  const matchedIndustries =
    (
      profile.industries ?? []
    ).filter(
      (industry) => {
        const signal =
          normalize(industry)
            .trim();

        return (
          signal.length > 0 &&
          opportunityText.includes(
            ` ${signal} `
          )
        );
      }
    ).length;

  const industry =
    Math.min(
      16,
      matchedIndustries * 8
    );

  const remote =
    profile.remoteOnly &&
    opportunity.remote
      ? 6
      : 0;

  return {
    score:
      Math.min(
        100,
        goalCategory +
          skills +
          direction +
          industry +
          remote
      ),

    goalCategory,

    skills,

    direction,

    industry,

    remote,
  };
}

export function filterOpportunities(
  opportunities:
    Opportunity[],

  profile:
    OpportunityProfile
): Opportunity[] {
  const directionTerms =
    extractDirectionTerms(
      profile
    );

  const hasPersonalSignals =
    profile.skills.length > 0 ||
    profile.industries.length >
      0 ||
    directionTerms.length > 0;

  const minimumScore =
    hasPersonalSignals
      ? 30
      : 20;

  const evaluated =
    opportunities.map(
      (opportunity) => ({
        opportunity,

        relevance:
          calculateOpportunityRelevance(
            opportunity,
            profile
          ),
      })
    );

  const relevant =
    evaluated.filter(
      ({ relevance }) =>
        relevance.score >=
        minimumScore
    );

  /*
   * Never produce a broken empty feed solely
   * because the user's direction is still broad.
   *
   * If nothing crosses the relevance threshold,
   * preserve only the fifty strongest candidates.
   */

  if (
    relevant.length === 0
  ) {
    return evaluated
      .sort(
        (first, second) =>
          second.relevance
            .score -
          first.relevance
            .score
      )
      .slice(
        0,
        Math.min(
          50,
          evaluated.length
        )
      )
      .map(
        ({
          opportunity,
          relevance,
        }) => ({
          ...opportunity,

          score:
            relevance.score,
        })
      );
  }

  return relevant.map(
    ({
      opportunity,
      relevance,
    }) => ({
      ...opportunity,

      score:
        relevance.score,
    })
  );
}