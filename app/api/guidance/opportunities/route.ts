import { supabaseAdmin } from "@/lib/supabase-admin";
import { consumeAtlasRateLimit } from "@/lib/atlas/rateLimit";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAtlasPicks } from "@/lib/guidance/opportunities";
export async function GET() {
  const { userId } = await auth();
  const headers = { "Cache-Control": "private, no-store" };
  if (!userId)
    return NextResponse.json(
      { error: "Sign in required." },
      { status: 401, headers },
    );
  try {
    return NextResponse.json(
      { picks: await getAtlasPicks(userId, true) },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Your matches could not load." },
      { status: 503, headers },
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== "string" || !id.trim() || id.length > 500)
    return NextResponse.json({ error: "Invalid listing." }, { status: 400 });
  if (
    !(await consumeAtlasRateLimit({
      userId,
      bucket: "guidance-hide",
      windowSeconds: 600,
      maxRequests: 30,
    }))
  )
    return NextResponse.json({ error: "Please retry later." }, { status: 429 });
  const { error } = await supabaseAdmin
    .from("atlas_journey_hidden_listings")
    .upsert(
      { user_id: userId, opportunity_id: id },
      { onConflict: "user_id,opportunity_id", ignoreDuplicates: true },
    );
  return error
    ? NextResponse.json(
        { error: "Unable to hide this listing." },
        { status: 503 },
      )
    : NextResponse.json({ saved: true });
}
