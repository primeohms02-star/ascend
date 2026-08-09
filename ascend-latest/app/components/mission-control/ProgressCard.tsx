type ProgressCardProps = {
  progress: number;
};

export default function ProgressCard({
  progress,
}: ProgressCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">
        📈 Journey Progress
      </h2>

      <div className="mt-8 h-4 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-black transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-5 text-lg font-medium">
        {progress}% Complete
      </p>

      <p className="mt-2 text-slate-600">
        Every completed mission moves you closer to your North Star.
      </p>
    </div>
  );
}