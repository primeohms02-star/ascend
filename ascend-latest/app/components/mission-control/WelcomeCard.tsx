type WelcomeCardProps = {
  title: string;
  subtitle: string;
};

export default function WelcomeCard({
  title,
  subtitle,
}: WelcomeCardProps) {
  return (
    <section className="mb-10">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
        MISSION CONTROL
      </p>

      <h1 className="mt-4 text-5xl font-bold">
        {title}
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        {subtitle}
      </p>
    </section>
  );
}