import { NextResponse } from "next/server";

import { askAtlas } from "@/lib/services/atlas";

export async function POST(req: Request) {
  const { question } = await req.json();

  const atlas = await askAtlas(question);

  return NextResponse.json({
    answer:
      "Atlas is now connected to your Brain.\n\n" +
      "Next we'll connect a real AI model.",
    context: atlas.context,
  });
}