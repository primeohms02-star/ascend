import {
  ChevronDown,
  Compass,
  Headphones,
  MapPin,
  Radio,
  Sparkles,
  Target,
} from "lucide-react";

import PublicPageShell from "@/app/components/PublicPageShell";
import { createPublicPageMetadata } from "@/lib/seo";

import MusicLandingActions from "./MusicLandingActions";
import MusicStructuredData from "./MusicStructuredData";
import {
  MUSIC_PAGE_DESCRIPTION,
  MUSIC_PAGE_HEADING,
  MUSIC_PAGE_INTRODUCTION,
  MUSIC_PAGE_PATH,
  MUSIC_PAGE_TITLE,
  MUSIC_SOCIAL_IMAGE_ALT,
  musicFaqs,
} from "./musicSeo";

export const metadata = createPublicPageMetadata({
  title: MUSIC_PAGE_TITLE,
  description: MUSIC_PAGE_DESCRIPTION,
  path: MUSIC_PAGE_PATH,
  socialImagePath: "/music/opengraph-image",
  socialImageAlt: MUSIC_SOCIAL_IMAGE_ALT,
});

const pathwayBenefits = [
  {
    icon: Headphones,
    title: "Define your music identity",
    description:
      "Tell ASCEND about your roles, genres, career stage, current skills and the barriers affecting your progress.",
  },
  {
    icon: Compass,
    title: "Give Atlas better context",
    description:
      "Your Music Pathway helps Atlas understand the creative direction, immediate goal and music decisions you are working through.",
  },
  {
    icon: Radio,
    title: "Find relevant opportunities",
    description:
      "Explore grants, showcases, residencies, competitions, training and industry programmes across Nigeria, Africa and the world.",
  },
];

const pathwayFlow = [
  {
    number: "01",
    title: "Share where you are",
    detail: "Roles, genres, skills and career stage.",
  },
  {
    number: "02",
    title: "Define where you are going",
    detail: "An immediate goal and a clear Music North Star.",
  },
  {
    number: "03",
    title: "Use Atlas with deeper context",
    detail: "Discuss your next music-career decision with guidance grounded in your pathway.",
  },
  {
    number: "04",
    title: "Explore aligned possibilities",
    detail: "See music opportunities with your location, stage and direction in view.",
  },
];

export default function MusicPage() {
  return (
    <>
      <MusicStructuredData />

      <PublicPageShell
        eyebrow="ASCEND Music · A Specialist Pathway"
        title={MUSIC_PAGE_HEADING}
        description={MUSIC_PAGE_INTRODUCTION}
      >
      <section className="-mt-6 rounded-[2rem] border border-blue-300/15 bg-gradient-to-br from-blue-500/[0.1] via-slate-950/90 to-violet-500/[0.06] p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-400/10 text-cyan-300">
          <Sparkles size={25} aria-hidden="true" />
        </div>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            ASCEND Music is a specialist pathway inside ASCEND—not
            a separate product or a generic music directory. It gives
            artists and music professionals a clear way to define their
            creative identity, career stage and immediate goal.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            Atlas uses that context to support better decisions and
            surface relevant music grants, showcases, residencies,
            competitions, training and industry programmes. Your main
            North Star, active mission and progress remain intact.
          </p>

        <MusicLandingActions />
      </section>

      <section
        aria-labelledby="music-benefits-heading"
        className="mt-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            What It Adds
          </p>
          <h2
            id="music-benefits-heading"
            className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl"
          >
            Music context. The same ASCEND system.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pathwayBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="rounded-3xl border border-white/[0.09] bg-white/[0.03] p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-400/10 text-cyan-300">
                  <Icon size={21} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="music-flow-heading"
        className="mt-20 grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start"
      >
        <div className="lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
            One Music Session
          </p>
          <h2
            id="music-flow-heading"
            className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl"
          >
            Make your direction useful to Atlas.
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-slate-400">
            The pathway captures the information that generic career
            tools usually miss, then makes it available to the parts
            of ASCEND that help you think and discover opportunities.
          </p>
        </div>

        <div className="space-y-4">
          {pathwayFlow.map((step) => (
            <article
              key={step.number}
              className="grid gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.03] p-5 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/[0.08] text-sm font-bold text-cyan-300">
                {step.number}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {step.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#070C14] p-7 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/[0.08] text-violet-200">
              <MapPin size={22} aria-hidden="true" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-violet-300">
              Built with African Talent in Mind
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Rooted in Africa. Open to the world.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-400">
              ASCEND Music gives added attention to opportunities
              across Nigeria and Africa while keeping global pathways
              visible for artists and professionals ready to expand.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-300/15 bg-blue-400/[0.055] p-6">
            <div className="flex items-center gap-3 text-cyan-300">
              <Target size={21} aria-hidden="true" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                Designed For
              </p>
            </div>
            <p className="mt-4 leading-7 text-slate-300">
              Artists · Producers · Songwriters · DJs · Managers ·
              Engineers · Music entrepreneurs · Industry professionals
            </p>
          </div>
        </div>
      </section>

        <section
          aria-labelledby="music-questions-heading"
          className="mt-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Clear Answers
            </p>
            <h2
              id="music-questions-heading"
              className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl"
            >
              Questions about ASCEND Music.
            </h2>
            <p className="mt-5 leading-7 text-slate-400">
              Understand who the pathway serves, what it adds and how
              it connects music-specific context to Atlas.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl space-y-3">
            {musicFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/[0.09] bg-white/[0.03] px-5 py-1 open:border-blue-300/20 open:bg-blue-400/[0.045] sm:px-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left font-semibold text-white [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={19}
                    aria-hidden="true"
                    className="shrink-0 text-cyan-300 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-3xl pb-5 text-sm leading-7 text-slate-400 sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </PublicPageShell>
    </>
  );
}
