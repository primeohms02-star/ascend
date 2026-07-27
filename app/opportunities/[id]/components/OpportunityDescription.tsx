import { extractOpportunity } from "@/lib/atlas/opportunities/extractor";
import { normalizeOpportunityDescription } from "@/lib/atlas/opportunities/normalize";

type Props = {
  opportunity: {
    description?: string;
  };
};

function SectionIcon({
  type,
}: {
  type: "overview" | "responsibilities" | "requirements" | "benefits";
}) {
  const icons = {
    overview: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h10"
      />
    ),
    responsibilities: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"
      />
    ),
    requirements: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4L19 6"
      />
    ),
    benefits: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v18m-6-6 6 6 6-6M6 9l6-6 6 6"
      />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      {icons[type]}
    </svg>
  );
}

function DetailList({
  items,
  accentColor,
}: {
  items: string[];
  accentColor: string;
}) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex gap-3 text-sm leading-7 text-slate-300 sm:text-base"
        >
          <span
            aria-hidden="true"
            className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${accentColor}`}
          />

          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function OpportunityDescription({
  opportunity,
}: Props) {
  const cleaned = normalizeOpportunityDescription(
    opportunity.description
  );

  const parsed = extractOpportunity(cleaned);

  const hasOverview =
    typeof parsed.overview === "string" &&
    parsed.overview.trim().length > 0;

  const hasResponsibilities =
    parsed.responsibilities.length > 0;

  const hasRequirements =
    parsed.requirements.length > 0;

  const hasBenefits =
    parsed.benefits.length > 0;

  return (
    <div
      id="opportunity-overview"
      className="scroll-mt-8 space-y-6"
    >
      {/* Section header */}

      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Opportunity Details
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Review the opportunity
        </h2>

        <p className="mt-2 max-w-2xl leading-7 text-slate-400">
          Examine the original responsibilities, requirements, and
          benefits behind Atlas&apos;s assessment.
        </p>
      </div>

      {/* Overview */}

      <section
        aria-labelledby="opportunity-overview-heading"
        className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <SectionIcon type="overview" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              At a glance
            </p>

            <h3
              id="opportunity-overview-heading"
              className="mt-1 text-xl font-semibold text-white sm:text-2xl"
            >
              Overview
            </h3>
          </div>
        </div>

        <p className="mt-6 whitespace-pre-line text-sm leading-8 text-slate-300 sm:text-base">
          {hasOverview
            ? parsed.overview
            : "A detailed overview is not currently available. Review the original posting before making your decision."}
        </p>
      </section>

      {/* Responsibilities */}

      {hasResponsibilities && (
        <section
          aria-labelledby="opportunity-responsibilities-heading"
          className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
              <SectionIcon type="responsibilities" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                What you will do
              </p>

              <h3
                id="opportunity-responsibilities-heading"
                className="mt-1 text-xl font-semibold text-white sm:text-2xl"
              >
                Responsibilities
              </h3>
            </div>
          </div>

          <DetailList
            items={parsed.responsibilities}
            accentColor="bg-blue-400"
          />
        </section>
      )}

      {/* Requirements */}

      {hasRequirements && (
        <section
          aria-labelledby="opportunity-requirements-heading"
          className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <SectionIcon type="requirements" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                What you will need
              </p>

              <h3
                id="opportunity-requirements-heading"
                className="mt-1 text-xl font-semibold text-white sm:text-2xl"
              >
                Requirements
              </h3>
            </div>
          </div>

          <DetailList
            items={parsed.requirements}
            accentColor="bg-amber-400"
          />
        </section>
      )}

      {/* Benefits */}

      {hasBenefits && (
        <section
          aria-labelledby="opportunity-benefits-heading"
          className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <SectionIcon type="benefits" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                What is offered
              </p>

              <h3
                id="opportunity-benefits-heading"
                className="mt-1 text-xl font-semibold text-white sm:text-2xl"
              >
                Benefits
              </h3>
            </div>
          </div>

          <DetailList
            items={parsed.benefits}
            accentColor="bg-emerald-400"
          />
        </section>
      )}
    </div>
  );
}