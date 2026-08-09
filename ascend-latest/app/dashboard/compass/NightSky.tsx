const stars = [
  ["6%", "12%", 2], ["14%", "31%", 3], ["23%", "17%", 2], ["34%", "9%", 1],
  ["43%", "26%", 3], ["55%", "13%", 2], ["66%", "19%", 3], ["78%", "10%", 1],
  ["91%", "23%", 2], ["9%", "66%", 1], ["24%", "79%", 2], ["40%", "71%", 1],
  ["55%", "83%", 3], ["72%", "73%", 1], ["88%", "61%", 2], ["18%", "49%", 1],
  ["31%", "57%", 1], ["48%", "42%", 1], ["63%", "54%", 1], ["81%", "45%", 1],
] as const;

export default function NightSky() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#02040A] via-[#07101D] to-[#03060C]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.018)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

      <div className="absolute -top-36 left-[12%] h-[390px] w-[390px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),rgba(59,130,246,0.06)_42%,transparent_72%)]" />
      <div className="absolute -bottom-44 right-[-5%] h-[430px] w-[430px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.11),rgba(34,211,238,0.04)_45%,transparent_72%)]" />
      <div className="absolute left-[60%] top-[24%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07),transparent_70%)]" />

      {stars.map(([left, top, size], index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left,
            top,
            width: size,
            height: size,
            opacity: size >= 2 ? 0.78 : 0.45,
            boxShadow:
              size >= 2
                ? "0 0 8px rgba(191,219,254,0.72)"
                : "0 0 4px rgba(255,255,255,0.45)",
          }}
        />
      ))}

      <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full border border-blue-200/[0.035]" />
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-blue-200/[0.025]" />
      <div className="absolute -left-10 -top-10 h-44 w-44 rotate-45 border border-blue-200/[0.02]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.10),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.58)_100%)]" />
    </div>
  );
}
