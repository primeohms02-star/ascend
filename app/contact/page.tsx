import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowUpRight,
  Building2,
  LifeBuoy,
  MessageSquare,
  Users,
} from "lucide-react";

import PublicPageShell from "@/app/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Contact",

  description:
    "Contact ASCEND for product support, feedback, partnerships and other enquiries.",

  alternates: {
    canonical:
      "https://ascendai.space/contact",
  },
};

const contactOptions = [
  {
    title: "Product Support",
    description:
      "Get help with accounts, Atlas, missions, opportunities or technical problems.",
    href: "/support",
    action: "Open Support AI",
    icon: LifeBuoy,
  },
  {
    title: "Product Feedback",
    description:
      "Tell us what is working, what feels unclear and what ASCEND should improve.",
    href: "/support",
    action: "Share Feedback",
    icon: MessageSquare,
  },
  {
    title: "Partnerships",
    description:
      "Discuss institutional, educational, opportunity or development partnerships.",
    href: "/support",
    action: "Start a Conversation",
    icon: Building2,
  },
  {
    title: "Community",
    description:
      "Follow ASCEND's development, public announcements and launch updates.",
    href: "https://x.com/Ascendai_space",
    action: "Follow on X",
    icon: Users,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="Contact ASCEND"
      title="Start the right conversation."
      description="Whether you need product support, want to share feedback or see an opportunity to build with ASCEND, reach the appropriate channel below."
    >
      <section className="grid gap-6 md:grid-cols-2">
        {contactOptions.map(
          (option) => {
            const Icon = option.icon;

            return (
              <article
                key={option.title}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.04] sm:p-9"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <Icon
                    size={23}
                    aria-hidden="true"
                  />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-white">
                  {option.title}
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  {option.description}
                </p>

                <Link
                  href={option.href}
                  target={
                    option.external
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    option.external
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="mt-7 inline-flex items-center gap-2 font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  {option.action}

                  <ArrowUpRight
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
              </article>
            );
          }
        )}
      </section>

      <section className="mt-20 rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.1] to-cyan-500/[0.05] p-8 text-center sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          ASCEND Support
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold text-white sm:text-4xl">
          Diagnose product problems and keep moving forward.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl leading-8 text-slate-400">
          Support AI can identify problems,
          suggest safe troubleshooting steps and
          escalate unresolved cases to an
          administrator.
        </p>

        <Link
          href="/support"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-500"
        >
          Visit ASCEND Support
        </Link>
      </section>
    </PublicPageShell>
  );
}