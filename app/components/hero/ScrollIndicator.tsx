export default function ScrollIndicator() {
  return (
    <div className="flex items-center gap-3 text-slate-400">
      <div className="flex h-10 w-6 justify-center rounded-full border border-blue-500">
        <div className="ascend-scroll-dot mt-2 h-2 w-2 rounded-full bg-blue-500" />
      </div>

      <span>Scroll to explore</span>
    </div>
  );
}
