import Link from "next/link";

import {
  ArrowRight,
  AudioLines,
  Compass,
  Radio,
  Sparkles,
} from "lucide-react";

const signals = [
  {
    icon: Compass,
    title: "Music direction",
    detail: "Identity, goals and a Music North Star",
  },
  {
    icon: Sparkles,
    title: "Atlas context",
    detail: "More relevant music-career guidance",
  },
  {
    icon: Radio,
    title: "Opportunity radar",
    detail: "Nigeria, Africa and global possibilities",
  },
];

export default function MusicSpotlight() {
  return (
    <section
      id="ascend-music"
      aria-labelledby="music-heading"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.06] bg-[#070A10] px-6 py-16 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -right-32 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-violet-600/[0.08] blur-[145px]" />
        <div className="absolute left-1/3 top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-blue-600/[0.08] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-blue-300/15 bg-gradient-to-br from-blue-500/[0.09] via-[#090E18]/95 to-violet-500/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-8 lg:p-10">
        <div className="grid items-center gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
              <AudioLines size={16} aria-hidden="true" />
              Specialist Pathway
            </div>

            <h2
              id="music-heading"
              className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl"
            >
              ASCEND Music
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              A specialist pathway for artists,
              producers, songwriters, DJs and music
              professionals—inside the same ASCEND system.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
              It adds music-specific context to Atlas
              and opportunity discovery without replacing
              your main North Star or progress.
            </p>

            <Link
              href="/music"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Explore ASCEND Music
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {signals.map((signal) => {
              const Icon = signal.icon;

              return (
                <article
                  key={signal.title}
                  className="rounded-2xl border border-white/[0.08] bg-slate-950/45 p-5"
                >
                  <Icon size={20} className="text-cyan-300" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-white">
                    {signal.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {signal.detail}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
