import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { projectApiError } from "@/lib/projects/api";
import { requireProjectId } from "@/lib/projects/input";
import { getUserProjectWorkspace } from "@/lib/projects/service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    return NextResponse.json(await getUserProjectWorkspace(requireProjectId(id), userId));
  } catch (error) {
    return projectApiError(error);
  }
}
