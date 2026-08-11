import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getActionSnapshot } from "@/lib/atlas/dashboard";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const action = await getActionSnapshot(userId);
  return NextResponse.json(action);
}
