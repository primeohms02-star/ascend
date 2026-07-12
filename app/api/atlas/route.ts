import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { Atlas } from "@/lib/atlas";

export async function POST(req: Request) {
  const { question } = await req.json();

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const atlas = new Atlas(userId);

  const result = await atlas.chat(question);

  return NextResponse.json(result);
}