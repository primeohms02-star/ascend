type Props = {
  greeting: string;
  summary: string;
  focus: string;
  oracle: string;
};

export default function ConversationCard({
  greeting,
  summary,
  focus,
  oracle,
}: Props) {
  return (
    <div className="mt-12 w-full rounded-2xl border border-white/10 bg-[#111116]/88 p-5 shadow-lg sm:p-6">

      <div className="mb-6 flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />

        <span className="text-sm uppercase tracking-[0.35em] text-slate-400">
          ATLAS
        </span>
      </div>

      <h2 className="mb-6 text-3xl font-semibold">
        {greeting}
      </h2>

      <p className="leading-9 text-slate-300">
        {summary}
      </p>

      <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
        <div className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-300">
          Today&apos;s Focus
        </div>

        <p>{focus}</p>
      </div>

      <div className="mt-8 border-l-2 border-amber-400 pl-5 italic text-slate-400">
        {oracle}
      </div>

    </div>
  );
}
