import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { selectProjectBriefing, type BriefingProject } from "@/lib/projects/briefing";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    const signal = AbortSignal.timeout(5000);
    const [profile, projects, participations, submissions] = await Promise.all([
      supabaseAdmin.from("profiles").select("north_star").eq("clerk_id", userId).abortSignal(signal).maybeSingle(),
      supabaseAdmin.from("ascend_projects")
        .select("id,title,category,skills,project_type,status,starts_at,join_deadline,submission_deadline,deliverables")
        .eq("project_type", "practice").eq("status", "published")
        .gt("submission_deadline", new Date().toISOString())
        .order("published_at", { ascending: false }).limit(100).abortSignal(signal),
      supabaseAdmin.from("ascend_project_participations").select("project_id,status,updated_at")
        .eq("user_id", userId).abortSignal(signal),
      supabaseAdmin.from("ascend_project_submissions").select("project_id,deliverable_responses")
        .eq("user_id", userId).eq("status", "draft").abortSignal(signal),
    ]);
    // An incomplete ownership/history read must never produce a fresh recommendation.
    if ([profile, projects, participations, submissions].some(result => result.error)) {
      return NextResponse.json({ recommendation: null }, { headers });
    }
    const recommendation = selectProjectBriefing(
      String(profile.data?.north_star ?? ""), projects.data as BriefingProject[],
      participations.data ?? [], submissions.data ?? [],
    );
    return NextResponse.json({ recommendation }, { headers });
  } catch {
    return NextResponse.json({ recommendation: null }, { headers });
  }
}
