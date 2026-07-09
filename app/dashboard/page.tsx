import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getCurrentUserBrain } from "@/lib/services/user";
import { getGreeting } from "@/lib/utils/greeting";
import { getRecommendations } from "@/lib/engine/recommendations";

import GreetingCard from "@/app/dashboard/GreetingCard";
import CompassCard from "@/app/dashboard/CompassCard";
import MissionCard from "@/app/dashboard/MissionCard";
import ProgressCard from "@/app/dashboard/ProgressCard";
import RecommendationCard from "@/app/dashboard/RecommendationCard";
import OracleCard from "@/app/dashboard/OracleCard";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const brain = await getCurrentUserBrain();

  const recommendations = getRecommendations(brain.journey);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">

        <Link
          href="/"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          ← Back to Home
        </Link>

        {/* Greeting */}

        <div className="mt-8">
          <GreetingCard greeting={getGreeting()} />
        </div>

        {/* Atlas */}

        <div className="mt-10">
          <CompassCard
            northStar={brain.northStar}
            alignment={brain.progress}
          />
        </div>

        {/* Dashboard Cards */}

        <div className="mt-12 grid gap-6 md:grid-cols-2">

          <MissionCard
            title={brain.missionTitle}
            description={brain.missionDescription}
          />

          <ProgressCard
            progress={brain.progress}
            momentum={brain.momentum}
            message={brain.momentumMessage}
          />

          <RecommendationCard
            recommendation={recommendations[0]}
          />

<OracleCard
  title="Today's Insight"
  message="Consistency compounds. Focus on completing today's mission before chasing tomorrow's goals."
/>
        </div>

      </div>
    </main>
  );
}