import {
  MissionLibrary,
  type MissionPath,
  type MissionTemplate,
} from "./missionLibrary";

import {
  loadBrainState,
} from "@/lib/atlas/loadBrainState";

import {
  decideNextAction,
} from "@/lib/atlas/decisionEngine";

import {
  calculateAscension,
} from "@/lib/atlas/ascension";

import {
  supabaseServer,
} from "@/lib/supabase-server";

import {
  loadOnboardingContext as loadStructuredOnboardingContext,
} from "@/lib/atlas/onboardingContext";

import {
  getGroqReasoningOptions,
  GROQ_MODEL,
} from "@/lib/groq/config";

import {
  normalizeMissionContent,
} from "@/lib/atlas/missionContent";

export type DailyMission = {
  title: string;

  description: string;
};

type MissionContext = {
  prompt: string;
  goal: string;
  skills: string[];
  northStar: string;
};

type MissionGenerationOptions = {
  projectCompletion?: boolean;
  xpReward?: number;
};

function getMissionPath(
  journey: string,
  goal: string
): MissionPath {
  const normalizedGoal =
    goal.trim().toLowerCase();

  const goalPaths:
    Record<string, MissionPath> = {
      "build a business":
        "Builder",

      "build a finance career":
        "Finance",

      "grow in fashion":
        "Fashion",

      "grow my freelance career":
        "Freelancer",

      "grow as a creator":
        "Creator",

      "win a scholarship":
        "Scholar",

      "join a fellowship":
        "Scholar",
    };

  if (goalPaths[normalizedGoal]) {
    return goalPaths[normalizedGoal];
  }

  const normalized =
    journey
      .trim()
      .toLowerCase();

  const paths:
    Record<
      string,
      MissionPath
    > = {
      explorer:
        "Explorer",

      student:
        "Scholar",

      scholar:
        "Scholar",

      "recent graduate":
        "Explorer",

      "job seeker":
        "Explorer",

      "early-career professional":
        "Explorer",

      "experienced professional":
        "Leader",

      professional:
        "Explorer",

      "career changer":
        "Pioneer",

      pioneer:
        "Pioneer",

      freelancer:
        "Freelancer",

      "founder or entrepreneur":
        "Builder",

      "business professional":
        "Builder",

      "finance professional":
        "Finance",

      "fashion professional":
        "Fashion",

      founder:
        "Builder",

      entrepreneur:
        "Builder",

      builder:
        "Builder",

      creator:
        "Creator",

      "researcher or academic":
        "Scholar",

      "social impact professional":
        "Impact",

      "skilled or technical professional":
        "Explorer",

      exploring:
        "Explorer",

      leader:
        "Leader",
    };

  return (
    paths[normalized] ??
    "Explorer"
  );
}

function normalizeTitle(
  title: string
): string {
  return title
    .trim()
    .toLowerCase();
}

function parseMission(
  text: string
): DailyMission | null {
  const rawTitle =
    text.match(
      /^TITLE:[ \t]*(.*)$/im
    )?.[1]?.trim();

  const rawDescription =
    text.match(
      /^DESCRIPTION:[ \t]*([\s\S]*)$/im
    )?.[1]?.trim();

  if (!rawDescription) {
    return null;
  }

  return normalizeMissionContent(
    rawTitle,
    rawDescription
  );
}

