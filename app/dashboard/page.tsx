import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          ASCEND Dashboard
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Welcome back, Traveler 👋
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Your journey continues here. Every step you take brings you closer to
          your North Star.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* North Star */}
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">
              🧭 Your North Star
            </h2>

            <p className="mt-4 text-slate-600 leading-7">
              Build a life where your skills create value, your work creates
              freedom, and your decisions are intentional.
            </p>
          </div>

          {/* Next Step */}
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">
              🎯 Today's Next Step
            </h2>

            <p className="mt-4 text-slate-600 leading-7">
              Spend one focused hour moving toward your biggest goal today.
            </p>
          </div>

          {/* Progress */}
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">
              📈 Journey Progress
            </h2>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-1/4 rounded-full bg-black"></div>
            </div>

            <p className="mt-4 text-slate-600">
              25% Complete
            </p>
          </div>

          {/* Continue */}
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">
              🚀 Continue Journey
            </h2>

            <p className="mt-4 text-slate-600 leading-7">
              Soon your personalized roadmap, AI Coach and weekly missions will
              appear here.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}