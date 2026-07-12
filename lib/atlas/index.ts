import { runAtlas } from "./engine";
import { buildBrain } from "./brain";
import { generateMission } from "./mission";
import { getLatestMission, saveMission } from "@/lib/supabase/atlasMission";

export class Atlas {
  constructor(
    private readonly userId: string
  ) {}

  async brain() {
    return buildBrain(this.userId);
  }

  async chat(question: string) {
    return runAtlas(
      this.userId,
      question
    );
  }

  async mission() {
    const latest = await getLatestMission(
      this.userId
    );

    // Reuse today's pending mission
    if (
      latest &&
      latest.status === "pending"
    ) {
      return latest;
    }

    const brain = await this.brain();

    const generated =
      await generateMission(
        JSON.stringify(brain, null, 2)
      );

    await saveMission(
      this.userId,
      generated.mission,
      generated.reason
    );

    return await getLatestMission(
      this.userId
    );
  }
}