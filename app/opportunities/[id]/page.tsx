import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import OpportunityHero from "./components/OpportunityHero";
import AtlasDecisionEngine from "./components/AtlasDecisionEngine";
import OpportunityDescription from "./components/OpportunityDescription";

import { getOpportunityById } from "@/lib/atlas/opportunities/connector";
import { generateAtlasInsight } from "@/lib/atlas/opportunities/insight";

type Props = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    source?: string;
    filter?: string;
  }>;
};

function BackArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:-translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 12H5m6-6-6 6 6 6"
      />
    </svg>
  );
}

export default async function OpportunityDetailsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { source, filter } = await searchParams;

  const decodedId = decodeURIComponent(id);

  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  if (!source) {
    notFound();
  }

  const opportunity = await getOpportunityById(
    decodedId,
    source
  );

  if (!opportunity) {
    notFound();
  }

  const insight = generateAtlasInsight(opportunity);

  const encodedOpportunityId = encodeURIComponent(
    opportunity.id
  );

  const actionPlanHref =
    `/opportunities/${encodedOpportunityId}/action-plan` +
    `?source=${encodeURIComponent(source)}${
      filter
        ? `&filter=${encodeURIComponent(filter)}`
        : ""
    }`;

  const opportunitiesHref = filter
    ? `/opportunities?filter=${encodeURIComponent(filter)}`
    : "/opportunities";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Back navigation */}

        <nav aria-label="Opportunity navigation">
          <Link
            href={opportunitiesHref}
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <BackArrowIcon />

            Back to Opportunities
          </Link>
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
