"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FindingYourStarPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
        router.push("/welcome");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-xl text-center">

        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-black"></div>

        <h1 className="mt-10 text-4xl font-bold text-slate-900">
          Finding Your North Star...
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          We're analyzing your answers and creating your personalized roadmap.
        </p>

        <div className="mt-10 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-full animate-pulse rounded-full bg-black"></div>
        </div>

        <div className="mt-10 space-y-3 text-left text-slate-600">
          <p>✅ Understanding your goals...</p>
          <p>🧠 Identifying your strengths...</p>
          <p>🧭 Building your personalized journey...</p>
        </div>

      </div>
    </main>
  );
}