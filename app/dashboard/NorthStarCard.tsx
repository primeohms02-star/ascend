type Props = {
  northStar: string;
};

export default function NorthStarCard({
  northStar,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-semibold">
        🧭 Your North Star
      </h2>

      <p className="mt-4 leading-7 text-slate-600">
        {northStar}
      </p>
    </div>
  );
}