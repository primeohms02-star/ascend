export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a] px-6 py-10">

      <div className="mx-auto max-w-6xl">

        <div className="animate-pulse rounded-3xl border border-slate-700 bg-slate-900/60 p-8">

          <div className="h-10 w-2/3 rounded-lg bg-slate-800" />

          <div className="mt-4 h-5 w-1/3 rounded-lg bg-slate-800" />

          <div className="mt-8 h-32 rounded-2xl bg-slate-800" />

        </div>


        <div className="mt-8 animate-pulse rounded-3xl border border-slate-700 bg-slate-900/60 p-8">

          <div className="h-8 w-1/3 rounded-lg bg-slate-800" />

          <div className="mt-6 space-y-3">

            <div className="h-4 w-full rounded bg-slate-800" />

            <div className="h-4 w-5/6 rounded bg-slate-800" />

            <div className="h-4 w-4/6 rounded bg-slate-800" />

          </div>

        </div>

      </div>

    </main>
  );
}