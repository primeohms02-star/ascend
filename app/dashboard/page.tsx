import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getCurrentUserBrain } from "@/lib/services/user";
import { getGreeting } from "@/lib/utils/greeting";
import { getRecommendations } from "@/lib/engine/recommendations";

import GreetingCard from "@/app/dashboard/GreetingCard";
import NorthStarCard from "@/app/dashboard/NorthStarCard";
import MissionCard from "@/app/dashboard/MissionCard";
import ProgressCard from "@/app/dashboard/ProgressCard";
import RecommendationCard from "@/app/dashboard/RecommendationCard";
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

        <div className="mt-8">
          <GreetingCard greeting={getGreeting()} />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">

          <NorthStarCard
            northStar={brain.northStar}
          />

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

        </div>

      </div>
    </main>
  );
}