async function loadOnboardingContext(
  userId: string
): Promise<MissionContext> {
  /*
   * Structured onboarding is authoritative
   * for users who complete the current flow.
   */

  const structuredContext =
    await loadStructuredOnboardingContext(
      userId
    );

  if (
    structuredContext
  ) {
    const skills =
      structuredContext
        .skills.length > 0
        ? structuredContext.skills
            .map(
              (skill) =>
                `- ${skill}`
            )
            .join("\n")
        : "- Still being identified";

    const challenges =
      structuredContext
        .challenges.length > 0
        ? structuredContext.challenges
            .map(
              (challenge) =>
                `- ${challenge}`
            )
            .join("\n")
        : "- None provided";

    return {
      prompt: `
Identity:
${structuredContext.identity}

Immediate goal:
${structuredContext.goal}

Current declared skills:
${skills}

Current challenges:
${challenges}

North Star:
${structuredContext.north_star}
      `.trim(),

      goal:
        structuredContext.goal,

      skills:
        structuredContext.skills,

      northStar:
        structuredContext.north_star,
    };
  }

  /*
   * Compatibility fallback for users who
   * completed onboarding before structured
   * storage existed.
   */

  const {
    data,
    error,
  } = await supabaseServer
    .from("atlas_facts")
    .select("fact")
    .eq(
      "user_id",
      userId
    )
    .ilike(
      "fact",
      "%Immediate goal:%"
    )
    .ilike(
      "fact",
      "%Current challenges:%"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Legacy Mission Context Load Error:",
      error
    );

    throw error;
  }

  const legacyFact =
    data?.fact ?? "";

  const legacyGoal =
    legacyFact.match(
      /Immediate goal:\s*([^.]*)/i
    )?.[1]?.trim() ?? "";

  return {
    prompt: legacyFact,
    goal: legacyGoal,
    skills: [],
    northStar: "",
  };
}

function getAvailableMissions(
  path: MissionPath,
  completedTitles: string[]
): MissionTemplate[] {
  const completed =
    new Set(
      completedTitles.map(
        normalizeTitle
      )
    );

  return MissionLibrary[
    path
  ].filter(
    (mission) =>
      !completed.has(
        normalizeTitle(
          mission.title
        )
      )
  );
}

function selectFallbackMission(
  available:
    MissionTemplate[],

  path:
    MissionPath,

  blockedTitles:
    string[]
): DailyMission {
  if (
    available.length > 0
  ) {
    return available[0];
  }

  const fallbackByPath:
    Record<
      MissionPath,
      DailyMission
    > = {
      Explorer: {
        title:
          "Aligned Opportunity",

        description:
          "Find one opportunity connected to your North Star, identify its three most important requirements and complete one action that improves your readiness.",
      },

      Scholar: {
        title:
          "Learning Evidence",

        description:
          "Complete one focused learning activity connected to your North Star and create a short piece of evidence showing what you learned.",
      },

      Builder: {
        title:
          "Customer Evidence",

        description:
          "Test one important business assumption with a potential customer and record what the conversation changes about your plan.",
      },

      Leader: {
        title:
          "Visible Leadership",

        description:
          "Take responsibility for one meaningful outcome and document the action you took and the result it created.",
      },

      Pioneer: {
        title:
          "Transition Evidence",

        description:
          "Complete one practical action that demonstrates your readiness for the career or industry you want to enter.",
      },

      Creator: {
        title:
          "Creative Evidence",

        description:
          "Create and publish one useful piece of work connected to the audience and direction you want to build.",
      },

      Freelancer: {
        title:
          "Client Progress",

        description:
          "Present one clear service offer to a potential client and record their response or feedback.",
      },

      Impact: {
        title:
          "Impact Evidence",

        description:
          "Complete one action that creates or documents measurable progress for the people or problem you want to serve.",
      },

      Finance: {
        title:
          "Finance Career Evidence",

        description:
          "Choose one finance role or programme aligned with your North Star, identify its three most important requirements and complete one practical action that creates evidence of your readiness for it.",
      },

      Fashion: {
        title:
          "Fashion Direction Evidence",

        description:
          "Choose one fashion opportunity or audience aligned with your North Star and improve one portfolio, brand or application asset that demonstrates why your work belongs in that direction.",
      },
    };

  const adaptiveCandidates:
    DailyMission[] = [
      fallbackByPath[path],

      {
        title:
          `${path} Requirement Gap`,

        description:
          "Compare your current evidence with one important requirement for your immediate goal, close one specific gap today and save the result.",
      },

      {
        title:
          `${path} Feedback Loop`,

        description:
          "Show one piece of work or one planned next step to a relevant person, ask for focused feedback and record the improvement you will make from it.",
      },

      {
        title:
          `${path} Opportunity Action`,

        description:
          "Choose one real opportunity connected to your direction, identify the strongest reason it fits and complete one concrete readiness or application action.",
      },

      {
        title:
          `${path} Evidence Upgrade`,

        description:
          "Improve one existing project, profile, application or portfolio artifact so it provides clearer evidence of your readiness for your immediate goal.",
      },
    ];

  const blocked =
    new Set(
      blockedTitles.map(
        normalizeTitle
      )
    );

  const distinctFallback =
    adaptiveCandidates.find(
      (candidate) =>
        !blocked.has(
          normalizeTitle(
            candidate.title
          )
        )
    );

  if (distinctFallback) {
    return distinctFallback;
  }

  let sequence =
    blockedTitles.length + 1;

  while (
    blocked.has(
      normalizeTitle(
        `${path} Progress Sprint ${sequence}`
      )
    )
  ) {
    sequence += 1;
  }

  return {
    title:
      `${path} Progress Sprint ${sequence}`,

    description:
      "Identify the highest-priority unfinished step toward your North Star, complete one outcome that can be verified today and save the evidence before choosing the next step.",
  };
}

