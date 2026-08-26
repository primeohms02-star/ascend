"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkApplicationsBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.replace("/work")}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back to ASCEND Work
    </button>
  );
}
