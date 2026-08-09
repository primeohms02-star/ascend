import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import AppShell from "@/app/components/navigation/AppShell";
import ContextualAtlasLink from "@/app/components/atlas/ContextualAtlasLink";
import OpportunityHero from "./components/OpportunityHero";
import AtlasDecisionEngine from "./components/AtlasDecisionEngine";
import OpportunityDescription from "./components/OpportunityDescription";
import OpportunityBackButton from "./components/OpportunityBackButton";

import { getOpportunityById } from "@/lib/atlas/opportunities/connector";
import { enrichOpportunityFromOriginalSource } from "@/lib/atlas/opportunities/detail-enrichment";
import { generateAtlasInsight } from "@/lib/atlas/opportunities/insight";

type Props = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    source?: string;
    returnTo?: string;
  }>;
};

function getSafeReturnPath(value: string | undefined): string {
  if (value === "/opportunities" || value?.startsWith("/opportunities?")) {
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
  const safeReturnTo = getSafeReturnPath(returnTo);
  const decodedId = decodeURIComponent(id);

  const { userId } = await auth();

  if (!userId || !source) {
    notFound();
  }

  const storedOpportunity = await getOpportunityById(decodedId, source);

  if (!storedOpportunity) {
    notFound();
  }

  const opportunity = await enrichOpportunityFromOriginalSource(storedOpportunity);
  const insight = generateAtlasInsight(opportunity);
  const encodedOpportunityId = encodeURIComponent(opportunity.id);

  const actionPlanHref =
    `/opportunities/${encodedOpportunityId}/action-plan` +
    `?source=${encodeURIComponent(source)}` +
    `&returnTo=${encodeURIComponent(safeReturnTo)}`;

  const atlasContext = `Opportunity detail page. Opportunity: ${opportunity.title}. Organisation: ${opportunity.company}. Source: ${opportunity.source}. Location: ${opportunity.location ?? "Not specified"}. The user is evaluating this specific opportunity.`;

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
        <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-6 sm:py-10">
          <nav aria-label="Opportunity navigation" className="flex flex-wrap items-center justify-between gap-3">
            <OpportunityBackButton returnTo={safeReturnTo} />

            <ContextualAtlasLink
              prompt={`Help me think through this opportunity: ${opportunity.title}.`}
              context={atlasContext}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-300/35 hover:bg-amber-300/[0.1]"
            >
              Ask Atlas about this opportunity
            </ContextualAtlasLink>
          </nav>

          <OpportunityHero opportunity={opportunity} />

          <AtlasDecisionEngine insight={insight} actionPlanHref={actionPlanHref} />

          <OpportunityDescription opportunity={opportunity} />
        </div>
      </main>
    </AppShell>
  );
}
