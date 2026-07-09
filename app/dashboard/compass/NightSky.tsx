export default function NightSky() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">

      {/* Stars */}

      <div className="absolute left-[8%] top-[12%] h-1 w-1 rounded-full bg-white opacity-70 animate-pulse" />

      <div className="absolute left-[18%] top-[28%] h-1.5 w-1.5 rounded-full bg-white opacity-40 animate-pulse" />

      <div className="absolute left-[30%] top-[10%] h-1 w-1 rounded-full bg-white opacity-60 animate-pulse" />

      <div className="absolute left-[46%] top-[18%] h-2 w-2 rounded-full bg-white opacity-30 animate-pulse" />

      <div className="absolute left-[60%] top-[8%] h-1 w-1 rounded-full bg-white opacity-60 animate-pulse" />

      <div className="absolute left-[72%] top-[20%] h-1.5 w-1.5 rounded-full bg-white opacity-50 animate-pulse" />

      <div className="absolute left-[84%] top-[14%] h-1 w-1 rounded-full bg-white opacity-70 animate-pulse" />

      <div className="absolute left-[12%] top-[60%] h-1 w-1 rounded-full bg-white opacity-40 animate-pulse" />

      <div className="absolute left-[28%] top-[72%] h-1.5 w-1.5 rounded-full bg-white opacity-60 animate-pulse" />

      <div className="absolute left-[55%] top-[68%] h-1 w-1 rounded-full bg-white opacity-40 animate-pulse" />

      <div className="absolute left-[78%] top-[60%] h-1.5 w-1.5 rounded-full bg-white opacity-50 animate-pulse" />

    </div>
  );
}