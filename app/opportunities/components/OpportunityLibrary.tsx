export default function OpportunityLibrary() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6">

      <h2 className="text-xl font-semibold text-white">
        📚 My Opportunity Library
      </h2>

      <div className="mt-6 space-y-3">

        <button className="w-full rounded-xl bg-slate-800 p-3 text-left text-white">
          ⭐ Saved
        </button>

        <button className="w-full rounded-xl bg-slate-800 p-3 text-left text-white">
          🚀 Applied
        </button>

        <button className="w-full rounded-xl bg-slate-800 p-3 text-left text-white">
          🏆 Completed
        </button>

      </div>

    </div>
  );
}