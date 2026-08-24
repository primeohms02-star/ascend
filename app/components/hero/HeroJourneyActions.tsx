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
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        {isLoaded ? (
          <Link
            href={journeyHref}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-blue-500"
          >
            Start Your Journey →
          </Link>
        ) : (
          <div className="h-[52px] w-52 animate-pulse rounded-xl bg-blue-600/40" />
        )}

        <a
          href="#ascend-in-action"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-medium text-white backdrop-blur-md transition hover:bg-white/10"
        >
          See ASCEND in Action →
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
          Built for anyone with a goal but no
          clear next step.
        </p>
      )}
    </>
  );
}
