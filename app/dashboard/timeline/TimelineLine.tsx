type TimelineLineProps = {
  active?: boolean;
};

export default function TimelineLine({
  active = false,
}: TimelineLineProps) {
  return (
    <div className="ml-5 flex h-10 justify-center">
      <div
        className={`w-1 rounded-full transition-all ${
          active
            ? "bg-orange-500"
            : "bg-slate-300"
        }`}
      />
    </div>
  );
}