import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseServer } from "@/lib/supabase-server";

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

    // Load profile
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (!profile) {
      return NextResponse.json({
        reply: "I couldn't find your profile yet.",
      });
    }

    // Save current user message
    await supabaseServer.from("atlas_memory").insert({
      user_id: clerkId,
      role: "user",
      message,
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      last_mission_date: new Date().toISOString(),
    });

    // Load previous conversation history
    const { data: memory } = await supabaseServer
      .from("atlas_memory")
      .select("role,message")
      .eq("user_id", clerkId)
      .order("created_at", { ascending: false })
      .limit(10);

    

// Load long-term memory
const { data: memoryRows } = await supabaseServer
  .from("atlas_memory")
  .select("message")
  .eq("user_id", clerkId)
  .eq("role", "user")
  .order("created_at", { ascending: true })
  .limit(50);

const memoryFacts =
  memoryRows?.map((m) => `- ${m.message}`).join("\n") ?? "";

    // Build system prompt
    const context = `
You are ATLAS, the strategist inside ASCEND.



This is the user's profile.

Name: ${profile.full_name}
North Star: ${profile.north_star}
Journey: ${profile.journey}
Progress: ${profile.progress}%
Completed Steps: ${profile.completed_steps}
Current Streak: ${profile.current_streak}
Longest Streak: ${profile.longest_streak}


You are not only a chatbot.

You are the user's lifelong strategist.

Before answering any question:

1. Analyze the user's progress.
2. Analyze their streak.
3. Analyze their current journey.
4. Analyze their North Star.
5. Analyze previous conversations.

Begin every conversation with ONE strategic observation.

The observation should never be generic.

It should feel like you have been watching their growth.

After the observation, answer the user's question normally.

Keep responses concise, practical and motivating.

Never repeat the same observation twice if possible.

Always answer like a world-class strategist.

You remember previous conversations with the user.

Be encouraging, concise, practical and strategic.

Always relate your advice to the user's North Star.

Never give generic advice.

The above are facts the user has previously told you.

Treat them as long-term memory.

If the user asks about something they've previously told you, answer using these memories.

Never say "I don't know" if the answer exists in these memories.


`;
    // Ask Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 600,
     messages: [
  {
    role: "system",
    content: context,
  },

  ...(memory ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.message,
  })),

  {
    role: "user",
    content: message,
  },
],
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "I'm thinking... ask me again.";


    // Save Atlas reply
    await supabaseServer.from("atlas_memory").insert({
      user_id: clerkId,
      role: "assistant",
      message: reply,
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      last_mission_date: new Date().toISOString(),
    });

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        reply: "Atlas encountered an error.",
      },
      { status: 500 }

    );
  }
}