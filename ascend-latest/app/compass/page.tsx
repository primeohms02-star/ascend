"use client";

import Link from "next/link";

export default function CompassPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-xl">

        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          ASCEND Compass
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Before we chart your journey...
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          We want to understand where you are today so ASCEND can guide you
          toward where you truly want to go.
        </p>

        <div className="mt-10 rounded-2xl bg-slate-100 p-6">
          <p className="font-medium">
            This assessment takes about 3 minutes.
          </p>

          <p className="mt-2 text-slate-600">
            There are no right or wrong answers.
          </p>
        </div>

        <Link
          href="/compass/question-1"
          className="mt-10 inline-flex rounded-xl bg-black px-8 py-4 font-semibold text-white transition hover:bg-slate-800"
        >
          Begin Journey →
        </Link>

      </div>
    </main>
  );
}