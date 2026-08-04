"use client";

import Link from "next/link";

import {
  useAuth,
} from "@clerk/nextjs";

import Compass from "@/app/components/compass/";

import HeroBackground from "./HeroBackground";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  const {
    isLoaded,
    userId,
  } = useAuth();

  /*
   * Signed-out visitors create an account first.
   * Signed-in users can revisit onboarding to
   * redefine their goal and North Star.
   */
  const journeyHref =
    userId
      ? "/onboarding"
      : "/sign-up";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05070B]">
      <HeroBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col-reverse items-center justify-center gap-20 px-6 pt-24 lg:flex-row lg:px-10">
        {/* LEFT */}

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl">
            Your life
            <br />
            doesn&apos;t come
            <br />
            with a{" "}
            <span className="text-blue-500">
              map.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
            ASCEND helps you understand who you are,
            define your North Star, take strategic
            action, discover relevant opportunities
            and build evidence of meaningful growth.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500 lg:justify-start">
            <span>Direction</span>
            <span className="text-blue-500">•</span>
            <span>Atlas Intelligence</span>
            <span className="text-blue-500">•</span>
            <span>Real Opportunities</span>
            <span className="text-blue-500">•</span>
            <span>Measurable Growth</span>
          </div>

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

          <div className="mt-12">
            <ScrollIndicator />
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex flex-1 items-center justify-center">
          <Compass
            size={460}
          />
        </div>
      </div>
    </section>
  );
}
