import type {
  ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

type PublicPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const navigation = [
  {
    label: "About",
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
    label: "Atlas",
    href: "/atlas-overview",
  },
  {
    label: "Roadmap",
    href: "/roadmap",
  },
];

export default function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
}: PublicPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030509] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
      >
        <div className="absolute -left-48 top-20 h-[34rem] w-[34rem] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute -right-48 top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/[0.07] blur-[150px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_top,black,transparent_75%)]" />
      </div>

      <header className="relative z-10 border-b border-white/[0.08] bg-[#030509]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <Image
              src="/ascend-navbar-logo.png"
              alt=""
              width={46}
              height={46}
              className="h-11 w-11 object-contain"
              priority
            />

            <span className="text-xl font-black tracking-[0.22em] text-white">
              ASCEND
            </span>
          </Link>

          <nav
            aria-label="Public navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {navigation.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-slate-400 transition hover:text-white"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <Link
            href="/sign-up"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(37,99,235,0.25)] transition hover:bg-blue-500"
          >
            Start Your Journey
          </Link>
        </div>
      </header>

      <section className="relative z-10 border-b border-white/[0.07] px-5 pb-20 pt-24 sm:px-6 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            {eyebrow}
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
            {title}
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
            {description}
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        {children}
      </div>

      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} ASCEND.
            Built for Human Potential.
          </p>

          <div className="flex flex-wrap gap-5">
            <Link
              href="/privacy"
              className="transition hover:text-white"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-white"
            >
              Contact
            </Link>

            <Link
              href="/support"
              className="transition hover:text-white"
            >
              Support
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}