"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

export const ATLAS_CONTEXT_SESSION_KEY = "ascend:atlas-surface-context";

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
      window.sessionStorage.setItem(
        ATLAS_CONTEXT_SESSION_KEY,
        context.slice(0, 2200)
      );
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
