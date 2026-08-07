import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
} from "lucide-react";

const productLinks = [
  {
    label: "Compass",
    href: "/compass",
  },
  {
    label: "Atlas",
    href: "/atlas-overview",
  },
  {
    label: "Missions",
    href: "/dashboard#mission",
  },
  {
    label: "Opportunities",
    href: "/opportunities",
  },
  {
    label: "Momentum",
    href: "/dashboard#momentum",
  },
  {
    label: "ASCEND Music",
    href: "/#ascend-music",
  },
];

const exploreLinks = [
  {
    label: "About ASCEND",
    href: "/about",
  },
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "How It Works",
    href: "/how-it-works",
  },
  {
    label: "Roadmap",
    href: "/roadmap",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

const trustLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Terms of Service",
    href: "/terms",
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-white/[0.08] bg-[#030509] px-6 pb-10 pt-20"
    >

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              aria-label="ASCEND home"
              className="group inline-flex items-center gap-3"
            >
              <span className="relative h-12 w-12 shrink-0">
                <Image
                  src="/ascend-navbar-logo.png"
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain transition duration-300 group-hover:scale-105"
                />
              </span>

              <span className="text-2xl font-black tracking-[0.22em] text-white transition group-hover:text-blue-300">
                ASCEND
              </span>
            </Link>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
              An Operating System for Human
              Potential—built to turn uncertainty
              into direction, action and evidence
              of growth.
            </p>

            <div className="mt-7 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Direction • Action • Growth
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Product
            </h2>

            <ul className="mt-6 space-y-4">
              {productLinks.map(
                (item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 transition hover:text-blue-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Explore
            </h2>

            <ul className="mt-6 space-y-4">
              {exploreLinks.map(
                (item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 transition hover:text-blue-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Connect
            </h2>

            <ul className="mt-6 space-y-4">
              <li>
                <Link
                  href="/support"
                  className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
                >
                  ASCEND Support

                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-300">
                    AI
                  </span>
                </Link>
              </li>

              <li>
                <a
                  href="https://x.com/Ascendai_space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  Follow on X

                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                  />
                </a>
              </li>

              {trustLinks.map(
                (item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 transition hover:text-blue-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>

            <p className="mt-7 text-xs leading-6 text-slate-600">
              Support AI helps users understand
              ASCEND, resolve product issues and
              find the correct next step.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.08] pt-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 ASCEND. Built for Human
            Potential.
          </p>

          <p>
            Every meaningful journey begins with
            direction.
          </p>
        </div>
      </div>
    </footer>
  );
}
