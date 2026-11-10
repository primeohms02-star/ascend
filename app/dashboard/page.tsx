import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {ArrowRight} from "lucide-react";
import AtlasJourney,{OpportunityPicks} from "./AtlasJourney";

import AppShell from "@/app/components/navigation/AppShell";
import { getAtlasDashboard } from "@/lib/atlas/dashboard";
import { loadOnboardingContext } from "@/lib/atlas/onboardingContext";
import { isOnboardingContextComplete } from "@/lib/atlas/onboardingCompletion";

import CompassCard from "@/app/dashboard/CompassCard";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const onboardingContext = await loadOnboardingContext(userId).catch((error) => {
    console.error("Dashboard onboarding check failed:", error);
    return undefined;
  });

  if (onboardingContext !== undefined && !isOnboardingContextComplete(onboardingContext)) {
    redirect("/onboarding");
  }

  const dashboard = await getAtlasDashboard(userId);

  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-8">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Home
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your command centre
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
              See what matters now, where you are going and the evidence of progress you are building.
            </p>
          </header>



          <AtlasJourney key={userId} userId={userId} />
          <OpportunityPicks key={`picks-${userId}`} />

          <section aria-labelledby="direction-heading" className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Direction</p>
                <h2 id="direction-heading" className="mt-1 text-lg font-semibold text-white">Where you are going</h2>
              </div>
              <Link href="/direction" className="hidden text-sm font-medium text-cyan-300 hover:text-cyan-200 sm:inline-flex sm:items-center sm:gap-1.5">
                Open Direction <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <CompassCard northStar={dashboard.compass.northStar} alignment={dashboard.compass.alignment} />
          </section>


          <Link
            href="/progress"
            className="mt-5 grid gap-3 rounded-2xl border border-violet-400/15 bg-violet-400/[0.045] p-4 transition hover:border-violet-300/25 sm:grid-cols-3 sm:items-center"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">Earned Ascension</p>
              <p className="mt-1 text-lg font-bold text-white">Level {dashboard.ascension.level}</p>
              <p className="text-xs text-slate-500">
                {dashboard.ascension.title} stage • {dashboard.identity.title} path
              </p>
            </div>
            <div className="sm:border-l sm:border-white/10 sm:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">XP</p>
              <p className="mt-1 text-lg font-bold text-white">{dashboard.ascension.score}</p>
              <p className="text-xs text-slate-500">{dashboard.ascension.progressPercent}% through this level</p>
            </div>
            <div className="flex items-end justify-between gap-4 sm:border-l sm:border-white/10 sm:pl-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Previous momentum</p>
                <p className="mt-1 text-lg font-bold text-white">{dashboard.progress.momentum}</p>
                <p className="text-xs leading-5 text-slate-500">{dashboard.progress.message}</p>
              </div>
              <ArrowRight size={17} className="mb-1 text-violet-300" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
