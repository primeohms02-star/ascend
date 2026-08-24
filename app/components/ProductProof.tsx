import Image from "next/image";

export default function ProductProof() {
  return (
    <section
      id="ascend-in-action"
      aria-labelledby="product-proof-heading"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.06] bg-[#05070B] px-6 py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[170px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 sm:text-sm">
            See ASCEND in Action
          </p>

          <h2
            id="product-proof-heading"
            className="mt-5 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Your direction, next mission and progress
            <span className="block text-blue-300">
              in one clear command centre.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            ASCEND shows what matters now, why it matters and the progress you
            are building toward your goal.
          </p>
        </div>

        <figure className="relative mt-10 overflow-hidden rounded-2xl border border-blue-300/15 bg-[#080D16] shadow-[0_28px_100px_rgba(0,0,0,0.5)] sm:mt-12 sm:rounded-[2rem]">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            </div>

            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
              Real ASCEND dashboard
            </span>
          </div>

          <Image
            src="/ascend-dashboard-homepage.jpg"
            alt="ASCEND dashboard showing a user's Ascension level, two-day streak, daily briefing, primary mission and Cortex insight."
            width={1348}
            height={926}
            sizes="(max-width: 1280px) 100vw, 1280px"
            quality={90}
            className="h-auto w-full"
          />

          <figcaption className="border-t border-white/[0.08] px-5 py-4 text-center text-sm leading-6 text-slate-400 sm:px-8">
            A real view of how ASCEND turns a goal into a focused mission,
            explains the reasoning and makes progress visible.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
