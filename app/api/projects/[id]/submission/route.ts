import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { projectApiError } from "@/lib/projects/api";
import { parseProjectSubmissionInput, requireProjectId } from "@/lib/projects/input";
import { getUserSubmission, saveUserSubmission } from "@/lib/projects/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    const submission = await getUserSubmission(requireProjectId(id), userId);
    return NextResponse.json({ submission });
  } catch (error) {
    return projectApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  return updateSubmission(request, context, false);
}

export async function POST(request: Request, context: RouteContext) {
  return updateSubmission(request, context, true);
}

async function updateSubmission(request: Request, context: RouteContext, submit: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    const input = parseProjectSubmissionInput(await request.json());
    const submission = await saveUserSubmission(requireProjectId(id), userId, input, submit);
    return NextResponse.json({ success: true, submission });
  } catch (error) {
    return projectApiError(error);
  }
}
