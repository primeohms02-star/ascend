"use client";

export default function CompassDial() {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle = i * 5;

    const major = angle % 30 === 0;

    return (
      <div
        key={i}
        className="absolute left-1/2 top-1/2 origin-bottom"
        style={{
          transform: `translate(-50%, -100%) rotate(${angle}deg)`,
          height: 185,
        }}
      >
        <div
          className={`rounded-full ${
            major
              ? "h-5 w-[3px] bg-white/70"
              : "h-3 w-[2px] bg-white/20"
          }`}
        />
      </div>
    );
  });

  return (
    <>
      {/* Outer Metal Ring */}

      <div className="absolute h-[410px] w-[410px] rounded-full border border-white/20" />

      {/* Inner Ring */}

      <div className="absolute h-[360px] w-[360px] rounded-full border border-white/10" />

      {/* Tick Marks */}

      {ticks}

      {/* Decorative Circles */}

      <div className="absolute h-[260px] w-[260px] rounded-full border border-white/10" />

      <div className="absolute h-[180px] w-[180px] rounded-full border border-white/5" />

      {/* Cardinal Letters */}

      <span className="absolute top-8 text-3xl font-bold tracking-widest text-blue-500">
        N
      </span>

      <span className="absolute bottom-8 text-xl text-white/60">
        S
      </span>

      <span className="absolute right-8 text-xl text-white/60">
        E
      </span>

      <span className="absolute left-8 text-xl text-white/60">
        W
      </span>
    </>
  );
}