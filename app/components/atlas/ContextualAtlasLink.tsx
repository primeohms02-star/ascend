"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

export const ATLAS_CONTEXT_SESSION_KEY = "ascend:atlas-surface-context";
export const ATLAS_RETURN_SESSION_KEY = "ascend:atlas-return-to";

type Props = {
  prompt: string;
  context: string;
  children: ReactNode;
  className?: string;
};

export default function ContextualAtlasLink({
  prompt,
  context,
  children,
  className,
}: Props) {
  const router = useRouter();

  function openAtlas() {
    try {
      const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      window.sessionStorage.setItem(
        ATLAS_CONTEXT_SESSION_KEY,
        context.slice(0, 2200)
      );
      window.sessionStorage.setItem(ATLAS_RETURN_SESSION_KEY, returnTo);
    } catch {
      // Atlas still opens if session storage is unavailable.
    }

    router.push(`/atlas?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <button type="button" onClick={openAtlas} className={className}>
      {children}
    </button>
  );
}
