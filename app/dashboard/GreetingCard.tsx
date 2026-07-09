type GreetingCardProps = {
  greeting: string;
};

export default function GreetingCard({
  greeting,
}: GreetingCardProps) {
  return (
    <>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
        ASCEND Mission Control
      </p>

      <h1 className="mt-4 text-5xl font-bold">
        {greeting}, Traveler 👋
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        Every day is another opportunity to move closer to your North Star.
      </p>
    </>
  );
}