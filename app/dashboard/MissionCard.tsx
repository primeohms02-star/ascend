type Props = {
  title: string;
  description: string;
};

export default function MissionCard({
  title,
  description,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">
        🎯 Today's Mission
      </h2>

      <h3 className="mt-4 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-slate-600">
        {description}
      </p>
    </div>
  );
}