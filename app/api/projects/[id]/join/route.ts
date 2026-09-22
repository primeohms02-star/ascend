import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { projectApiError } from "@/lib/projects/api";
import { requireProjectId } from "@/lib/projects/input";
import { joinProject } from "@/lib/projects/service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const participation = await joinProject(requireProjectId(id), userId);
    return NextResponse.json({ success: true, participation });
  } catch (error) {
    return projectApiError(error);
  }
}
