import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import OpportunityHero from "./components/OpportunityHero";
import OpportunityDescription from "./components/OpportunityDescription";

import { buildOpportunityProfile } from "@/lib/atlas/opportunities/build-profile";
import { discoverOpportunities } from "@/lib/atlas/opportunities/engine";
import { rankOpportunities } from "@/lib/atlas/opportunities/intelligence";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OpportunityDetailsPage({
  params,
}: Props) {

  const { id } = await params;

  const { userId } = await auth();

  if (!userId) {
    notFound();
  }


  // Build user's Atlas opportunity profile
  const profile = await buildOpportunityProfile({
    clerkId: userId,
  });


  // Discover opportunities
  const discovered = await discoverOpportunities(
    profile
  );


  // Rank using Atlas intelligence
  const ranked = await rankOpportunities(
    discovered,
    profile
  );


  // Find selected opportunity
  const opportunity = ranked.find(
    (item) => item.id === id
  );


  if (!opportunity) {
    notFound();
  }


  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">

      <div className="mx-auto max-w-6xl px-6 py-10">

        <OpportunityHero
          opportunity={opportunity}
        />


        <OpportunityDescription
          opportunity={opportunity}
        />

      </div>

    </main>
  );
}