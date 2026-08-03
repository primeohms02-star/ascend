import "server-only";

import {
  supabaseServer,
} from "@/lib/supabase-server";

import type {
  OpportunityProfile,
} from "./profile";

import { loadMusicProfile } from "@/lib/music/profile";

type ProfileRow = {
  clerk_id: string;

  journey:
    string | null;

  north_star:
    string | null;
};

type OnboardingRow = {
  identity: string;

  goal: string;

  skills: string[];

  challenges: string[];

  north_star: string;
};

type SkillSignal = {
  name: string;

  pattern: RegExp;
};

const SKILL_SIGNALS:
  SkillSignal[] = [
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
      name: "Microsoft Excel",
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
      name:
        "Cybersecurity",
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
      name:
        "Leadership",
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

const INDUSTRY_SIGNALS:
  Array<{
    name: string;

    pattern: RegExp;
  }> = [
    {
      name: "Technology",
      pattern:
        /\b(?:technology|tech|software|developer|programming)\b/i,
    },
    {
      name:
        "Artificial Intelligence",
      pattern:
        /\b(?:artificial\s+intelligence|machine\s+learning|ai)\b/i,
    },
    {
      name: "Data",
      pattern:
        /\bdata\b/i,
    },
    {
      name: "Finance",
      pattern:
        /\b(?:finance|banking|accounting|fintech)\b/i,
    },
    {
      name: "Healthcare",
      pattern:
        /\b(?:healthcare|health|medical|medicine)\b/i,
    },
    {
      name: "Education",
      pattern:
        /\b(?:education|teaching|teacher|academic)\b/i,
    },
    {
      name: "Marketing",
      pattern:
        /\bmarketing\b/i,
    },
    {
      name: "Design",
      pattern:
        /\bdesign\b/i,
    },
    {
      name: "Engineering",
      pattern:
        /\bengineering\b/i,
    },
    {
      name: "Agriculture",
      pattern:
        /\b(?:agriculture|agricultural|agribusiness)\b/i,
    },
    {
      name: "Energy",
      pattern:
        /\b(?:energy|power|renewable)\b/i,
    },
    {
      name: "Media",
      pattern:
        /\b(?:media|journalism|content)\b/i,
    },
  ];

function clean(
  value?:
    string | null
): string {
  return (
    value?.trim() ?? ""
  );
}

function unique(
  values: string[]
): string[] {
  const uniqueValues =
    new Map<
      string,
      string
    >();

  for (
    const rawValue of values
  ) {
    const value =
      clean(rawValue)
        .replace(
          /\s+/g,
          " "
        );

    if (!value) {
      continue;
    }

    uniqueValues.set(
      value.toLowerCase(),
      value
    );
  }

  return Array.from(
    uniqueValues.values()
  );
}

function detectSkills(
  text: string
): string[] {
  return SKILL_SIGNALS
    .filter(
      ({ pattern }) =>
        pattern.test(text)
    )
    .map(
      ({ name }) =>
        name
    );
}

function detectIndustries(
  text: string
): string[] {
  return INDUSTRY_SIGNALS
    .filter(
      ({ pattern }) =>
        pattern.test(text)
    )
    .map(
      ({ name }) =>
        name
    );
}

function detectExperienceLevel(
  identity: string
): OpportunityProfile["experienceLevel"] {
  if (
    /\b(?:senior|lead|manager|director|expert|advanced|founder|professional|specialist)\b/i.test(
      identity
    )
  ) {
    return "advanced";
  }

  if (
    /\b(?:intermediate|associate|junior|graduate|experienced|working professional)\b/i.test(
      identity
    )
  ) {
    return "intermediate";
  }

  return "beginner";
}

function detectEducation(
  identity: string
): string {
  const match =
    identity.match(
      /\b(?:phd|doctorate|master(?:'s)?|mba|bachelor(?:'s)?|degree|diploma|undergraduate|graduate|student)\b[^,.]*/i
    );

  return (
    match?.[0]
      ?.trim() ?? ""
  );
}

function detectLocation(
  text: string
): string {
  if (
    /\bnigeria\b|\bnigerian\b/i.test(
      text
    )
  ) {
    return "Nigeria";
  }

  if (
    /\bafrica\b|\bafrican\b/i.test(
      text
    )
  ) {
    return "Africa";
  }

  if (
    /\bremote\b|\bwork(?:ing)? from home\b/i.test(
      text
    )
  ) {
    return "Remote";
  }

  return "";
}

export async function buildOpportunityProfile(
  profile: {
    clerkId: string;
  }
): Promise<OpportunityProfile> {
  console.log(
    "Current Clerk ID:",
    profile.clerkId
  );

  const [
    profileResult,
    onboardingResult,
    musicProfile,
  ] = await Promise.all([
    supabaseServer
      .from("profiles")
      .select(
        "clerk_id, journey, north_star"
      )
      .eq(
        "clerk_id",
        profile.clerkId
      )
      .maybeSingle(),

    supabaseServer
      .from(
        "atlas_onboarding_context"
      )
      .select(
        "identity, goal, skills, challenges, north_star"
      )
      .eq(
        "user_id",
        profile.clerkId
      )
      .maybeSingle(),

    loadMusicProfile(
      profile.clerkId
    ),
  ]);

  if (
    profileResult.error
  ) {
    throw new Error(
      `Opportunity profile load failed: ${profileResult.error.message}`
    );
  }

  if (
    onboardingResult.error
  ) {
    throw new Error(
      `Opportunity onboarding context load failed: ${onboardingResult.error.message}`
    );
  }

  const profileRow =
    profileResult.data as
      | ProfileRow
      | null;

  if (!profileRow) {
    throw new Error(
      "Profile not found"
    );
  }

  const onboarding =
    onboardingResult.data as
      | OnboardingRow
      | null;

  const identity =
    clean(
      onboarding?.identity
    );

  const goal =
    clean(
      onboarding?.goal
    );

  const northStar =
    clean(
      onboarding?.north_star
    ) ||
    clean(
      profileRow.north_star
    ) ||
    "Discover my direction";

  const directionText = [
    identity,
    goal,
    northStar,
    musicProfile?.roles.join(" ") ?? "",
    musicProfile?.genres.join(" ") ?? "",
    musicProfile?.goal ?? "",
    musicProfile?.northStar ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const declaredSkills =
    Array.isArray(
      onboarding?.skills
    )
      ? onboarding.skills
      : [];

  const skills =
    unique([
      ...declaredSkills,

      ...(musicProfile?.skills ?? []),

      /*
       * Preserve useful skills the user
       * explicitly mentioned in their
       * written direction.
       */
      ...detectSkills(
        directionText
      ),
    ]);

  const location =
    detectLocation(
      directionText
    ) || musicProfile?.location || "";

  const remoteOnly =
    /\b(?:remote only|only remote|remote-only|work(?:ing)? from home only)\b/i.test(
      directionText
    );

  const industries =
    unique([
      ...detectIndustries(
        directionText
      ),
      ...(musicProfile
        ? ["Music", "Entertainment"]
        : []),
    ]);

  return {
    clerkId:
      profileRow.clerk_id,

    careerGoal:
      goal || northStar,

    skills,

    interests:
      unique([
        ...industries,
        northStar,
        ...(musicProfile?.roles ?? []),
        ...(musicProfile?.genres ?? []),
        ...(musicProfile
          ? [musicProfile.goal, musicProfile.northStar]
          : []),
      ]),

    experienceLevel:
      detectExperienceLevel(
        identity
      ),

    education:
      detectEducation(
        identity
      ),

    location,

    preferredCountries:
      location === "Nigeria" ||
      musicProfile?.preferredRegions.includes("Nigeria")
        ? ["Nigeria"]
        : [],

    remoteOnly,

    industries,

    languages: [
      "English",
    ],

    salaryExpectation:
      undefined,
  };
}
