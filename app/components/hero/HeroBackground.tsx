export default function HeroBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[#05070B]" />

      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[180px]" />

      <div className="absolute inset-0 opacity-[0.04]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>
    </>
  );
}