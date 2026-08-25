import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import AppShell from "@/app/components/navigation/AppShell";
import AtlasActionPlanDashboard from "./components/AtlasActionPlanDashboard";
import ActionPlanBackButton from "./components/ActionPlanBackButton";

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
            <ActionPlanBackButton decisionPageHref={decisionPageHref} />
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
