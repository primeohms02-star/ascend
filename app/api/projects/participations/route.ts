import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { projectApiError } from "@/lib/projects/api";
import { listUserParticipations } from "@/lib/projects/service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const participations = await listUserParticipations(userId);
    return NextResponse.json({ participations });
  } catch (error) {
    return projectApiError(error);
  }
}
