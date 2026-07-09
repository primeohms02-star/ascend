type Props = {
  progress: number;
  momentum: string;
  message: string;
};

export default function ProgressCard({
  progress,
  momentum,
  message,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">
        📈 Journey Progress
      </h2>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-black transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-slate-600">
        {progress}% Complete
      </p>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">
          {momentum}
        </h3>

        <p className="mt-2 text-slate-600">
          {message}
        </p>
      </div>
    </div>
  );
}