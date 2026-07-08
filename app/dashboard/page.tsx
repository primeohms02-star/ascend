import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: answers, error } = await supabaseServer
    .from("compass_answers")
    .select("*")
    .eq("clerk_id", userId)
    .order("question_id", { ascending: true });

  if (error) {
    console.error(error);
  }

  const firstAnswer = answers?.find(
    (answer) => answer.question_id === 1
  )?.answer;

  let northStar =
    "Build a life where your skills create value and your work creates freedom.";

  let nextMission =
    "Spend one focused hour moving toward your biggest goal today.";

  switch (firstAnswer) {
    case "I'm a Student":
      northStar =
        "Become an exceptional graduate and prepare for a world-class career.";
      nextMission =
        "Complete one focused study session today.";
      break;

    case "I Recently Graduated":
      northStar =
        "Launch a meaningful career that aligns with your strengths.";
      nextMission =
        "Apply for one internship or job opportunity today.";
      break;

    case "I'm Employed":
      northStar =
        "Grow into a leader and maximize your professional impact.";
      nextMission =
        "Learn one valuable skill that advances your career.";
      break;

    case "I'm Building a Business":
      northStar =
        "Build a profitable business that creates lasting value.";
      nextMission =
        "Speak with one potential customer today.";
      break;

    case "I'm Changing Careers":
      northStar =
        "Successfully transition into a career you genuinely enjoy.";
      nextMission =
        "Spend one hour learning your new field today.";
      break;

    case "I'm Not Sure Yet":
      northStar =
        "Discover a direction that matches your talents and ambitions.";
      nextMission =
        "Explore one new career path today.";
      break;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">

        <Link
          href="/"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          ← Back to Home
        </Link>

        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-slate-500">
          ASCEND Dashboard
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Welcome, Traveler 👋
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Your journey continues here. Every step you take brings you closer to your North Star.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">

          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">
              🧭 Your North Star
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              {northStar}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">
              🎯 Today's Mission
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              {nextMission}
            </p>
          </div>

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

          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">
              🚀 Continue Journey
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Your personalized roadmap is beginning to take shape.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}