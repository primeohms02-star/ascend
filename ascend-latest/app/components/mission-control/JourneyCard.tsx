type JourneyCardProps = {
  journey: string;
  northStar: string;
};

export default function JourneyCard({
  journey,
  northStar,
}: JourneyCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">
        {journey}
      </h2>

      <p className="mt-4 text-sm uppercase tracking-widest text-slate-500">
        Your North Star
      </p>

      <p className="mt-3 leading-7 text-slate-600">
        {northStar}
      </p>
    </div>
  );
}