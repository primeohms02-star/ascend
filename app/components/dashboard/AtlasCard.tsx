import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function AtlasCard({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-slate-700/50
        bg-slate-900/60
        backdrop-blur-xl
        p-6
        shadow-[0_10px_40px_rgba(0,0,0,0.35)]
        transition-all
        duration-300
        hover:border-blue-500/30
        hover:shadow-[0_0_35px_rgba(59,130,246,0.12)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}