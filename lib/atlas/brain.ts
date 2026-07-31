import {
  getCurrentUserBrain,
} from "@/lib/services/user";

import {
  buildTimeline,
} from "@/lib/atlas/timeline";

import { groq } from "./groq";

import {
  updateProfileProgress,
} from "./profile";

import {
  createMission,
  completeMission,
} from "./missions";

import {
  loadConversation,
  loadAtlasMemories,
  saveUserMessage,
  saveAtlasReply,
  saveFact,
} from "./memory";

import {
  loadStrategy,
} from "./strategy";

import {
  loadKnowledge,
} from "./knowledge";

import {
  loadFacts,
} from "./facts";

import {
  loadLatestReflection,
} from "./reflections";

import {
  loadMomentum,
} from "./momentum";

import {
  loadJourney,
} from "./journey";

import {
  loadCompassAnswers,
} from "../compass/answers";

import {
  loadCompassResults,
} from "../compass/results";

/*
|--------------------------------------------------------------------------
| LOAD COMPLETE ATLAS CONTEXT
|--------------------------------------------------------------------------
*/

export async function loadAtlasContext(
  clerkId: string
) {
  const brain =
    await getCurrentUserBrain();

  const [
    strategy,
    knowledge,
    facts,
    reflection,
    momentum,
    journey,
    compassAnswers,
    compassResults,
    memory,
    atlasMemories,
  ] = await Promise.all([
    loadStrategy(clerkId),
    loadKnowledge(clerkId),
    loadFacts(clerkId),
    loadLatestReflection(clerkId),
    loadMomentum(clerkId),
    loadJourney(clerkId),
    loadCompassAnswers(clerkId),
    loadCompassResults(clerkId),
    loadConversation(clerkId),
    loadAtlasMemories(clerkId),
  ]);

  return {
    ...brain,

    strategy,
    knowledge,
    facts,
    reflection,
    momentum,
    journey,

    compassAnswers,
    compassResults,

    memory,
    atlasMemories,

    timeline:
      buildTimeline(
        atlasMemories as any
      ),
  };
}

/*
|--------------------------------------------------------------------------
| BUILD COMPLETE SYSTEM PROMPT
|--------------------------------------------------------------------------
*/

export async function buildAtlasContext(
  clerkId: string
) {
  const atlas =
    await loadAtlasContext(clerkId);

  const mission =
    atlas.missions?.find(
      (mission: any) =>
        mission.status === "active"
    ) ?? null;

  const systemPrompt = `
You are the AI strategist inside ASCEND.

You have access to BOTH memory and live user data.

The live user data ALWAYS has higher priority than memory.

Memory is useful only for personality, preferences, history and long-term context.

Never use memory to determine the user's current mission, current level, current progress, current North Star, current strategy or current opportunities.

Those always come from the LIVE CONTEXT below.

If memory conflicts with the live context, IGNORE the memory completely.

Never tell the user an old mission.

Never tell the user an old North Star.

Never tell the user outdated progress.

Always trust the live context.

=============================
PROFILE
=============================

Name:
${atlas.profile.full_name}

Journey:
${atlas.profile.journey}

North Star:
${atlas.profile.north_star}

Progress:
${atlas.profile.progress}%

Completed Steps:
${atlas.profile.completed_steps}

=============================
CURRENT MISSION (LIVE)
=============================

Mission:
${mission?.mission ?? "None"}

Reason:
${mission?.reason ?? "None"}

IMPORTANT:

This mission is the user's CURRENT mission.

It replaces every previous mission stored in memory.

If no active mission is shown, the user currently has no active mission.

Do not present a completed, skipped or historical mission as current.

Do not create, replace or complete a mission during an ordinary conversation.

Do not mention a previous mission unless the user explicitly asks about mission history.

=============================
LONG-TERM USER FACTS
=============================

${JSON.stringify(atlas.facts)}

These are stable facts about the user.

Use them to personalize responses.

Never use them to determine the user's current mission, progress, level or strategy.

=============================
LATEST REFLECTION
=============================

${JSON.stringify(atlas.reflection)}

=============================
MOMENTUM
=============================

${JSON.stringify(atlas.momentum)}

=============================
JOURNEY
=============================

${JSON.stringify(atlas.journey)}

=============================
COMPASS RESULTS
=============================

${JSON.stringify(atlas.compassResults)}

=============================
COMPASS ANSWERS
=============================

${JSON.stringify(atlas.compassAnswers)}

Always think strategically.

Never generate random lifestyle advice.

Every response should move the user toward their North Star.
`;

  return {
    ...atlas,
    systemPrompt,
  };
}

/*
|--------------------------------------------------------------------------
| RUN ATLAS
|--------------------------------------------------------------------------
*/

