export default function HeroBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[#05070B]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18)_0%,rgba(37,99,235,0.08)_42%,transparent_72%)]" />

      <div className="absolute inset-0 opacity-[0.04]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>
    </>
  );
}
