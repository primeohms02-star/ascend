"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@clerk/nextjs";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Menu,
  X,
} from "lucide-react";

import UserMenu from "./UserMenu";

const navigation = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How It Works",
    href: "#how-it-works",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];

export default function Navbar() {
  const { isLoaded, userId } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const isSignedIn = Boolean(userId);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4">
      <nav
        aria-label="Main navigation"
        className="mx-auto mt-4 max-w-7xl rounded-2xl border border-white/10 bg-[#070A10]/80 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:px-6"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}

          <Link
            href="/"
            onClick={closeMobileMenu}
            aria-label="ASCEND home"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11">
              <Image
                src="/ascend-navbar-logo.png"
                alt=""
                fill
                priority
                sizes="44px"
                className="object-contain transition duration-300 group-hover:scale-105"
              />
            </span>

            <span className="text-lg font-black tracking-[0.18em] text-white transition group-hover:text-blue-300 sm:text-2xl sm:tracking-[0.22em]">
              ASCEND
            </span>
          </Link>

          {/* Desktop navigation */}

          <div className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-400 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}

          <div className="hidden min-h-11 items-center gap-3 md:flex">
            {!isLoaded ? (
              <>
                <div className="h-10 w-20 animate-pulse rounded-xl bg-white/5" />

                <div className="h-10 w-36 animate-pulse rounded-xl bg-blue-600/30" />
              </>
            ) : isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(37,99,235,0.3)] transition hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Dashboard
                </Link>

                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-400/30 hover:bg-white/10 hover:text-white"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(37,99,235,0.3)] transition hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Start Your Journey
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls */}

          <div className="flex items-center gap-3 md:hidden">
            {isLoaded && isSignedIn && (
              <UserMenu />
            )}

            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (current) => !current
                )
              }
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={
                mobileOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {mobileOpen ? (
                <X
                  size={21}
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  size={21}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              id="mobile-navigation"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.22,
              }}
              className="overflow-hidden md:hidden"
            >
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  {!isLoaded ? (
                    <div className="grid gap-3">
                      <div className="h-12 animate-pulse rounded-xl bg-white/5" />

                      <div className="h-12 animate-pulse rounded-xl bg-blue-600/30" />
                    </div>
                  ) : isSignedIn ? (
                    <div className="grid gap-3">
                      <Link
                        href="/dashboard"
                        onClick={closeMobileMenu}
                        className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        Open Dashboard
                      </Link>

                      <Link
                        href="/atlas"
                        onClick={closeMobileMenu}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
                      >
                        Talk with Atlas
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <Link
                        href="/sign-in"
                        onClick={closeMobileMenu}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
                      >
                        Sign In
                      </Link>

                      <Link
                        href="/sign-up"
                        onClick={closeMobileMenu}
                        className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        Start Your Journey
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}