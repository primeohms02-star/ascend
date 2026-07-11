import { createMission } from "@/lib/supabase/createMission";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase/client";
import { generateMission } from "@/lib/brain/missionEngine";
import { calculateStreak } from "@/lib/brain/streakEngine";

const TOTAL_STEPS = 20;

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

console.log("REQUEST BODY:", body);

const { missionId } = body;

console.log("MISSION ID RECEIVED:", missionId);

  // Complete the mission
  const { error: missionError } = await supabase
    .from("missions")
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq("id", missionId)
    .eq("user_id", userId);

  if (missionError) {
    console.error("Mission update error:", missionError);

    return NextResponse.json(
      { success: false, error: missionError },
      { status: 500 }
    );
  }

  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
  "completed_steps, journey, current_streak, longest_streak"
)
    .eq("clerk_id", userId)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError);

    return NextResponse.json(
      { success: false, error: profileError },
      { status: 500 }
    );
  }

  console.log("Completed steps before update:", profile.completed_steps);

  const completedSteps = (profile.completed_steps ?? 0) + 1;

const progress = Math.min(
  100,
  Math.round((completedSteps / TOTAL_STEPS) * 100)
);

const streak = calculateStreak(
  profile.current_streak ?? 0,
  profile.longest_streak ?? 0
);

  console.log("Updating profile with:", {
    completedSteps,
    progress,
  });

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
   .update({
  completed_steps: completedSteps,
  progress: progress,
  current_streak: streak.currentStreak,
  longest_streak: streak.longestStreak,
})
    .eq("clerk_id", userId);

  console.log("Update error:", updateError);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: updateError },
      { status: 500 }
    );
  }

  // Create the user's next mission
const nextMission = generateMission(
  profile.journey ?? "",
  completedSteps
);
await createMission(
  userId,
  nextMission.title,
  nextMission.description
);

return NextResponse.json({
  success: true,
  completedSteps,
  progress,
});
}