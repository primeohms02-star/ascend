"use client";

import { useRouter } from "next/navigation";

const OPPORTUNITY_RETURN_NAVIGATION_KEY =
  "ascend:opportunities:return-navigation";

const RETURN_NAVIGATION_MAX_AGE_MS = 30 * 60 * 1000;

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

    const storedNavigation = window.sessionStorage.getItem(
      OPPORTUNITY_RETURN_NAVIGATION_KEY,
    );

    if (storedNavigation) {
      try {
        const navigation = JSON.parse(storedNavigation) as {
          returnTo?: string;
          destination?: string;
          createdAt?: number;
        };

        const isExpectedReturn = navigation.returnTo === safeReturnTo;
        const isExpectedDestination =
          navigation.destination === window.location.pathname;
        const isRecent =
          typeof navigation.createdAt === "number" &&
          Date.now() - navigation.createdAt <= RETURN_NAVIGATION_MAX_AGE_MS;

        if (isExpectedReturn && isExpectedDestination && isRecent) {
          window.sessionStorage.removeItem(OPPORTUNITY_RETURN_NAVIGATION_KEY);
          router.back();
          return;
        }
      } catch {
        // Fall through to the safe ASCEND route when stored state is invalid.
      }

      window.sessionStorage.removeItem(OPPORTUNITY_RETURN_NAVIGATION_KEY);
    }

    router.replace(safeReturnTo, { scroll: false });
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
