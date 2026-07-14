import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import UserMenu from "./UserMenu";

export default async function Navbar() {
  const { userId } = await auth();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto mt-5 flex w-[95%] max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

        {/* Logo */}

        <Link
          href="/"
          className="text-2xl font-black tracking-[0.25em] text-white transition hover:text-blue-400"
        >
          ASCEND
        </Link>

        {/* Desktop Navigation */}

        <div className="hidden items-center gap-10 md:flex">

          <a
            href="#features"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            How It Works
          </a>

          <a
            href="#contact"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Contact
          </a>

        </div>

        {/* Right Side */}

        {userId ? (
          <div className="flex items-center gap-4">

            <Link
              href="/dashboard"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-[0_0_25px_rgba(59,130,246,0.45)] transition duration-300 hover:scale-105 hover:bg-blue-500"
            >
              Dashboard
            </Link>

            <UserMenu />

          </div>
        ) : (
          <div className="flex items-center gap-3">

            <Link
              href="/sign-in"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition duration-300 hover:bg-white/10"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-[0_0_25px_rgba(59,130,246,0.45)] transition duration-300 hover:scale-105 hover:bg-blue-500"
            >
              Start Journey
            </Link>

          </div>
        )}

      </nav>
    </header>
  );
}