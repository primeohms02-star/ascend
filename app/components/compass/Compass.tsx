import CompassGlass from "./CompassGlass";
import CompassGlow from "./CompassGlow";
import CompassNeedle from "./CompassNeedle";
import CompassSVG from "./CompassSVG";

type CompassProps = {
  size?: number;
  state?:
    | "lost"
    | "exploring"
    | "growing"
    | "ascending";
};

export default function Compass({
  size = 460,
  state = "exploring",
}: CompassProps) {
  return (
    <div className="relative flex w-full items-center justify-center">
      <div
        className="ascend-home-compass relative aspect-square w-full"
        style={{
          width: size,
          maxWidth: "88vw",
        }}
      >
        <CompassGlow />

        <div
          aria-hidden="true"
          className="absolute inset-x-[12%] bottom-[-5%] h-[18%] rounded-full bg-[radial-gradient(ellipse,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.45)_48%,transparent_76%)]"
        />

        <div
          aria-hidden="true"
          className="ascend-compass-ring-cw absolute inset-[-3%] rounded-full border border-dashed border-cyan-300/10"
        />

        <div
          aria-hidden="true"
          className="ascend-compass-ring-ccw absolute inset-[2%] rounded-full border border-blue-300/10"
        >
          <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
          <span className="absolute bottom-[-3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blue-400/70" />
          <span className="absolute left-[-3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-400/60" />
          <span className="absolute right-[-3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-400/60" />
        </div>

        <div className="absolute inset-[5%] overflow-hidden rounded-full border border-slate-300/25 bg-gradient-to-br from-slate-300/20 via-slate-950 to-slate-500/20 p-[2px] shadow-[0_30px_80px_rgba(0,0,0,0.75),0_0_55px_rgba(37,99,235,0.22),inset_0_1px_1px_rgba(255,255,255,0.3)]">
          <div className="relative h-full w-full rounded-full bg-[conic-gradient(from_210deg,#0f172a,#64748b_8%,#111827_18%,#cbd5e1_27%,#1e293b_38%,#94a3b8_50%,#0f172a_64%,#475569_76%,#cbd5e1_87%,#111827)] p-[3.2%]">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-[#05070B] shadow-[inset_0_0_55px_rgba(0,0,0,0.95),inset_0_0_10px_rgba(148,163,184,0.25)]">
              <CompassSVG />
              <CompassNeedle state={state} />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full opacity-50"
                style={{
                  background:
                    "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.20), rgba(125,211,252,0.07) 18%, transparent 42%)",
                }}
              />

              <CompassGlass />
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="ascend-compass-north-marker absolute left-1/2 top-[1.5%] -translate-x-1/2"
        >
          <div className="h-0 w-0 border-x-[7px] border-b-[14px] border-x-transparent border-b-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
        </div>
      </div>
    </div>
  );
}
