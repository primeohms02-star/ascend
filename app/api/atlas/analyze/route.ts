import { NextRequest, NextResponse } from "next/server";
import { rewriteOpportunity } from "@/lib/atlas/opportunities/atlas-ai";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Missing description." },
        { status: 400 }
      );
    }

    const analysis = await rewriteOpportunity(description);

    return NextResponse.json({
      analysis,
    });
  } catch (error) {
    console.error("Atlas Analysis Error:", error);

    return NextResponse.json(
      {
        error: "Atlas couldn't analyze this opportunity.",
      },
      { status: 500 }
    );
  }
}