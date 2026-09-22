import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { projectApiError } from "@/lib/projects/api";
import { parseProjectListInput } from "@/lib/projects/input";
import { listPublishedProjects } from "@/lib/projects/service";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await listPublishedProjects(parseProjectListInput(request.nextUrl.searchParams));
    return NextResponse.json(result);
  } catch (error) {
    return projectApiError(error);
  }
}
