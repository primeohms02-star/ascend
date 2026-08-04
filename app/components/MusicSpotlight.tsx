"use client";

import Link from "next/link";

import {
  useAuth,
} from "@clerk/nextjs";

import {
  motion,
} from "framer-motion";

import {
  ArrowRight,
  AudioLines,
  Compass,
  Headphones,
  MapPin,
  Music2,
  Radio,
  Sparkles,
  Target,
} from "lucide-react";

const pathwaySignals = [
  {
    icon: Headphones,
    label: "Music identity",
    detail: "Roles, genres and career stage",
  },
  {
    icon: Target,
    label: "Music North Star",
    detail: "A clear creative direction",
  },
  {
    icon: Compass,
    label: "Atlas strategy",
    detail: "Context-aware career decisions",
  },
  {
    icon: Radio,
    label: "Opportunity Radar",
    detail: "Nigeria, Africa and the world",
  },
];

export default function MusicSpotlight() {
  const {
    isLoaded,
    userId,
  } = useAuth();

  const pathwayHref = userId
    ? "/music"
    : "/sign-up";

  return (
    <section
      id="ascend-music"
      aria-labelledby="music-heading"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.06] bg-[#05060A] px-6 py-24 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[150px]" />
        <div className="absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full bg-violet-600/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <motion.div
          initial={{
            opacity: 0,
            x: -24,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.65,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-2 text-sm font-semibold text-fuchsia-200">
            <Music2
              size={16}
              aria-hidden="true"
            />

            A specialist pathway inside ASCEND
          </div>

          <h2
            id="music-heading"
            className="mt-7 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Your sound deserves
            <br />

            <span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              more than exposure.
            </span>
          </h2>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            ASCEND Music helps artists, producers,
            songwriters, DJs and music professionals
            define where they are going—and find the
            opportunities that can move them forward.
          </p>

          <p className="mt-5 max-w-2xl leading-7 text-slate-500">
            Built with African talent in mind. Your
            Music Pathway strengthens Atlas and the
            Opportunity Engine without replacing your
            main North Star, mission or progress.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            {isLoaded ? (
              <Link
                href={pathwayHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-fuchsia-500 px-7 py-4 font-semibold text-white shadow-[0_0_35px_rgba(217,70,239,0.22)] transition hover:-translate-y-0.5 hover:bg-fuchsia-400"
              >
                Build Your Music Pathway

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <div className="h-14 w-64 animate-pulse rounded-2xl bg-fuchsia-500/30" />
            )}

            <Link
              href={userId ? "/opportunities" : "/sign-up"}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-slate-200 backdrop-blur-xl transition hover:border-fuchsia-300/25 hover:bg-white/10 hover:text-white"
            >
              Explore Music Opportunities
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 28,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            delay: 0.12,
            duration: 0.7,
          }}
          className="relative"
        >
          <div className="absolute inset-10 rounded-full bg-fuchsia-500/15 blur-[90px]" />

          <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/15 bg-gradient-to-br from-fuchsia-500/[0.12] via-[#0B0A13]/95 to-cyan-500/[0.06] p-5 shadow-[0_0_100px_rgba(168,85,247,0.1)] sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-200">
                  <AudioLines
                    size={24}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
                    ASCEND Music
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Creative direction system
                  </p>

                  <p className="mt-2 text-xs font-medium text-fuchsia-200/80">
                    For those interested in the music industry
                  </p>
                </div>
              </div>

              <Sparkles
                size={22}
                className="text-cyan-300"
                aria-hidden="true"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {pathwaySignals.map((signal) => {
                const Icon = signal.icon;

                return (
                  <div
                    key={signal.label}
                    className="rounded-2xl border border-white/[0.08] bg-slate-950/50 p-4"
                  >
                    <Icon
                      size={20}
                      className="text-fuchsia-300"
                      aria-hidden="true"
                    />

                    <h3 className="mt-4 font-semibold text-white">
                      {signal.label}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {signal.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-400/[0.05] p-4">
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-0.5 shrink-0 text-cyan-300"
                  aria-hidden="true"
                />

                <p className="text-sm leading-6 text-slate-300">
                  Discover grants, showcases,
                  residencies, competitions, training
                  and industry opportunities across
                  Nigeria, Africa and the world.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
