import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getCurrentUserBrain } from "@/lib/services/user";

import { think } from "@/lib/cortex";
import { consultOracle } from "@/lib/engine/oracle";

import DailyBriefingCard from "@/app/dashboard/DailyBriefingCard";
import CompassCard from "@/app/dashboard/CompassCard";
import MissionCard from "@/app/dashboard/MissionCard";
import IdentityCard from "@/app/dashboard/IdentityCard";
import ProgressCard from "@/app/dashboard/ProgressCard";
import AscensionProgress from "@/app/dashboard/AscensionProgress";
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

  const decision = think(brain);

  const oracle = consultOracle(decision);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}

        <div className="mb-6 flex items-center justify-end">

          <Link
            href="/"
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Home
          </Link>

        </div>

        {/* Daily Briefing */}

        <div className="mb-6">
          <DailyBriefingCard
            greeting={brain.dailyBriefing.greeting}
            summary={brain.dailyBriefing.summary}
            focus={brain.dailyBriefing.focus}
            oracle={brain.dailyBriefing.oracle}
          />
        </div>

        {/* Compass */}

        <div className="mb-6">
          <CompassCard
            northStar={brain.northStar}
            alignment={decision.northStarAlignment}
          />
        </div>

        {/* Dashboard Cards */}

        <div className="columns-1 gap-6 lg:columns-2">

          <div className="mb-6 break-inside-avoid">
            <MissionCard
              title={decision.nextMissionTitle}
              description={decision.nextMissionDescription}
              missionId={brain.missions[0]?.id ?? ""}
            />
          </div>

          <div className="mb-6 break-inside-avoid">
            <OracleCard
              title={oracle.title}
              message={oracle.message}
            />
          </div>

          <div className="mb-6 break-inside-avoid">
            <IdentityCard
              title={decision.identityTitle}
              level={decision.identityLevel}
            />
          </div>

          <div className="mb-6 break-inside-avoid">
            <ProgressCard
              progress={brain.progress}
              momentum={brain.momentum}
              message={brain.momentumMessage}
            />
          </div>

          <div className="mb-6 break-inside-avoid">
            <AscensionProgress
              score={brain.atlasProgress.ascension_score}
              level={brain.atlasProgress.level}
            />
          </div>

          <div className="mb-6 break-inside-avoid">
            <OpportunityRadar
              opportunities={brain.opportunities}
            />
          </div>

        </div>

        {/* Timeline */}

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