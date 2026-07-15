export default function NightSky() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">

      {/* Main Sky */}

      <div className="absolute inset-0 bg-gradient-to-b from-[#01040B] via-[#050913] to-[#090F1C]" />

      {/* Nebula */}

      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />

      <div className="absolute bottom-[-140px] right-0 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[170px]" />

      <div className="absolute top-1/3 left-2/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Bright Stars */}

      <div className="absolute left-[6%] top-[10%] h-1 w-1 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[14%] top-[30%] h-2 w-2 rounded-full bg-white/90 animate-pulse" />
      <div className="absolute left-[22%] top-[16%] h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[35%] top-[8%] h-1 w-1 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[42%] top-[25%] h-2 w-2 rounded-full bg-white/90 animate-pulse" />
      <div className="absolute left-[54%] top-[12%] h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[66%] top-[18%] h-2 w-2 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[78%] top-[9%] h-1 w-1 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[90%] top-[22%] h-1.5 w-1.5 rounded-full bg-white animate-pulse" />

      {/* Lower Stars */}

      <div className="absolute left-[10%] top-[65%] h-1 w-1 rounded-full bg-white/80 animate-pulse" />
      <div className="absolute left-[24%] top-[78%] h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[40%] top-[70%] h-1 w-1 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[55%] top-[82%] h-2 w-2 rounded-full bg-white/80 animate-pulse" />
      <div className="absolute left-[72%] top-[72%] h-1 w-1 rounded-full bg-white animate-pulse" />
      <div className="absolute left-[88%] top-[60%] h-1.5 w-1.5 rounded-full bg-white animate-pulse" />

      {/* Tiny Stars */}

      <div className="absolute inset-0 opacity-40">

        {[
          "5% 40%",
          "12% 52%",
          "18% 48%",
          "26% 58%",
          "31% 45%",
          "38% 52%",
          "47% 40%",
          "58% 48%",
          "64% 36%",
          "70% 52%",
          "76% 46%",
          "82% 54%",
          "90% 42%",
        ].map((pos, i) => {
          const [left, top] = pos.split(" ");

          return (
            <div
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-white"
              style={{ left, top }}
            />
          );
        })}

      </div>

      {/* Space Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_60%)]" />

    </div>
  );
}