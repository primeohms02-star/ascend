import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { discoverOpportunities } from "@/lib/atlas/opportunities/engine";
import { buildOpportunityProfile } from "@/lib/atlas/opportunities/build-profile";
import { rankOpportunities } from "@/lib/atlas/opportunities/intelligence";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  // Temporary profile until Atlas Memory is connected
 const { userId } = await auth();

if (!userId) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const profile = await buildOpportunityProfile({
  clerkId: userId,
});

  const discovered = await discoverOpportunities(profile);

  const ranked = await rankOpportunities(
    discovered,
    profile
  );

  const opportunity = ranked.find(
    (item) => item.id === id
  );

  if (!opportunity) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(opportunity);
}