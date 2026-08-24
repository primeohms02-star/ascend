"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

export default function MusicLandingActions() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <div className="h-[52px] w-full max-w-60 animate-pulse rounded-xl bg-blue-600/35" />
        <div className="h-[52px] w-full max-w-52 animate-pulse rounded-xl bg-white/[0.05]" />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Link
        href={userId ? "/music/pathway" : "/sign-up"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto"
      >
        {userId ? "Open My Music Pathway" : "Build Your Music Pathway"}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>

      <Link
        href="/how-it-works"
        className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold text-slate-200 transition hover:border-blue-300/30 hover:bg-white/[0.08] hover:text-white sm:w-auto"
      >
        See How ASCEND Works
      </Link>
    </div>
  );
}
