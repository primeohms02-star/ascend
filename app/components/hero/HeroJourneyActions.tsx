"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function HeroJourneyActions() {
  const { isLoaded, userId } = useAuth();

  const journeyHref = userId
    ? "/onboarding"
    : "/sign-up";

  return (
    <>
      <div className="mt-12 flex flex-col gap-5 sm:flex-row">
        {isLoaded ? (
          <Link
            href={journeyHref}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
          >
            Start Your Journey →
          </Link>
        ) : (
          <div className="h-[60px] w-56 animate-pulse rounded-2xl bg-blue-600/40" />
        )}

        <a
          href="#how-it-works"
          className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-md transition hover:bg-white/10"
        >
          Explore How It Works →
        </a>
      </div>

      {isLoaded && userId ? (
        <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500">
          Your direction can evolve. Start your
          journey again anytime to redefine your
          goal, update your North Star, and receive
          a newly aligned mission from Atlas.
        </p>
      ) : (
        <p className="mt-5 text-sm text-slate-500">
          Create your account and build your
          Compass in minutes.
        </p>
      )}
    </>
  );
}
