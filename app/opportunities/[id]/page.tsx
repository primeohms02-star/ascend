import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import OpportunityHero from "./components/OpportunityHero";
import AtlasDecisionEngine from "./components/AtlasDecisionEngine";
import OpportunityDescription from "./components/OpportunityDescription";
import OpportunityBackButton from "./components/OpportunityBackButton";

import { getOpportunityById } from "@/lib/atlas/opportunities/connector";
import { generateAtlasInsight } from "@/lib/atlas/opportunities/insight";
import { enrichOpportunityFromOriginalSource } from "@/lib/atlas/opportunities/detail-enrichment";

type Props = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    source?: string;
    returnTo?: string;
  }>;
};

function getSafeReturnPath(
  value: string | undefined
): string {
  if (
    value === "/opportunities" ||
    value?.startsWith(
      "/opportunities?"
    )
  ) {
    return value;
  }

  return "/opportunities?page=1";
}

export default async function OpportunityDetailsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { source, returnTo } = await searchParams;

  const safeReturnTo =
    getSafeReturnPath(returnTo);

  const decodedId = decodeURIComponent(id);

  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  if (!source) {
    notFound();
  }

  const storedOpportunity = await getOpportunityById(
    decodedId,
    source
  );

  if (!storedOpportunity) {
    notFound();
  }

  const opportunity =
    await enrichOpportunityFromOriginalSource(
      storedOpportunity
    );

  const insight = generateAtlasInsight(opportunity);

  const encodedOpportunityId = encodeURIComponent(
    opportunity.id
  );

  const actionPlanHref =
    `/opportunities/${encodedOpportunityId}/action-plan` +
    `?source=${encodeURIComponent(source)}` +
    `&returnTo=${encodeURIComponent(
      safeReturnTo
    )}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Back navigation */}

        <nav aria-label="Opportunity navigation">
          <OpportunityBackButton returnTo={safeReturnTo} />
        </nav>

        <OpportunityHero opportunity={opportunity} />

        <AtlasDecisionEngine
          insight={insight}
          actionPlanHref={actionPlanHref}
        />

        <OpportunityDescription opportunity={opportunity} />
      </div>
    </main>
  );
}