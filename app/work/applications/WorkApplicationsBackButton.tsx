"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WorkApplicationsBackButton() {
  const router = useRouter();
  useEffect(() => { router.prefetch("/work"); }, [router]);

  return (
    <button
      type="button"
      onPointerDown={() => router.prefetch("/work")}
      onClick={() => router.replace("/work")}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back to ASCEND Work
    </button>
  );
}
