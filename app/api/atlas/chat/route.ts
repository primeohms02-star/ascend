import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseServer } from "@/lib/supabase-server";
import {
  updateTodayMission,
  clearTodayMission,
} from "@/lib/atlas/strategy";
import {
  runAtlasBrain,
  extractPermanentMemory,
  generateMission,
} from "@/lib/atlas/brain";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message, clerkId } = await req.json();

    if (!message || !clerkId) {
      return NextResponse.json(
        { error: "Missing message or clerkId" },
        { status: 400 }
      );
    }

    // ---------------------------------
    // Load User Profile
    // ---------------------------------

    const { data: profile, error: profileError } =
      await supabaseServer
        .from("profiles")
        .select("*")
        .eq("clerk_id", clerkId)
        .single();

    if (profileError || !profile) {
      return NextResponse.json({
        reply: "I couldn't find your profile.",
      });
    }

    // ---------------------------------
    // Load Active Mission
    // ---------------------------------

    const { data: currentMission } =
      await supabaseServer
        .from("atlas_missions")
        .select("*")
        .eq("user_id", clerkId)
        .eq("status", "active")
        .single();

        // ---------------------------------
// Ask Groq if the mission is complete
// ---------------------------------

let missionCompleted = false;

if (currentMission) {
  const completionCheck = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    max_completion_tokens: 20,
    messages: [
      {
        role: "system",
        content: `
You determine whether a user's latest message clearly indicates they have completed their current mission.

Reply ONLY:

YES

or

NO
        `,
      },
      {
        role: "user",
        content: `
Current Mission:
${currentMission.mission}

User message:
${message}
        `,
      },
    ],
  });

  missionCompleted =
    completionCheck.choices[0]?.message?.content?.trim() === "YES";
}

// ---------------------------------
// Complete Mission
// ---------------------------------

if (missionCompleted && currentMission) {
  await supabaseServer
    .from("atlas_missions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", currentMission.id);

  await clearTodayMission(clerkId);

  console.log(
    "Mission completed:",
    currentMission.mission
  );
}
// ---------------------------------
// Update Progress + Streak
// ---------------------------------

const today = new Date().toISOString().split("T")[0];

const lastMission =
  profile.last_mission_date
    ? new Date(profile.last_mission_date)
        .toISOString()
        .split("T")[0]
    : null;

let currentStreak = profile.current_streak ?? 0;

if (lastMission === today) {
  // Already completed a mission today
} else {
  if (lastMission) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayString =
      yesterday.toISOString().split("T")[0];

    if (lastMission === yesterdayString) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  } else {
    currentStreak = 1;
  }
}

const longestStreak = Math.max(
  currentStreak,
  profile.longest_streak ?? 0
);

const newProgress = Math.min(
  (profile.progress ?? 0) + 5,
  100
);

const { data, error } = await supabaseServer
  .from("profiles")
  .update({
    progress: newProgress,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_mission_date: new Date().toISOString(),
  })
  .eq("clerk_id", clerkId)
  .select();

console.log("PROFILE UPDATE DATA:", data);
console.log("PROFILE UPDATE ERROR:", error);

  console.log("===== STREAK UPDATE =====");
console.log("Progress:", newProgress);
console.log("Current Streak:", currentStreak);
console.log("Longest Streak:", longestStreak);
console.log("Last Mission:", new Date().toISOString());

console.log(
  "Progress:",
  newProgress,
  "Current:",
  currentStreak,
  "Longest:",
  longestStreak
);
console.log("Progress updated:", newProgress);

    // ---------------------------------
    // Load Conversation Memory
    // ---------------------------------

    const { data: memories } =
      await supabaseServer
        .from("atlas_memory")
        .select("role,message")
        .eq("user_id", clerkId)
        .order("created_at", { ascending: true })
        .limit(50);

    // ---------------------------------
    // Build System Prompt
    // ---------------------------------

    const context = `
You are ATLAS.

You are the AI strategist inside ASCEND.

You permanently remember previous conversations.

User Profile

Name:
${profile.full_name}

North Star:
${profile.north_star}

Journey:
${profile.journey}

Progress:
${profile.progress}%

Completed Steps:
${profile.completed_steps}

Current Streak:
${profile.current_streak}

Longest Streak:
${profile.longest_streak}

Current Mission:
${currentMission?.mission ?? "None"}

Mission Reason:
${currentMission?.reason ?? "None"}

Always answer like a world-class strategist.

Every answer should move the user closer to their North Star.

Keep responses practical.

Avoid generic advice.
`;

   
    // ---------------------------------
    // Ask ATLAS
    // ---------------------------------

  const atlasResult = await runAtlasBrain({
  clerkId,
  message,
});

const reply = atlasResult.reply;

    // ---------------------------------
    // Extract Long-Term Memory
    // ---------------------------------

const fact =
  await extractPermanentMemory(message);

    if (fact !== "NONE") {
      await supabaseServer
        .from("atlas_facts")
        .insert({
          user_id: clerkId,
          fact,
        });
    }
// ---------------------------------
// Generate New Mission
// ---------------------------------

const mission = await generateMission(
  currentMission?.mission ?? null,
  profile.north_star ?? "Discover your purpose",
  message
);

console.log("MISSION RAW:");
console.log(mission);


      // ---------------------------------
    // Save New Mission
    // ---------------------------------

    if (mission !== "NONE") {
      const missionText =
        mission.match(/MISSION:\s*([\s\S]*?)REASON:/)?.[1]?.trim() ??
        "";

      const reasonText =
        mission.match(/REASON:\s*([\s\S]*)/)?.[1]?.trim() ??
        "";

      if (missionText) {
        // Complete previous mission

        await supabaseServer
          .from("atlas_missions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", clerkId)
          .eq("status", "active");

          console.log("Saving mission...");
console.log(missionText);
console.log(reasonText);

        // Create new mission

       console.log("Saving mission...");
console.log(missionText);
console.log(reasonText);
const { data, error } = await supabaseServer
  .from("atlas_missions")
  .insert({
    user_id: clerkId,
    mission: missionText,
    reason: reasonText,
    status: "active",
  })
  .select();

console.log("MISSION INSERT DATA:", data);
console.log("MISSION INSERT ERROR:", error);

await updateTodayMission(
  clerkId,
  missionText
);

      }
    }

    // ---------------------------------
    // Save User Message
    // ---------------------------------

    await supabaseServer
      .from("atlas_memory")
      .insert({
        user_id: clerkId,
        role: "user",
        message,
        current_streak: profile.current_streak,
        longest_streak: profile.longest_streak,
        last_mission_date: new Date().toISOString(),
      });

    // ---------------------------------
    // Save Atlas Reply
    // ---------------------------------

    await supabaseServer
      .from("atlas_memory")
      .insert({
        user_id: clerkId,
        role: "assistant",
        message: reply,
        current_streak: profile.current_streak,
        longest_streak: profile.longest_streak,
        last_mission_date: new Date().toISOString(),
      });

    // ---------------------------------
    // Return Response
    // ---------------------------------

    return NextResponse.json({
      reply,
    });

  } catch (error) {
    console.error("Atlas Error:", error);

    return NextResponse.json(
      {
        reply: "Atlas encountered an error.",
      },
      {
        status: 500,
      }
    );
  }
}