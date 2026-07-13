type Props = {
  title: string;
  message: string;
  confidence: number;
};

export default function PredictionCard({
  title,
  message,
  confidence,
}: Props) {
  return (
    <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <h2 className="text-lg font-bold text-slate-900">
          🔮 Atlas Prediction
        </h2>

        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          {confidence}% confidence
        </span>

      </div>

      <h3 className="mt-5 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-slate-600 leading-relaxed">
        {message}
      </p>

    </div>
  );
}