import Link from "next/link";

import { getCurrentUserBrain } from "@/lib/services/user";

export default async function WelcomePage() {
  const brain = await getCurrentUserBrain();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-2xl text-center">

        <div className="mb-10 text-7xl">
          🧭
        </div>

        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
          Welcome to ASCEND
        </p>

        <h1 className="mt-6 text-5xl font-bold text-slate-900">
          We've discovered your direction.
        </h1>

        <div className="my-12 h-px bg-slate-200" />

        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Your Journey
        </p>

        <h2 className="mt-4 text-4xl font-bold">
          {brain.journey}
        </h2>

        <div className="my-12 h-px bg-slate-200" />

        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Your North Star
        </p>

        <p className="mx-auto mt-6 max-w-xl text-2xl leading-relaxed text-slate-700">
          {brain.northStar}
        </p>

        <div className="my-12 h-px bg-slate-200" />

        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Momentum
        </p>

        <h3 className="mt-4 text-2xl font-semibold">
          {brain.momentum}
        </h3>

        <p className="mt-3 text-slate-600">
          {brain.momentumMessage}
        </p>

        <div className="my-12 h-px bg-slate-200" />

        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Your First Mission
        </p>

        <h3 className="mt-4 text-2xl font-semibold">
          {brain.missionTitle}
        </h3>

        <p className="mt-3 text-slate-600">
          {brain.missionTitle}
        </p>

        <Link
          href="/dashboard"
          className="mt-12 inline-block rounded-2xl bg-black px-10 py-4 text-lg font-semibold text-white transition hover:scale-105"
        >
          Begin Journey →
        </Link>

      </div>
    </main>
  );
}