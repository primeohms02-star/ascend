import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { completeLatestMission } from "@/lib/supabase/atlasMission";
import { completeMission } from "@/lib/atlas/momentum";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

await completeLatestMission(userId);

const momentum =
  await completeMission(userId);
  

  return NextResponse.json(momentum);
}