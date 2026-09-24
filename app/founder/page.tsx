import Link from "next/link";
import Image from "next/image";

import {
  ArrowUpRight,
  Compass,
  Lightbulb,
  Target,
} from "lucide-react";

import PublicPageShell from "@/app/components/PublicPageShell";

import {
  ASCEND_LINKEDIN_URL,
  FOUNDER_ID,
  FOUNDER_LINKEDIN_URL,
  FOUNDER_NAME,
  FOUNDER_URL,
  ORGANIZATION_ID,
  PRAEVORYN_FOUNDER_URL,
  PRAEVORYN_ORGANIZATION_ID,
  WEBSITE_ID,
  createPublicPageMetadata,
} from "@/lib/seo";

const description =
  "Chukwudumebi Orakwue is a technology founder, the Founder & CEO of Praevoryn, and the Founder & CEO of ASCEND, an operating system for human potential.";

export const metadata =
  createPublicPageMetadata({
    title:
      `${FOUNDER_NAME} — Founder & CEO`,

    description,

    path:
      "/founder",

    socialImagePath:
      "/chukwudumebi-orakwue.webp",

    socialImageAlt:
      "Chukwudumebi Orakwue, Founder and CEO of Praevoryn and ASCEND",
  });

const profileStructuredData = {
  "@context":
    "https://schema.org",

  "@type":
    "ProfilePage",

  "@id":
    `${FOUNDER_URL}#profile-page`,

  url:
    FOUNDER_URL,

  name:
    `${FOUNDER_NAME} — Founder & CEO of Praevoryn and ASCEND`,

  description,

  isPartOf: {
    "@id":
      WEBSITE_ID,
  },

  about: {
    "@id":
      FOUNDER_ID,
  },

  mainEntity: {
    "@type":
      "Person",

    "@id":
      FOUNDER_ID,

    name:
      FOUNDER_NAME,

    givenName:
      "Chukwudumebi",

    familyName:
      "Orakwue",

    url:
      FOUNDER_URL,

    jobTitle:
      "Founder & Chief Executive Officer",

    description:
      "Technology founder, Founder and Chief Executive Officer of Praevoryn, and Founder and Chief Executive Officer of ASCEND.",

    image:
      "https://ascendai.space/chukwudumebi-orakwue.webp",

    worksFor: [
      {
        "@id":
          PRAEVORYN_ORGANIZATION_ID,
      },
      {
        "@id":
          ORGANIZATION_ID,
      },
    ],

    knowsAbout: [
      "Human-centred technology",
      "Human potential",
      "Product strategy",
      "Strategic decision support",
      "Opportunity discovery",
      "Personal development",
    ],

    sameAs: [
      FOUNDER_LINKEDIN_URL,
      PRAEVORYN_FOUNDER_URL,
    ],
  },
};

const leadershipAreas = [
  {
    title:
      "Product Vision",

    description:
      "Defining how ASCEND connects purpose, direction, strategic intelligence, opportunities, action and long-term growth.",

    icon:
      Compass,
  },

  {
    title:
      "Product Strategy",

    description:
      "Shaping ASCEND as one coherent system rather than a collection of disconnected productivity tools.",

    icon:
      Target,
  },

  {
    title:
      "Human Potential",

    description:
      "Building technology around stronger judgment, meaningful action and the person each user is becoming.",

    icon:
      Lightbulb,
  },
];

export default function FounderPage() {
  return (
    <PublicPageShell
      eyebrow="Founder & Leadership"
      title={FOUNDER_NAME}
      description="Founder & CEO of Praevoryn and ASCEND — building human-centred technology that helps people find direction and make meaningful progress."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              profileStructuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Founder &amp; CEO
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Building ASCEND around direction,
            judgment and meaningful growth.
          </h2>

          <div className="mt-7 space-y-6 text-base leading-8 text-slate-400">
            <p>
              <span className="font-semibold text-white">
                Chukwudumebi Orakwue
              </span>{" "}
              is a technology founder, the Founder
              &amp; CEO of Praevoryn, and the
              Founder &amp; CEO of ASCEND—an
              operating system for human potential.
            </p>

            <p>
              ASCEND was founded in June 2026
              around a simple idea: people can
              possess ambition, ability and
              potential while still lacking the
              clarity and structure required to
              move forward deliberately.
            </p>

            <p>
              As founder, Chukwudumebi leads the
              product vision, strategy, design and
              development of ASCEND — building a
              connected system around purpose,
              direction, strategic intelligence,
              meaningful opportunities, action,
              momentum and long-term growth.
            </p>

            <p>
              ASCEND is designed to help people
              understand their direction, examine
              their choices and take stronger
              action while preserving their own
              judgment.
            </p>
          </div>
        </article>

        <aside className="overflow-hidden rounded-3xl border border-blue-400/20 bg-blue-500/[0.07]">
          <div className="relative aspect-[4/5] overflow-hidden border-b border-white/10 bg-slate-950">
            <Image
              src="/chukwudumebi-orakwue.webp"
              alt="Chukwudumebi Orakwue, Founder and CEO of ASCEND"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 32vw"
              className="object-cover object-[center_18%]"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/75 to-transparent" />
          </div>

          <div className="p-7 sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
              Leadership
            </p>

            <dl className="mt-7 space-y-6">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Name
              </dt>

              <dd className="mt-2 text-lg font-semibold text-white">
                Chukwudumebi Orakwue
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Role
              </dt>

              <dd className="mt-2 text-lg font-semibold text-white">
                Founder &amp; CEO
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Organization
              </dt>

              <dd className="mt-2 text-lg font-semibold text-white">
                Praevoryn &amp; ASCEND
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Founded
              </dt>

              <dd className="mt-2 text-lg font-semibold text-white">
                June 2026
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Website
              </dt>

              <dd className="mt-2">
                <a
                  href="https://ascendai.space"
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  ascendai.space
                </a>
              </dd>
            </div>
            </dl>
          </div>
        </aside>
      </section>

      <section className="mt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            What the founder leads
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Building one connected system
            around human direction.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {leadershipAreas.map(
            (area) => {
              const Icon =
                area.icon;

              return (
                <article
                  key={
                    area.title
                  }
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <Icon
                      size={22}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {
                      area.title
                    }
                  </h3>

                  <p className="mt-4 leading-7 text-slate-400">
                    {
                      area.description
                    }
                  </p>
                </article>
              );
            }
          )}
        </div>
      </section>

      <section className="mt-20 rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
          Official Profiles
        </p>

        <h2 className="mt-5 text-3xl font-bold text-white">
          Connect with the founder
          and ASCEND.
        </h2>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <a
            href={
              FOUNDER_LINKEDIN_URL
            }
            target="_blank"
            rel="me noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Chukwudumebi on LinkedIn

            <ArrowUpRight
              size={17}
              aria-hidden="true"
            />
          </a>

          <a
            href={
              ASCEND_LINKEDIN_URL
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.08] hover:text-white"
          >
            ASCEND on LinkedIn

            <ArrowUpRight
              size={17}
              aria-hidden="true"
            />
          </a>

          <a
            href={
              PRAEVORYN_FOUNDER_URL
            }
            target="_blank"
            rel="me noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.08] hover:text-white"
          >
            Founder profile on Praevoryn

            <ArrowUpRight
              size={17}
              aria-hidden="true"
            />
          </a>

          <Link
            href="/about"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            About ASCEND
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
