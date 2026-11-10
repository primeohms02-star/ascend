import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { loadJourney, proposeNextStep } from "@/lib/guidance/journey";
import { consumeAtlasRateLimit } from "@/lib/atlas/rateLimit";
import { supabaseAdmin } from "@/lib/supabase-admin";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export async function GET() {
  const { userId } = await auth();
  if (!userId) return json({ error: "Sign in to continue." }, 401);
  try {
    const { direction, history } = await loadJourney(userId);
    return json({ direction, history });
  } catch {
    return json({ error: "Your guidance could not load. Please retry." }, 503);
  }
}
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Sign in to continue." }, 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object")
    return json({ error: "Invalid request." }, 400);
  try {
    const state = await loadJourney(userId);
    if (!state.context || !state.direction)
      return json({ error: "Complete onboarding to set your direction." }, 409);
    if (body.event === "suggest") {
      if (state.history[0]?.event === "achieved")
        return json(
          {
            error:
              "This goal is marked achieved. Choose a new direction first.",
          },
          409,
        );
      if (
        !(await consumeAtlasRateLimit({
          userId,
          bucket: "journey-suggestions",
          windowSeconds: 86400,
          maxRequests: 8,
        })) ||
        !(await consumeAtlasRateLimit({
          userId: "__ascend_global__",
          bucket: "groq-requests",
          windowSeconds: 60,
          maxRequests: 120,
        }))
      )
        return json(
          {
            error:
              "Atlas has reached its suggestion limit. You can still write your own step.",
          },
          429,
        );
      return json(await proposeNextStep(state));
    }
    const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
    if (
      !["accept", "tried", "stuck", "done", "achieved"].includes(body.event) ||
      !uuid.test(body.id) ||
      !(body.previous === null || uuid.test(body.previous)) ||
      body.direction !== state.direction ||
      typeof body.step !== "string" ||
      !body.step.trim() ||
      body.step.length > 600 ||
      typeof body.note !== "string" ||
      body.note.length > 1500 ||
      (body.event !== "accept" && !body.note.trim())
    )
      return json(
        { error: "Check your step, note and current direction." },
        400,
      );
    const result = await supabaseAdmin.rpc("atlas_record_journey_update", {
      p_user: userId,
      p_id: body.id,
      p_previous: body.previous,
      p_direction: state.direction,
      p_event: body.event,
      p_step: body.step.trim(),
      p_note: body.note.trim(),
    });
    if (result.error) {
      if (result.error.message.includes("JOURNEY_CONFLICT"))
        return json(
          { error: "Your journey changed. Refresh before saving." },
          409,
        );
      throw result.error;
    }
    return json({ saved: true });
  } catch {
    return json(
      {
        error:
          "Atlas could not finish that request. Your existing progress is preserved.",
      },
      503,
    );
  }
}
