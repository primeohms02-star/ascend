import {
  MissionLibrary,
  type MissionPath,
  type MissionTemplate,
} from "./missionLibrary";

import {
  getCompletedMissionTitles,
} from "@/lib/supabase/atlasMission";

import {
  loadBrainState,
} from "@/lib/atlas/loadBrainState";

import {
  decideNextAction,
} from "@/lib/atlas/decisionEngine";

import {
  supabaseServer,
} from "@/lib/supabase-server";

export type DailyMission = {
  title: string;

  description: string;
};

function getMissionPath(
  journey: string
): MissionPath {
  const normalized =
    journey
      .trim()
      .toLowerCase();

  const paths: Record<
    string,
    MissionPath
  > = {
    explorer: "Explorer",

    student: "Scholar",

    scholar: "Scholar",

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
  const title =
    text.match(
      /TITLE:\s*(.+)/i
    )?.[1]?.trim();

  const description =
    text.match(
      /DESCRIPTION:\s*([\s\S]*)/i
    )?.[1]?.trim();

  if (
    !title ||
    !description
  ) {
    return null;
  }

  return {
    title,
    description,
  };
}

async function loadOnboardingContext(
  userId: string
): Promise<string> {
  const {
    data,
    error,
  } = await supabaseServer
    .from("atlas_facts")
    .select("fact")
    .eq("user_id", userId)
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(10);

  if (error) {
    console.error(
      "Mission context load error:",
      error
    );

    return "";
  }

  const onboardingFact =
    data?.find(
      (item) =>
        typeof item.fact ===
          "string" &&
        item.fact.includes(
          "Immediate goal:"
        ) &&
        item.fact.includes(
          "Current challenges:"
        )
    )?.fact;

  return (
    onboardingFact ?? ""
  );
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
  available: MissionTemplate[],
  path: MissionPath
): DailyMission {
  if (available.length > 0) {
    return available[
      Math.floor(
        Math.random() *
          available.length
      )
    ];
  }

  const fallbackByPath: Record<
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
  };

  return fallbackByPath[
    path
  ];
}

export async function getDailyMission(
  journey: string,
  userId: string
): Promise<DailyMission> {
  const [
    completedTitles,
    brain,
    onboardingContext,
  ] = await Promise.all([
    getCompletedMissionTitles(
      userId
    ),

    loadBrainState(userId),

    loadOnboardingContext(
      userId
    ),
  ]);

  const path =
    getMissionPath(journey);

  const decision =
    decideNextAction(brain);

  let available =
    getAvailableMissions(
      path,
      completedTitles
    );

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
    const { groq } =
      await import(
        "@/lib/atlas/groq"
      );

    const completion =
      await groq.chat.completions.create(
        {
          model:
            "llama-3.3-70b-versatile",

          temperature: 0.35,

          max_completion_tokens: 260,

          messages: [
            {
              role: "system",

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

Journey progress:
${brain.progress}%

Current strategic priority:
${decision.priority}

Onboarding context:
${
  onboardingContext ||
  "No additional onboarding context is available."
}

Previously completed mission titles:
${
  completedSummary ||
  "None"
}

AVAILABLE CURATED MISSION IDEAS

${available
  .slice(0, 5)
  .map(
    (mission) =>
      `- ${mission.title}: ${mission.description}`
  )
  .join("\n")}

RULES

- The mission must directly advance the user's North Star.
- Respect the user's identity, immediate goal and challenges.
- It must be realistically completable within one day.
- It must produce visible evidence of progress.
- It must contain one coherent outcome, not several unrelated tasks.
- Do not repeat any completed mission.
- Do not generate generic lifestyle, motivation or productivity advice.
- Do not tell the user merely to think, stay positive or keep going.
- Use a curated idea only when it genuinely fits the live context.
- Keep the title concise.
- Keep the description specific and actionable.

Return exactly:

TITLE:
...

DESCRIPTION:
...
`,
            },
          ],
        }
      );

    const text =
      completion.choices[0]
        ?.message?.content ??
      "";

    const generatedMission =
      parseMission(text);

    if (generatedMission) {
      const alreadyCompleted =
        completedTitles.some(
          (title) =>
            normalizeTitle(
              title
            ) ===
            normalizeTitle(
              generatedMission.title
            )
        );

      if (!alreadyCompleted) {
        return generatedMission;
      }
    }
  } catch (error) {
    console.error(
      "Personalized mission generation failed:",
      error
    );
  }

  return selectFallbackMission(
    available,
    path
  );
}