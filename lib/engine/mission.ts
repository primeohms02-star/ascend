import { MissionLibrary } from "./missionLibrary";
import { getCompletedMissionTitles } from "@/lib/supabase/atlasMission";
import { loadBrainState } from "@/lib/atlas/loadBrainState";
import { decideNextAction } from "@/lib/atlas/decisionEngine";
export type DailyMission = {
  title: string;
  description: string;
};

export async function getDailyMission(
  journey: string,
  userId: string
): Promise<DailyMission> {

  const missions =
    MissionLibrary[
      journey as keyof typeof MissionLibrary
    ] ?? [];

  const completed =
    await getCompletedMissionTitles(userId);

    const brain = await loadBrainState(userId);

const decision = decideNextAction(brain);

 let available =
  missions.filter(
    (mission) =>
      !completed.includes(mission.title)
  );

if (decision.priority === "discipline") {
  available = available.filter(
    (m) =>
      !m.title.toLowerCase().includes("advanced")
  );
}

if (decision.priority === "growth") {
  available = available.sort(() => Math.random() - 0.5);
}

 const { groq } = await import("@/lib/atlas/groq");

if (available.length === 0) {

  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      temperature: 0.8,

      max_completion_tokens: 200,

      messages: [
        {
          role: "system",

          content: `
You are ATLAS.

Create ONE strategic mission.

Journey:
${journey}

Rules:

The mission must be specific.

It must move the user closer to mastery.

Do not repeat common advice.

Return ONLY:

TITLE:
...

DESCRIPTION:
...
`,
        },
      ],
    });

  const text =
    completion.choices[0]?.message?.content ?? "";

  const title =
    text.match(/TITLE:(.*)/)?.[1]?.trim() ??
    "Advance";

  const description =
    text.match(/DESCRIPTION:(.*)/)?.[1]?.trim() ??
    "Keep moving toward your North Star.";

  return {
    title,
    description,
  };
}

  const randomIndex = Math.floor(
    Math.random() * available.length
  );

  return available[randomIndex];
}