import Link from "next/link";

import PublicPageShell from "@/app/components/PublicPageShell";
import {
  createPublicPageMetadata,
  SITE_URL,
} from "@/lib/seo";

export const metadata = createPublicPageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Get clear answers about ASCEND, Atlas strategic intelligence, Compass, missions, opportunities, momentum and ASCEND Music.",
  path: "/faq",
});

const questions = [
  {
    question: "What is ASCEND?",
    answer:
      "ASCEND is an operating system for human potential. It turns your identity, goals and challenges into a North Star, strategic missions, relevant opportunity guidance, reflection and measurable momentum.",
  },
  {
    question: "Who is ASCEND for?",
    answer:
      "ASCEND is for people who have ambition but need clearer direction and a practical way to act on it. It can support students, graduates, professionals, founders and creators without prescribing one fixed life or career path.",
  },
  {
    question: "What is Atlas?",
    answer:
      "Atlas is ASCEND's strategic intelligence. It uses your live North Star, active mission, progress, reflections and relevant journey context to help you compare choices, identify tradeoffs and choose useful next steps. Atlas is not a generic chatbot and does not replace your judgment.",
  },
  {
    question: "Does talking to Atlas change my mission or XP?",
    answer:
      "No. An ordinary Atlas conversation can provide guidance and remember useful context, but it cannot create, replace, progress or complete a mission and it cannot award XP. Those changes happen only through the appropriate mission actions.",
  },
  {
    question: "How is Compass different from Atlas?",
    answer:
      "Compass helps reveal your identity, goals, challenges and future direction, then turns that understanding into a North Star. Atlas uses that live direction and your current ASCEND state to support decisions and strategic action.",
  },
  {
    question: "What are strategic missions?",
    answer:
      "Strategic missions are focused actions connected to your current reality and North Star. A mission is meant to produce useful evidence of progress rather than add another disconnected task to your day.",
  },
  {
    question: "How does ASCEND help with opportunities?",
    answer:
      "ASCEND's authenticated opportunities workspace helps users discover and evaluate relevant jobs, internships, scholarships, grants, fellowships, programs and creative opportunities. Atlas can help assess alignment, timing, effort and potential value using available opportunity information and your live context.",
  },
  {
    question: "What is ASCEND Music?",
    answer:
      "ASCEND Music is the focused experience for people interested in the music industry and creative careers. It connects music goals, skill development and relevant opportunities to the wider ASCEND journey.",
  },
  {
    question: "Does ASCEND make important decisions for me?",
    answer:
      "No. ASCEND is designed to strengthen reflection, judgment and action. Atlas can expose options and tradeoffs, but you remain responsible for personal, career, financial, health, legal and other important decisions.",
  },
] as const;

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/faq#faq`,
  url: `${SITE_URL}/faq`,
  name: "ASCEND Frequently Asked Questions",
  isPartOf: {
    "@id": `${SITE_URL}/#website`,
  },
  about: {
    "@id": `${SITE_URL}/#software`,
  },
  mainEntity: questions.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <PublicPageShell
      eyebrow="ASCEND FAQ"
      title="Clear answers about ASCEND"
      description="Understand what ASCEND does, how Atlas and Compass differ, and which actions can change your missions or progress."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <section aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            The short definition
          </p>

          <h2
            id="faq-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Direction, action and evidence of growth
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-400">
            ASCEND helps turn uncertainty into a personal North Star,
            focused missions, better-informed decisions and visible
            momentum. It supports your judgment instead of trying to
            replace it.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5">
          {questions.map(({ question, answer }) => (
            <article
              key={question}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 sm:p-8"
            >
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {question}
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                {answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-7 text-center sm:p-10">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to turn direction into action?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Begin with your identity and current reality. ASCEND will help
          you define a North Star and take the next meaningful step.
        </p>

        <Link
          href="/sign-up"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
        >
          Start Your Journey
        </Link>
      </section>
    </PublicPageShell>
  );
}
