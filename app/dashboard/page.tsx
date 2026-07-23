import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAtlasDashboard } from "@/lib/atlas/dashboard";
import { think } from "@/lib/cortex";
import { consultOracle } from "@/lib/engine/oracle";
import AtlasTimeline from "@/app/components/dashboard/AtlasTimeline";
import DailyBriefingCard from "@/app/dashboard/DailyBriefingCard";
import CompassCard from "@/app/dashboard/CompassCard";
import MissionCard from "@/app/dashboard/MissionCard";
import IdentityCard from "@/app/dashboard/IdentityCard";
import ProgressCard from "@/app/dashboard/ProgressCard";
import AscensionProgress from "@/app/dashboard/AscensionProgress";
import OracleCard from "@/app/dashboard/OracleCard";
import RecommendationCard from "@/app/dashboard/RecommendationCard";
import OpportunityRadar from "@/app/dashboard/opportunities/OpportunityRadar";
import { getGreeting } from "@/lib/utils/greeting";
import { Brain } from "lucide-react";

export default async function DashboardPage() {
 const { userId } = await auth();

if (!userId) {
  redirect("/sign-in");
}

const dashboard = await getAtlasDashboard(userId);
  //const decision = think(brain);

  //const oracle = consultOracle(decision);

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
            greeting={dashboard.dailyBriefing.greeting}
            summary={dashboard.dailyBriefing.summary}
            focus={dashboard.dailyBriefing.focus}
            oracle={dashboard.dailyBriefing.oracle}
          />
        </div>

        {/* Compass */}

        <div id="compass" className="mb-6">
          <CompassCard
            northStar={dashboard.compass.northStar}
            alignment={dashboard.compass.alignment}
          />
        </div>

        {/* Dashboard Cards */}

        <div className="columns-1 gap-6 lg:columns-2">

         <div
  id="mission"
  className="mb-6 break-inside-avoid"
>
            <MissionCard
              title={dashboard.mission.title}
              description={dashboard.mission.description}
              missionId={dashboard.mission.missionId}
            />
          </div>

          <div className="mb-6 break-inside-avoid">
          <OracleCard
  title="ATLAS Oracle"
  message="Your future is built by the decisions you make today."
/>
          </div>

          <div className="mb-6 break-inside-avoid">
           <IdentityCard
  title={dashboard.identity.title}
  level={dashboard.identity.level}
/>
          </div>

          <div className="mb-6 break-inside-avoid">
            <ProgressCard
              progress={dashboard.progress.progress}
              momentum={dashboard.progress.momentum}
              message={dashboard.progress.message}
            />
          </div>

          <div className="mb-6 break-inside-avoid">
          <AscensionProgress
  score={Number(dashboard.atlasProgress?.ascension_score ?? 0)}
  level={Number(dashboard.atlasProgress?.level ?? 1)}
/>
          </div>
<div
  id="opportunities"
  className="mb-6 break-inside-avoid"
>
  <div className="mt-6">
  <Link
    href="/opportunities"
    className="flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-slate-800/40 p-5 transition hover:border-cyan-400 hover:bg-slate-800/60"
  >
    <div>
      <h3 className="text-lg font-semibold text-white">
        🌍 Explore Opportunities
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        View your personalized opportunity workspace powered by Atlas.
      </p>
    </div>

    <span className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-900">
      Open →
    </span>
  </Link>
</div>
</div>

        </div>

       {/* Atlas Timeline */}

<div className="mt-6">
  <AtlasTimeline
    timeline={dashboard.timeline}
  />
</div>
        {/* Recommendation */}

        <div className="mt-6">
          <RecommendationCard
            recommendation={dashboard.recommendations[0]}
          />
        </div>

      </div>
    </main>
  );
}