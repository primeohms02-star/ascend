interface OptionButtonProps {
  option: string;
  onClick?: () => void;
}

export default function OptionButton({
  option,
  onClick,
}: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-5 text-left transition hover:border-black hover:bg-slate-100"
    >
      {option}
    </button>
  );
}