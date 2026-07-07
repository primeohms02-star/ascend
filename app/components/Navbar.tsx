import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import UserMenu from "./UserMenu";
export default async function Navbar() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">
          ASCEND
        </h1>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-black transition">
            Features
          </a>

          <a href="#how-it-works" className="text-gray-600 hover:text-black transition">
            How It Works
          </a>

          <a href="#contact" className="text-gray-600 hover:text-black transition">
            Contact
          </a>
        </div>

        {userId ? (
  <div className="flex items-center gap-4">
    <Link
      href="/dashboard"
      className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 transition"
    >
      Dashboard
    </Link>

    <UserMenu />
  </div>
) : (
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-xl border border-gray-300 px-5 py-3 font-medium hover:bg-gray-100 transition"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}