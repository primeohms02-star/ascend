type MilestoneProps = {
  title: string;
  subtitle: string;
  side?: "left" | "right";
  compact?: boolean;
};

export default function Milestone({
  title,
  subtitle,
  side = "left",
  compact = false,
}: MilestoneProps) {
  return (
    <div className="flex items-center">
      {side === "left" && (
        <>
          {/* Orb */}
          <div className="relative z-20 h-5 w-5 rounded-full border-2 border-cyan-200 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]" />

          {/* Connector */}
          <div className="h-[2px] w-8 bg-cyan-400" />
        </>
      )}

      {/* Card */}
      <div
        className={`rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl ${
          compact ? "max-w-[220px] px-4 py-3" : "max-w-[280px] px-5 py-4"
        }`}
      >
        <h3
          className={`font-semibold text-white ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          {title}
        </h3>

        <p
          className={`mt-1 text-slate-400 ${
            compact ? "text-xs leading-5" : "text-sm"
          }`}
        >
          {subtitle}
        </p>
      </div>

      {side === "right" && (
        <>
          {/* Connector */}
          <div className="h-[2px] w-8 bg-cyan-400" />

          {/* Orb */}
          <div className="relative z-20 h-5 w-5 rounded-full border-2 border-cyan-200 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
        </>
      )}
    </div>
  );
}