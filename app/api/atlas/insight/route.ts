import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseServer } from "@/lib/supabase-server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { clerkId } = await req.json();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Missing clerkId" },
        { status: 400 }
      );
    }

    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (!profile) {
      return NextResponse.json({
        insight: "I couldn't load your profile.",
      });
    }

    const { data: memory } = await supabaseServer
      .from("atlas_memory")
      .select("role,message")
      .eq("user_id", clerkId)
      .order("created_at", { ascending: false })
      .limit(10);

    const previousMessages =
      memory
        ?.reverse()
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.message,
        })) ?? [];

    const systemPrompt = `
You are ATLAS.

You are not chatting.

You are observing.

Study:

Name: ${profile.full_name}

North Star:
${profile.north_star}

Journey:
${profile.journey}

Progress:
${profile.progress}

Completed Steps:
${profile.completed_steps}

Current Streak:
${profile.current_streak}

Longest Streak:
${profile.longest_streak}

Previous conversations are attached.

Produce ONE strategic insight.

Do not greet.

Do not explain yourself.

Keep it under 120 words.

It should feel like an elite strategist quietly observing the user's growth.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...previousMessages,
        {
          role: "user",
          content:
            "Generate today's strategic insight.",
        },
      ],
    });

    return NextResponse.json({
      insight:
        completion.choices[0]?.message?.content ??
        "No insight available.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      insight: "Unable to generate insight.",
    });
  }
}