import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import AppShell from "@/app/components/navigation/AppShell";
import AtlasActionPlanDashboard from "./components/AtlasActionPlanDashboard";

import {
  buildPersonalizedOpportunityActionPlan,
  buildPersonalizedOpportunityDecision,
} from "@/lib/atlas/opportunities/personalized-decision";
import {
  createOpportunityRouteId,
  parseOpportunityRouteId,
} from "@/lib/atlas/opportunities/reference";
import { resolveOpportunityForUser } from "@/lib/atlas/opportunities/service";

type Props = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    source?: string;
    filter?: string;
    returnTo?: string;
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

function getSafeReturnPath(value: string | undefined): string {
  if (value === "/opportunities" || value?.startsWith("/opportunities?")) {
    return value;
  }

  return "/opportunities?page=1";
}

export default async function AtlasActionPlanPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { source, filter, returnTo } = await searchParams;

  const { userId } = await auth();

  if (!userId || !source) {
    notFound();
  }

  const { opportunityId, snapshotId } = parseOpportunityRouteId(id);
  const opportunity = await resolveOpportunityForUser(
    userId,
    opportunityId,
    source,
    snapshotId,
  );

  if (!opportunity) {
    notFound();
  }

  const decision = await buildPersonalizedOpportunityDecision(
    userId,
    opportunity,
  );
  const personalizedOpportunity = decision.opportunity;
  const actionPlan = await buildPersonalizedOpportunityActionPlan(decision);
  const initialStatus = decision.status;
  const encodedOpportunityId = encodeURIComponent(
    createOpportunityRouteId(
      personalizedOpportunity.id,
      personalizedOpportunity.snapshotId,
    ),
  );
  const safeReturnTo = getSafeReturnPath(returnTo);

  const decisionPageHref =
    `/opportunities/${encodedOpportunityId}` +
    `?source=${encodeURIComponent(source)}` +
    `&returnTo=${encodeURIComponent(safeReturnTo)}` +
    `${filter ? `&filter=${encodeURIComponent(filter)}` : ""}`;

  const progressStorageId = `${source}:${personalizedOpportunity.id}`;

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
        <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-6 sm:py-10">
          <nav aria-label="Action plan navigation">
            <Link
              href={decisionPageHref}
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            >
              <BackArrowIcon />
              Back to Atlas Decision
            </Link>
          </nav>

          <AtlasActionPlanDashboard
            plan={actionPlan}
            opportunityId={progressStorageId}
            opportunityTitle={personalizedOpportunity.title}
            opportunity={personalizedOpportunity}
            initialStatus={initialStatus}
          />
        </div>
      </main>
    </AppShell>
  );
}
