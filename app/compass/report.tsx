interface ReportProps {
  answers: Record<number, string>;
}

export default function Report({ answers }: ReportProps) {
  const currentPosition = answers[1] || "Unknown";
  const destination = answers[2] || "Unknown";

  return (
    <div className="rounded-3xl bg-white p-10 shadow-xl">
      <p className="uppercase tracking-[0.3em] text-sm text-slate-500">
        Your Compass
      </p>

      <h1 className="mt-4 text-5xl font-bold">
        Here's what we found.
      </h1>

      <p className="mt-6 text-lg text-slate-600">
        Based on your answers, here's your current direction.
      </p>

      <div className="mt-12 space-y-8">

        <div>
          <h2 className="text-sm uppercase text-slate-500">
            Current Position
          </h2>

          <p className="mt-2 text-2xl font-semibold">
            {currentPosition}
          </p>
        </div>

        <div>
          <h2 className="text-sm uppercase text-slate-500">
            Destination
          </h2>

          <p className="mt-2 text-2xl font-semibold">
            {destination}
          </p>
        </div>

        <div>
          <h2 className="text-sm uppercase text-slate-500">
            North Star
          </h2>

          <p className="mt-2 text-xl leading-8">
            Make consistent decisions that move you closer to the future you want.
          </p>
        </div>

        <div>
          <h2 className="text-sm uppercase text-slate-500">
            Your Next Step
          </h2>

          <p className="mt-2 text-xl font-semibold">
            Spend one focused hour this week taking action toward your destination.
          </p>
        </div>

      </div>
    </div>
  );
}