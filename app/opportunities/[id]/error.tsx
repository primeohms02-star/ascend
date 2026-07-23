"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a] px-6">

      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/60 p-8 text-center">

        <h2 className="text-2xl font-bold text-white">
          Atlas couldn't load this opportunity
        </h2>

        <p className="mt-3 text-slate-400">
          Something went wrong while retrieving the opportunity details.
          Please try again.
        </p>

        <button
          onClick={() => reset()}
          className="
            mt-6
            rounded-xl
            bg-cyan-500
            px-6
            py-3
            font-semibold
            text-slate-900
            transition
            hover:bg-cyan-400
          "
        >
          Try Again
        </button>

      </div>

    </main>
  );
}