import Image from "next/image";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";

import {
  ArrowLeft,
  LockKeyhole,
  LogIn,
  UserPlus,
} from "lucide-react";

import SupportClient from "./SupportClient";
import PublicAccountAccessForm from "./components/PublicAccountAccessForm";

export default async function SupportPage() {
  const { userId } = await auth();

  if (userId) {
    return <SupportClient />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07111f] to-[#0f172a] px-5 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to ASCEND
        </Link>

        <section className="mx-auto max-w-3xl pb-8 pt-12 text-center sm:pt-16">
          <div className="relative mx-auto h-16 w-16">
            <Image
              src="/ascend-navbar-logo.png"
              alt=""
              fill
              priority
              sizes="64px"
              className="object-contain"
            />
          </div>

          <div className="mx-auto mt-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <LockKeyhole size={21} aria-hidden="true" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            ASCEND Support AI
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Sign in to use Support AI.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Support AI is reserved for authenticated ASCEND users so support conversations stay connected to the right account and protected from anonymous misuse.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <LogIn size={17} aria-hidden="true" />
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <UserPlus size={17} aria-hidden="true" />
              Create Account
            </Link>
          </div>
        </section>

        <PublicAccountAccessForm />
      </div>
    </main>
  );
}
