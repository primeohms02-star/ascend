type MissionCardProps = {
  title: string;
  description: string;
};

export default function MissionCard({
  title,
  description,
}: MissionCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">
        🎯 Today's Mission
      </h2>

      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}