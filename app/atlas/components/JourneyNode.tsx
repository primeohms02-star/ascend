"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type JourneyNodeProps = {
  title: string;
  subtitle: string;
  icon: string;
  href?: string;
};

export default function JourneyNode({
  title,
  subtitle,
  icon,
  href = "#",
}: JourneyNodeProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{
          scale: 1.05,
          y: -4,
        }}
        whileTap={{
          scale: 0.98,
        }}
        className="cursor-pointer rounded-2xl border border-blue-500/20 bg-slate-900/60 p-5 backdrop-blur-md transition hover:border-blue-400"
      >
        <div className="flex items-center gap-5">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 text-2xl shadow-[0_0_25px_rgba(59,130,246,.6)]">
            {icon}
          </div>

          <div>
            <h3 className="font-semibold text-white">
              {title}
            </h3>

            <p className="text-sm text-slate-400">
              {subtitle}
            </p>
          </div>

        </div>
      </motion.div>
    </Link>
  );
}