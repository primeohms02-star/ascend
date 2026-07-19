import { analyzePatterns } from "@/lib/atlas/patterns";
import { buildAdaptiveState } from "@/lib/atlas/adaptive";
import { buildAdaptiveMission } from "@/lib/atlas/adaptiveMission";
import { buildAdaptiveOracle } from "@/lib/atlas/adaptiveOracle";
import { buildPrediction } from "@/lib/atlas/predictive";
import { buildWeeklyReview } from "@/lib/atlas/weeklyReview";
import { buildFutureSelf } from "@/lib/atlas/futureSelf";
import { buildDailyBriefing } from "@/lib/atlas/dailyBriefing";
import { rankOpportunities } from "@/lib/atlas/opportunityRanking";
import { createIdentity } from "@/lib/brain/identity";
import { buildTimeline } from "@/lib/atlas/timeline";
import { groq } from "./groq";
import { calculateAscension } from "@/lib/atlas/ascension";
import {
  loadProfile,
  updateProfileProgress,
} from "./profile";

import {
  loadCurrentMission,
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
  const { data: profile, error } =
    await loadProfile(clerkId);

  if (error || !profile) {
    throw new Error("Profile not found.");
  }

  const [
    mission,
    memory,
    atlasMemories,
    strategy,
    knowledge,
    facts,
    reflection,
    momentum,
    journey,
    compassAnswers,
    compassResults,
  ] = await Promise.all([


    
    loadCurrentMission(clerkId),
    loadConversation(clerkId),
    loadAtlasMemories(clerkId),
    loadStrategy(clerkId),
    loadKnowledge(clerkId),
    loadFacts(clerkId),
    loadLatestReflection(clerkId),
    loadMomentum(clerkId),
    loadJourney(clerkId),
    loadCompassAnswers(clerkId),
    loadCompassResults(clerkId),
  ]);

  const patterns = analyzePatterns(
  reflection ? [reflection as any] : []
);

const adaptive = buildAdaptiveState(patterns);

const adaptiveMission =
  buildAdaptiveMission(adaptive);

const adaptiveOracle =
  buildAdaptiveOracle(adaptive);

const ascension =
  calculateAscension(
    profile.progress ?? 0
  );
const identity = {
  title: ascension.title,
  level: ascension.level,
};

const prediction = buildPrediction(
  patterns,
  momentum?.current_streak ?? 0
);

const weeklyReview =
  buildWeeklyReview(
    patterns,
    momentum?.current_streak ?? 0
  );

const futureSelf =
  buildFutureSelf(
    patterns,
    momentum?.current_streak ?? 0,
    profile.progress ?? 0
  );

const dailyBriefing =
  buildDailyBriefing({
    journey:
      profile.journey ?? "Explorer",

    northStar:
      profile.north_star ??
      "Discover your purpose",

    missionTitle:
      adaptiveMission.title,

    progress:
      profile.progress ?? 0,
  });

const opportunities =
  rankOpportunities([], adaptive);

const recommendations = [
  ascension.level < 5
    ? {
        id: "complete-mission",
        title: "Complete Today's Mission",
        description:
          "Build momentum by finishing today's mission.",
        priority: "high" as const,
        category: "Mission",
        action: "Go to Mission",
        href: "#mission",
      }

    : ascension.level < 10
    ? {
        id: "explore-opportunities",
        title: "Explore Opportunities",
        description:
          "Push yourself toward bigger opportunities.",
        priority: "medium" as const,
        category: "Growth",
        action: "Open Opportunities",
        href: "#opportunities",
      }

    : {
        id: "refine-north-star",
        title: "Refine Your North Star",
        description:
          "Review your long-term vision and future direction.",
        priority: "high" as const,
        category: "Vision",
        action: "Open Compass",
        href: "#compass",
      },
];


const timeline =
  buildTimeline(
    atlasMemories as any
  );

  return {
  profile,
  mission,
  memory,
  atlasMemories,
  strategy,
  knowledge,
  facts,
  reflection,
  momentum,
  journey,
  compassAnswers,
  compassResults,

  patterns,
  adaptive,
  adaptiveMission,
  adaptiveOracle,

  identity,

  prediction,
  weeklyReview,
  futureSelf,

  dailyBriefing,

  opportunities,
  recommendations,
  timeline,

  progress: {
    progress: profile.progress ?? 0,
   momentumMessage:
  "Keep moving forward.",
     
  },

  atlasProgress: {
  ascension_score:
    ascension.score,

  level:
    ascension.level,
},

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
${atlas.mission?.mission ?? "None"}

Reason:
${atlas.mission?.reason ?? "None"}

IMPORTANT:

This mission is the user's CURRENT mission.

It replaces every previous mission stored in memory.

Do not mention any previous mission unless the user explicitly asks about their history.

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
        (m: any) =>
          m.role === "user" ||
          m.role === "assistant" ||
          m.role === "atlas"
      )
      .map((m: any) => ({
        role:
          m.role === "atlas"
            ? "assistant"
            : m.role,
        content: m.message,
      })),

    {
      role: "user" as const,
      content: message,
    },
  ];

  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 600,
      messages: conversation as any,
    });

  const reply =
    completion.choices[0]?.message?.content ??
    "I'm thinking...";

  return {
    reply,
    profile: atlas.profile,
    mission: atlas.mission,
    momentum: atlas.momentum,
    strategy: atlas.strategy,
    compassResults: atlas.compassResults,
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
      model: "llama-3.3-70b-versatile",
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
    completion.choices[0]?.message?.content?.trim() ??
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
      model: "llama-3.3-70b-versatile",
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
    completion.choices[0]?.message?.content?.trim() ??
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

  if (fact && fact !== "NONE") {
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
  if (!mission) return;

  await completeMission(mission.id);

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