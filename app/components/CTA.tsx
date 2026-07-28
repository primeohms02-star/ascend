"use client";

import Link from "next/link";

import { useAuth } from "@clerk/nextjs";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Compass,
} from "lucide-react";

export default function CTA() {
  const { isLoaded, userId } = useAuth();

  const isSignedIn = Boolean(userId);

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#05070B] px-6 py-28"
    >
      {/* Ambient background */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[170px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.3,
        }}
        transition={{
          duration: 0.65,
        }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.12] via-slate-950/90 to-cyan-500/[0.08] px-6 py-16 text-center shadow-[0_0_100px_rgba(37,99,235,0.12)] sm:px-12 md:py-20"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
          <Compass
            size={30}
            aria-hidden="true"
          />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
          Your Direction Starts Here
        </p>

        <h2
          id="cta-heading"
          className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          You do not need your
          <br />

          <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            entire future figured out.
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
          You need a direction, one meaningful next
          action and a system that learns from the
          progress you make.
        </p>

        {!isLoaded ? (
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="h-14 w-full max-w-60 animate-pulse rounded-2xl bg-blue-600/40 sm:w-60" />

            <div className="h-14 w-full max-w-40 animate-pulse rounded-2xl bg-white/5 sm:w-40" />
          </div>
        ) : (
          <>
            <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_35px_rgba(37,99,235,0.3)] transition hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto"
                  >
                    Continue Your Journey

                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    href="/atlas"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-slate-200 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-white/10 hover:text-white sm:w-auto"
                  >
                    Talk with Atlas
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_35px_rgba(37,99,235,0.3)] transition hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto"
                  >
                    Build Your Compass

                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    href="/sign-in"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-slate-200 backdrop-blur-xl transition hover:border-blue-400/30 hover:bg-white/10 hover:text-white sm:w-auto"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <p className="mt-6 text-sm text-slate-500">
              {isSignedIn
                ? "Return to your live direction, mission and evidence of growth."
                : "Create your profile and receive your first tailored mission."}
            </p>
          </>
        )}
      </motion.div>
    </section>
  );
}