"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children: ReactNode;
  fallbackHref?: string;
  className?: string;
};

export default function PreviousPageButton({
  children,
  fallbackHref = "/dashboard",
  className,
}: Props) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button type="button" onClick={goBack} className={className}>
      {children}
    </button>
  );
}