export async function runAtlasBrain({
  clerkId,
  message,
}: {
  clerkId: string;
  message: string;
}) {
  const atlas =
    await buildAtlasContext(clerkId);

  const conversation = [
    {
      role: "system" as const,
      content: atlas.systemPrompt,
    },

    ...(atlas.memory ?? [])
      .slice(-12)
      .filter(
        (memory: any) =>
          memory.role === "user" ||
          memory.role === "assistant" ||
          memory.role === "atlas"
      )
      .map((memory: any) => ({
        role:
          memory.role === "atlas"
            ? "assistant"
            : memory.role,

        content:
          memory.message,
      })),

    {
      role: "user" as const,
      content: message,
    },
  ];

  const completion =
    await groq.chat.completions.create({
      model:
        "llama-3.3-70b-versatile",

      temperature: 0.7,

      max_completion_tokens: 600,

      messages:
        conversation as any,
    });

  const reply =
    completion.choices[0]
      ?.message?.content ??
    "I'm thinking...";

  const mission =
    atlas.missions?.find(
      (storedMission: any) =>
        storedMission.status === "active"
    ) ?? null;

  return {
    reply,
    profile:
      atlas.profile,
    mission,
    momentum:
      atlas.momentum,
    strategy:
      atlas.strategy,
    compassResults:
      atlas.compassResults,
  };
}

/*
|--------------------------------------------------------------------------
| EXTRACT PERMANENT MEMORY
|--------------------------------------------------------------------------
*/

export async function extractPermanentMemory(
  message: string
) {
  const completion =
    await groq.chat.completions.create({
      model:
        "llama-3.3-70b-versatile",

      temperature: 0,

      max_completion_tokens: 120,

      messages: [
        {
          role: "system",

          content: `
You are the permanent memory system for ATLAS.

Only store information that is likely to remain true for months or years.

Examples of good memories:
- Long-term goals
- Personal values
- Career ambitions
- Skills
- Preferences
- Strengths
- Weaknesses
- Identity

Never store:
- Current mission
- Current task
- Current streak
- Current level
- Temporary plans
- Deadlines
- Conversations
- Progress updates
- Anything that belongs to the current session

If the message does not contain a permanent fact, reply with:

NONE

Return ONLY the fact or NONE.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

  return (
    completion.choices[0]
      ?.message?.content
      ?.trim() ??
    "NONE"
  );
}

/*
|--------------------------------------------------------------------------
| GENERATE NEXT STRATEGIC MISSION
|--------------------------------------------------------------------------
*/

export async function generateMission(
  currentMission: string | null,
  northStar: string,
  userMessage: string
) {
  const completion =
    await groq.chat.completions.create({
      model:
        "llama-3.3-70b-versatile",

      temperature: 0,

      max_completion_tokens: 220,

      messages: [
        {
          role: "system",

          content: `
You are ATLAS.

Create the NEXT strategic mission that moves this user closer to their North Star.

North Star:
${northStar}

Rules:

Never generate generic productivity advice.

Never create random lifestyle tasks.

Only create missions directly connected to the user's long-term direction.

If the current mission is still appropriate, reply ONLY:

NONE

Otherwise reply EXACTLY:

MISSION:
...

REASON:
...
`,
        },
        {
          role: "user",

          content: `
Current Mission:
${currentMission ?? "None"}

Latest User Message:
${userMessage}
`,
        },
      ],
    });

  return (
    completion.choices[0]
      ?.message?.content
      ?.trim() ??
    "NONE"
  );
}

/*
|--------------------------------------------------------------------------
| SAVE CONVERSATION
|--------------------------------------------------------------------------
*/

export async function persistAtlasResponse({
  clerkId,
  profile,
  userMessage,
  reply,
  fact,
}: {
  clerkId: string;
  profile: any;
  userMessage: string;
  reply: string;
  fact: string;
}) {
  await saveUserMessage(
    clerkId,
    userMessage,
    profile
  );

  await saveAtlasReply(
    clerkId,
    reply,
    profile
  );

  if (
    fact &&
    fact !== "NONE"
  ) {
    await saveFact(
      clerkId,
      fact
    );
  }
}

/*
|--------------------------------------------------------------------------
| COMPLETE MISSION
|--------------------------------------------------------------------------
*/

export async function completeCurrentMission(
  mission: any,
  clerkId: string,
  profile: any
) {
  if (!mission) {
    return;
  }

  await completeMission(
    mission.id
  );

  await updateProfileProgress(
    clerkId,
    profile
  );
}

/*
|--------------------------------------------------------------------------
| CREATE MISSION
|--------------------------------------------------------------------------
*/

export async function createNewMission(
  clerkId: string,
  mission: string,
  reason: string
) {
  return await createMission(
    clerkId,
    mission,
    reason
  );
}