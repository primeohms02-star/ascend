"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LibraryCounts = {
  saved: number;
  applied: number;
  completed: number;
};

type LibraryItem = {
  label: string;
  description: string;
  countKey: keyof LibraryCounts;
  href: string;
  accent:
    | "amber"
    | "cyan"
    | "emerald";
};

const libraryItems: LibraryItem[] = [
  {
    label: "Saved",
    description:
      "Opportunities you want to revisit.",
    countKey: "saved",
    href: "/opportunities/library/saved",
    accent: "amber",
  },
  {
    label: "Applied",
    description:
      "Applications you confirmed as submitted.",
    countKey: "applied",
    href: "/opportunities/library/applied",
    accent: "cyan",
  },
  {
    label: "Completed",
    description:
      "Finished application journeys.",
    countKey: "completed",
    href: "/opportunities/library/completed",
    accent: "emerald",
  },
];

const accentStyles = {
  amber: {
    icon: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    count:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    hover:
      "hover:border-amber-400/30 hover:bg-amber-400/[0.06]",
  },
  cyan: {
    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    count:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    hover:
      "hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]",
  },
  emerald: {
    icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    count:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    hover:
      "hover:border-emerald-400/30 hover:bg-emerald-400/[0.06]",
  },
};

function LibraryIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm0 0v16"
      />
    </svg>
  );
}

function ItemIcon({
  type,
}: {
  type: LibraryItem["countKey"];
}) {
  if (type === "saved") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
        />
      </svg>
    );
  }

  if (type === "applied") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m5 19 14-14M9 5h10v10M5 12v7h7"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 4h8v3a4 4 0 0 1-8 0V4Zm0 1H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 0v5m-4 4h8"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
}

export default function OpportunityLibrary() {
  const [counts, setCounts] =
    useState<LibraryCounts>({
      saved: 0,
      applied: 0,
      completed: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCounts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/opportunities/library",
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Atlas could not load your library."
          );
        }

        setCounts({
          saved: data.counts?.saved ?? 0,
          applied: data.counts?.applied ?? 0,
          completed:
            data.counts?.completed ?? 0,
        });
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Atlas could not load your library."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCounts();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <aside className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/60 shadow-xl shadow-slate-950/20">
      {/* Header */}

      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <LibraryIcon />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Your progress
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              My Opportunity Library
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-400">
          Track every opportunity from discovery
          through completion.
        </p>
      </div>

      {/* Library links */}

      <div className="space-y-3 p-4">
        {libraryItems.map((item) => {
          const styles =
            accentStyles[item.accent];

          return (
            <Link
              key={item.countKey}
              href={item.href}
              className={`group flex items-center gap-4 rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4 transition ${styles.hover}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
              >
                <ItemIcon
                  type={item.countKey}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">
                    {item.label}
                  </h3>

                  <span
                    className={`min-w-8 rounded-full border px-2.5 py-1 text-center text-xs font-semibold ${styles.count}`}
                  >
                    {loading
                      ? "—"
                      : counts[item.countKey]}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              </div>

              <span className="shrink-0 text-slate-500 transition group-hover:text-slate-300">
                <ArrowIcon />
              </span>
            </Link>
          );
        })}
      </div>

      {error && (
        <div className="border-t border-rose-400/10 bg-rose-400/[0.05] px-5 py-4">
          <p
            role="alert"
            className="text-xs leading-5 text-rose-300"
          >
            {error}
          </p>
        </div>
      )}
    </aside>
  );
}