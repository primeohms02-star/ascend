"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

import {
  ChartNoAxesCombined,
  CircleHelp,
  Compass,
  Globe2,
  Home,
  Library,
  LogOut,
  Menu,
  Music2,
  Orbit,
  Search,
  Target,
  X,
} from "lucide-react";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Home;
  isActive: (pathname: string) => boolean;
};

const primaryItems: NavigationItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "Atlas",
    href: "/atlas",
    icon: Orbit,
    isActive: (pathname) => pathname.startsWith("/atlas") && !pathname.startsWith("/atlas-overview"),
  },
];

const journeyItems: NavigationItem[] = [
  {
    label: "Direction",
    href: "/direction",
    icon: Compass,
    isActive: (pathname) => pathname === "/direction" || pathname.startsWith("/compass"),
  },
  {
    label: "Action",
    href: "/action",
    icon: Target,
    isActive: (pathname) => pathname === "/action",
  },
  {
    label: "Progress",
    href: "/progress",
    icon: ChartNoAxesCombined,
    isActive: (pathname) => pathname === "/progress",
  },
];

const discoverItems: NavigationItem[] = [
  {
    label: "Explore",
    href: "/opportunities",
    icon: Search,
    isActive: (pathname) =>
      pathname.startsWith("/opportunities") && !pathname.startsWith("/opportunities/library"),
  },
  {
    label: "Library",
    href: "/library",
    icon: Library,
    isActive: (pathname) => pathname === "/library" || pathname.startsWith("/opportunities/library"),
  },
  {
    label: "Music",
    href: "/music/pathway",
    icon: Music2,
    isActive: (pathname) => pathname.startsWith("/music/pathway"),
  },
];

const supportItem: NavigationItem = {
  label: "Support",
  href: "/support",
  icon: CircleHelp,
  isActive: (pathname) => pathname.startsWith("/support"),
};

const homepageItem: NavigationItem = {
  label: "Homepage",
  href: "/",
  icon: Globe2,
  isActive: (pathname) => pathname === "/",
};

const mobilePrimaryItems = [
  primaryItems[0],
  primaryItems[1],
  discoverItems[0],
  journeyItems[2],
];

function NavigationLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavigationItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = item.isActive(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-cyan-400/10 text-cyan-200"
          : "text-slate-400 hover:bg-white/[0.045] hover:text-white"
      }`}
    >
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

export default function AppNavigation() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const moreButton = moreButtonRef.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      moreButton?.focus();
    };
  }, [moreOpen]);

  const moreIsActive =
    moreOpen ||
    journeyItems.slice(0, 2).some((item) => item.isActive(pathname)) ||
    discoverItems.slice(1).some((item) => item.isActive(pathname)) ||
    pathname.startsWith("/support");

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.07] bg-[#060A11] lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-white/[0.07] px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            aria-label="ASCEND dashboard"
          >
            <span className="relative h-10 w-10 shrink-0">
              <Image
                src="/ascend-navbar-logo.png"
                alt=""
                fill
                sizes="40px"
                className="object-contain"
              />
            </span>

            <span>
              <span className="block text-base font-black tracking-[0.18em] text-white">ASCEND</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Your operating system
              </span>
            </span>
          </Link>
        </div>

        <nav aria-label="ASCEND app navigation" className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {primaryItems.map((item) => (
              <NavigationLink key={item.label} item={item} pathname={pathname} />
            ))}
          </div>

          <div className="mt-6">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Your Journey
            </p>
            <div className="mt-2 space-y-1">
              {journeyItems.map((item) => (
                <NavigationLink key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Discover
            </p>
            <div className="mt-2 space-y-1">
              {discoverItems.map((item) => (
                <NavigationLink key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        </nav>

        <div className="space-y-1 border-t border-white/[0.07] p-3">
          <NavigationLink item={homepageItem} pathname={pathname} />
          <NavigationLink item={supportItem} pathname={pathname} />
        </div>
      </aside>

      {moreOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div
            id="ascend-more-navigation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ascend-more-navigation-title"
            className="absolute inset-x-3 bottom-[calc(5.6rem+env(safe-area-inset-bottom))] overflow-hidden rounded-[26px] border border-cyan-300/10 bg-gradient-to-b from-[#0B1422] to-[#070C14] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.58)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" aria-hidden="true" />
            <div className="flex items-center justify-between px-2 pb-2">
              <div>
                <p id="ascend-more-navigation-title" className="text-sm font-semibold text-white">
                  More of ASCEND
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Direction, action and the rest of your journey.</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close more navigation"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-1 sm:grid-cols-2">
              {[journeyItems[0], journeyItems[1], discoverItems[1], discoverItems[2]].map((item) => (
                <NavigationLink
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setMoreOpen(false)}
                />
              ))}
              <NavigationLink
                item={homepageItem}
                pathname={pathname}
                onNavigate={() => setMoreOpen(false)}
              />
              <NavigationLink
                item={supportItem}
                pathname={pathname}
                onNavigate={() => setMoreOpen(false)}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                void signOut({ redirectUrl: "/" });
              }}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-300/15 bg-rose-400/[0.07] px-3.5 py-2.5 text-sm font-semibold text-rose-300 transition-colors duration-150 hover:bg-rose-400/[0.11]"
            >
              <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <nav
        aria-label="ASCEND mobile navigation"
        className="fixed inset-x-3 bottom-[max(0.6rem,env(safe-area-inset-bottom))] z-40 overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#07101C] px-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(34,211,238,0.025)] lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 py-1.5">
          {mobilePrimaryItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[17px] text-[10px] font-semibold transition-colors duration-150 ${
                  active
                    ? "bg-cyan-400/[0.09] text-cyan-200"
                    : "text-slate-500 active:bg-white/[0.04]"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 h-0.5 w-5 rounded-full bg-cyan-300/80"
                  />
                )}
                <Icon size={19} strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            ref={moreButtonRef}
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            aria-expanded={moreOpen}
            aria-controls="ascend-more-navigation"
            aria-haspopup="dialog"
            className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[17px] text-[10px] font-semibold transition-colors duration-150 ${
              moreIsActive
                ? "bg-cyan-400/[0.09] text-cyan-200"
                : "text-slate-500 active:bg-white/[0.04]"
            }`}
          >
            {moreIsActive && (
              <span
                aria-hidden="true"
                className="absolute top-1.5 h-0.5 w-5 rounded-full bg-cyan-300/80"
              />
            )}
            {moreOpen ? (
              <X size={19} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu size={19} strokeWidth={moreIsActive ? 2 : 1.75} aria-hidden="true" />
            )}
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
