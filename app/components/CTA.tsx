"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@clerk/nextjs";

import {
  ArrowRight,
} from "lucide-react";

export default function CTA() {
  const { isLoaded, userId } = useAuth();

  const isSignedIn = Boolean(userId);

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#05070B] px-6 py-20 sm:py-24"
    >
      {/* Ambient background */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      </div>

      <div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.12] via-slate-950/90 to-cyan-500/[0.08] px-6 py-12 text-center shadow-[0_0_100px_rgba(37,99,235,0.12)] sm:px-10 md:py-16"
      >
        <div className="relative mx-auto h-16 w-16">
          <Image
            src="/ascend-navbar-logo.png"
            alt=""
            fill
            priority
            sizes="80px"
            className="object-contain"
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
          Your Direction Starts Here
        </p>

        <h2
          id="cta-heading"
          className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          You do not need your
          <br />

          <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            entire future figured out.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg text-slate-300">
          You need a direction, one meaningful next
          action and a system that learns from the
          progress you make.
        </p>

        {!isLoaded ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="h-14 w-full max-w-60 animate-pulse rounded-2xl bg-blue-600/40 sm:w-60" />

            <div className="h-14 w-full max-w-40 animate-pulse rounded-2xl bg-white/5 sm:w-40" />
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-[0_0_35px_rgba(37,99,235,0.3)] transition hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto"
                  >
                    Continue Your Journey

                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    href="/atlas"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10 hover:text-white sm:w-auto"
                  >
                    Talk with Atlas
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-[0_0_35px_rgba(37,99,235,0.3)] transition hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto"
                  >
                    Build Your Compass

                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    href="/sign-in"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/10 hover:text-white sm:w-auto"
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
      </div>
    </section>
  );
}