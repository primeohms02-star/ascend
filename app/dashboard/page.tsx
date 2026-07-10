import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getCurrentUserBrain } from "@/lib/services/user";
import { getGreeting } from "@/lib/utils/greeting";

import { think } from "@/lib/brain/brain";
import { consultOracle } from "@/lib/engine/oracle";

import GreetingCard from "@/app/dashboard/GreetingCard";
import CompassCard from "@/app/dashboard/CompassCard";
import MissionCard from "@/app/dashboard/MissionCard";
import ProgressCard from "@/app/dashboard/ProgressCard";
import OracleCard from "@/app/dashboard/OracleCard";
import RecommendationCard from "@/app/dashboard/RecommendationCard";
import OpportunityRadar from "@/app/dashboard/opportunities/OpportunityRadar";
import Timeline from "@/app/dashboard/timeline/Timeline";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const brain = await getCurrentUserBrain();

  // Brain makes all decisions
  const decision = think(brain);

  // Oracle displays the Brain's guidance
  const oracle = consultOracle(decision);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <GreetingCard greeting={getGreeting()} />

          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-100"
          >
            Home
          </Link>
        </div>

        {/* Atlas */}
        <div className="mb-6">
          <CompassCard
            northStar={brain.northStar}
            alignment={decision.northStarAlignment}
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          <MissionCard
            title={decision.nextMissionTitle}
            description={decision.nextMissionDescription}
          />

          <OracleCard
            title={oracle.title}
            message={oracle.message}
          />

          <ProgressCard
            progress={brain.progress}
            momentum={brain.momentum}
            message={brain.momentumMessage}
          />

          <OpportunityRadar
            opportunities={brain.opportunities}
          />

        </div>

        {/* Journey */}
        <div className="mt-6">
          <Timeline />
        </div>

        {/* Recommendation */}
        <div className="mt-6">
          <RecommendationCard
            recommendation={brain.recommendations[0]}
          />
        </div>

      </div>
    </main>
  );
}