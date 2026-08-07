export default function CompassGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      <div className="ascend-compass-glow-slow absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.24)_0%,rgba(37,99,235,0.11)_42%,transparent_72%)]" />

      <div className="ascend-compass-glow-slower absolute inset-[-10%] rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.12)_0%,rgba(103,232,249,0.05)_45%,transparent_72%)]" />

      <div className="ascend-compass-glow-north absolute left-1/2 top-[-15%] h-[48%] w-[28%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(96,165,250,0.22)_0%,rgba(96,165,250,0.07)_48%,transparent_75%)]" />

      <div className="ascend-compass-halo absolute inset-[12%] rounded-full border border-blue-300/15 shadow-[0_0_42px_rgba(59,130,246,0.22)]" />

      <div className="absolute inset-x-[15%] bottom-[-8%] h-[18%] rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.14)_0%,transparent_72%)]" />
    </div>
  );
}
