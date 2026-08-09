interface QuestionCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function QuestionCard({
  title,
  subtitle,
  children,
}: QuestionCardProps) {
  return (
    <div className="rounded-3xl bg-white p-10 shadow-xl">

      <h1 className="text-4xl font-bold">
        {title}
      </h1>

      <p className="mt-4 text-lg leading-8 text-slate-600">
        {subtitle}
      </p>

      <div className="mt-10">
        {children}
      </div>

    </div>
  );
}