import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { projectApiError } from "@/lib/projects/api";
import { listUserProjectEvidence } from "@/lib/projects/service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ evidence: await listUserProjectEvidence(userId) });
  } catch (error) {
    return projectApiError(error);
  }
}
