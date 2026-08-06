"use client";

import { useRouter } from "next/navigation";

function BackArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:-translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 12H5m6-6-6 6 6 6"
      />
    </svg>
  );
}

type Props = {
  returnTo: string;
};

export default function OpportunityBackButton({
  returnTo,
}: Props) {
  const router = useRouter();

  function goBack() {
    const safeReturnTo =
      returnTo === "/opportunities" ||
      returnTo.startsWith(
        "/opportunities?"
      )
        ? returnTo
        : "/opportunities?page=1";

    router.replace(
      safeReturnTo,
      {
        scroll: false,
      }
    );
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="group inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
    >
      <BackArrowIcon />
      Back
    </button>
  );
}
