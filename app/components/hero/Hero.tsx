"use client";

import Compass from "@/app/components/compass/";

import HeroBackground from "./HeroBackground";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05070B]">
      <HeroBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col-reverse items-center justify-center gap-20 px-6 pt-24 lg:flex-row lg:px-10">

        {/* LEFT */}

        <div className="flex-1 text-center lg:text-left">

          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl">
            Your life
            <br />
            doesn't come
            <br />
            with a{" "}
            <span className="text-blue-500">
              map.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
            ASCEND helps you understand where you are,
            discover opportunities, and confidently
            decide what to do next.
          </p>

          <div className="mt-12 flex flex-col gap-5 sm:flex-row">

            <button className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-500">
              Start Your Journey →
            </button>

            <button className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-md transition hover:bg-white/10">
              Explore Work →
            </button>

          </div>

          <div className="mt-16">
            <ScrollIndicator />
          </div>

        </div>

        {/* RIGHT */}

        <div className="flex flex-1 items-center justify-center">

          <Compass size={460} />

        </div>

      </div>
    </section>
  );
}