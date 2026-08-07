"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChartNoAxesCombined,
  CircleHelp,
  Compass,
  Home,
  Library,
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
    href: "/music",
    icon: Music2,
    isActive: (pathname) => pathname.startsWith("/music"),
  },
];

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
      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
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
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.07] bg-[#060A11] lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-white/[0.07] px-5">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="ASCEND dashboard">
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

        <div className="border-t border-white/[0.07] p-3">
          <NavigationLink
            item={{
              label: "Support",
              href: "/support",
              icon: CircleHelp,
              isActive: (currentPath) => currentPath.startsWith("/support"),
            }}
            pathname={pathname}
          />
        </div>
      </aside>

      {moreOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] rounded-2xl border border-white/10 bg-[#0A0F18] p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pb-2">
              <div>
                <p className="text-sm font-semibold text-white">More of ASCEND</p>
                <p className="mt-0.5 text-xs text-slate-500">Direction, action and the rest of your journey.</p>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close more navigation"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300"
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
                item={{
                  label: "Support",
                  href: "/support",
                  icon: CircleHelp,
                  isActive: (currentPath) => currentPath.startsWith("/support"),
                }}
                pathname={pathname}
                onNavigate={() => setMoreOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="ASCEND mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#060A11] px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {mobilePrimaryItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[68px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                  active ? "text-cyan-300" : "text-slate-500"
                }`}
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            aria-expanded={moreOpen}
            className={`flex min-h-[68px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
              moreOpen || journeyItems.slice(0, 2).some((item) => item.isActive(pathname)) || discoverItems.slice(1).some((item) => item.isActive(pathname)) || pathname.startsWith("/support")
                ? "text-cyan-300"
                : "text-slate-500"
            }`}
          >
            <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
