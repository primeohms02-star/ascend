import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import {
  getOpportunityStatus,
  saveOpportunity,
} from "@/lib/atlas/opportunities/memory";
import { updatePreference } from "@/lib/atlas/opportunities/preferences";
import type { Opportunity } from "@/lib/atlas/opportunities/types";

function isValidOpportunity(value: unknown): value is Opportunity {
  if (!value || typeof value !== "object") {
    return false;
  }

  const opportunity = value as Partial<Opportunity>;

  return (
    typeof opportunity.id === "string" &&
    opportunity.id.trim().length > 0 &&
    typeof opportunity.title === "string" &&
    opportunity.title.trim().length > 0 &&
    typeof opportunity.company === "string" &&
    opportunity.company.trim().length > 0 &&
    typeof opportunity.source === "string" &&
    opportunity.source.trim().length > 0 &&
    Array.isArray(opportunity.tags)
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { opportunity } = await request.json();

    if (!isValidOpportunity(opportunity)) {
      return NextResponse.json({ error: "Invalid opportunity data" }, { status: 400 });
    }

    const currentStatus = await getOpportunityStatus(userId, opportunity.id);

    if (currentStatus && currentStatus !== "saved" && currentStatus !== "ignored") {
      return NextResponse.json({ success: true, status: currentStatus });
    }

    const { error } = await saveOpportunity(userId, opportunity, "saved");

    if (error) {
      throw error;
    }

    if (opportunity.category) {
      await updatePreference(userId, opportunity.category, 2);
    }

    for (const tag of opportunity.tags) {
      await updatePreference(userId, tag, 1);
    }

    if (opportunity.remote) {
      await updatePreference(userId, "Remote", 1);
    }

    return NextResponse.json({ success: true, status: "saved" });
  } catch (error) {
    console.error("Save Opportunity Error:", error);

    return NextResponse.json(
      { error: "Failed to save opportunity" },
      { status: 500 }
    );
  }
}