const GENERIC_MISSION_PATTERNS = [
  "take one meaningful action",
  "work toward your goal",
  "keep moving forward",
  "stay consistent",
  "reflect on your progress",
  "plan your day",
];

const CONTEXT_STOP_WORDS =
  new Set([
    "about",
    "after",
    "again",
    "build",
    "career",
    "current",
    "discover",
    "from",
    "grow",
    "have",
    "into",
    "learn",
    "make",
    "more",
    "north",
    "star",
    "that",
    "their",
    "this",
    "toward",
    "want",
    "with",
    "your",
  ]);

function getContextAnchors(
  context: MissionContext
): string[] {
  return [
    context.goal,
    context.northStar,
    ...context.skills,
  ]
    .join(" ")
    .toLowerCase()
    .match(/[a-z0-9+#.-]{4,}/g)
    ?.filter(
      (word) =>
        !CONTEXT_STOP_WORDS.has(
          word
        )
    ) ?? [];
}

function isPersonalizedMission(
  mission: DailyMission,
  context: MissionContext
): boolean {
  const content =
    `${mission.title} ${mission.description}`
      .toLowerCase();

  if (
    GENERIC_MISSION_PATTERNS.some(
      (pattern) =>
        content.includes(
          pattern
        )
    )
  ) {
    return false;
  }

  const anchors =
    getContextAnchors(
      context
    );

  return (
    anchors.length === 0 ||
    anchors.some(
      (anchor) =>
        content.includes(
          anchor
        )
    )
  );
}

export async function getDailyMission(
  journey: string,
  userId: string,
  options:
    MissionGenerationOptions = {}
): Promise<DailyMission> {
  const [
    brain,
    missionContext,
  ] = await Promise.all([
    loadBrainState(
      userId
    ),

    loadOnboardingContext(
      userId
    ),
  ]);

  const completedTitles =
    brain.completedMissions;

  const path =
    getMissionPath(
      journey,
      missionContext.goal
    );

  const activeMissionTitle =
    options.projectCompletion
      ? brain.activeMission
          ?.mission ?? ""
      : "";

  const blockedTitles = [
    ...completedTitles,

    ...(activeMissionTitle
      ? [activeMissionTitle]
      : []),
  ];

  const projectedAscension =
    options.projectCompletion
      ? calculateAscension(
          brain.ascensionScore +
            Math.max(
              0,
              options.xpReward ??
                0
            )
        )
      : null;

  const projectedBrain =
    options.projectCompletion
      ? {
          ...brain,

          progress:
            projectedAscension
              ?.progressPercent ??
            brain.progress,

          momentum: {
            ...brain.momentum,

            current_streak:
              Math.max(
                1,
                Number(
                  brain.momentum
                    ?.current_streak ??
                    0
                )
              ),

            completed_missions:
              Number(
                brain.momentum
                  ?.completed_missions ??
                  0
              ) + 1,
          },
        }
      : brain;

  const decision =
    decideNextAction(
      projectedBrain
    );

  let available =
    getAvailableMissions(
      path,
      blockedTitles
    );

  /*
   * A discipline priority should avoid
   * unnecessarily complex missions while
   * momentum is rebuilding.
   */

  if (
    decision.priority ===
    "discipline"
  ) {
    available =
      available.filter(
        (mission) =>
          !mission.title
            .toLowerCase()
            .includes(
              "advanced"
            )
      );
  }

  const completedSummary =
    completedTitles
      .slice(-15)
      .map(
        (title) =>
          `- ${title}`
      )
      .join("\n");

  try {
    const {
      groq,
    } = await import(
      "@/lib/atlas/groq"
    );

    const completion =
      await groq.chat.completions.create({
        model:
          GROQ_MODEL,

        ...getGroqReasoningOptions(),

        temperature:
          0.35,

        max_completion_tokens:
          600,

        messages: [
          {
            role:
              "system",

            content: `
You are ATLAS, the strategic mission engine inside ASCEND.

Create exactly ONE mission for today.

LIVE USER CONTEXT

Identity:
${journey}

Mission pathway:
${path}

North Star:
${brain.northStar}

Progress within the current Ascension level:
${projectedBrain.progress}%

Current strategic priority:
${decision.priority}

Reason for this priority:
${decision.explanation}

Onboarding context:
${
  missionContext.prompt ||
  "No additional onboarding context is available."
}

Mission currently being completed:
${
  activeMissionTitle ||
  "None"
}

Previously completed mission titles:
${
  completedSummary ||
  "None"
}

AVAILABLE CURATED MISSION IDEAS

${
  available.length > 0
    ? available
        .slice(0, 5)
        .map(
          (mission) =>
            `- ${mission.title}: ${mission.description}`
        )
        .join("\n")
    : "No unused curated mission remains for this pathway."
}

RULES

- The mission must directly advance the user's North Star.
- Respect the user's identity, immediate goal, declared skills and challenges.
- Never assume the user has a skill they did not declare.
- It must be realistically completable within one day.
- It must produce visible evidence of progress.
- Its description must explain what the user will do, what evidence or deliverable they will produce and why that outcome advances their immediate goal or North Star.
- It must contain one coherent outcome, not several unrelated tasks.
- Do not repeat any completed mission.
- Do not repeat or lightly reword the mission currently being completed.
- Do not generate generic lifestyle, motivation or productivity advice.
- Do not tell the user merely to think, stay positive or keep going.
- Use a curated idea only when it genuinely fits the live context.
- The title must be a plain-language name of 3 to 8 words, not an instruction or paragraph.
- Never put Markdown, asterisks, hashes, quotes, bullets or decorative symbols in the title.
- Keep the description between 60 and 140 words.
- Organize the description with these plain-text labels when useful: Outcome:, Steps:, Evidence:, Why it matters:.
- Put each numbered step on its own line and use no more than three steps.
- Do not use Markdown formatting anywhere in the response.

Return exactly:

TITLE:
...

DESCRIPTION:
...
`,
          },
        ],
      });

    const text =
      completion.choices[0]
        ?.message
        ?.content ?? "";

    const generatedMission =
      parseMission(
        text
      );

    if (
      generatedMission
    ) {
      const alreadyCompleted =
        blockedTitles.some(
          (title) =>
            normalizeTitle(
              title
            ) ===
            normalizeTitle(
              generatedMission.title
            )
        );

      if (
        !alreadyCompleted &&
        isPersonalizedMission(
          generatedMission,
          missionContext
        )
      ) {
        console.info(
          "Atlas Mission Source: personalized-groq"
        );

        return generatedMission;
      }

      console.warn(
        "Atlas rejected a repeated or insufficiently personalized mission response."
      );
    }
  } catch (error) {
    console.error(
      "Personalized Mission Generation Failed:",
      error
    );
  }

  const fallbackMission =
    selectFallbackMission(
      available,
      path,
      blockedTitles
    );

  console.info(
    `Atlas Mission Source: curated-${path.toLowerCase()}-fallback`
  );

  return fallbackMission;
}
