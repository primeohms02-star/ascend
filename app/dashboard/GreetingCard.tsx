type GreetingCardProps = {
  greeting: string;
};

export default function GreetingCard({
  greeting,
}: GreetingCardProps) {
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
        ASCEND
      </p>

      <h1 className="mt-2 text-4xl font-bold text-slate-900">
        {greeting}
      </h1>

      <p className="mt-3 max-w-2xl text-slate-600">
        Every decision you make today shapes the person you become tomorrow.
      </p>
    </section>
  );
}