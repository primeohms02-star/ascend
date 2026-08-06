import { extractOpportunity } from "@/lib/atlas/opportunities/extractor";
import { normalizeOpportunityDescription } from "@/lib/atlas/opportunities/normalize";
import type { Opportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  opportunity: Opportunity;
};

type OverviewDetail = {
  label: string;
  value: string;
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

function formatDeadline(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildOverviewDetails(opportunity: Opportunity): OverviewDetail[] {
  const details: OverviewDetail[] = [
    {
      label:
        opportunity.category?.toLowerCase() === "job"
          ? "Job title"
          : "Opportunity title",
      value: opportunity.title,
    },
  ];

  if (opportunity.company) {
    details.push({
      label: "Organisation",
      value: opportunity.company,
    });
  }

  const location = opportunity.remote
    ? opportunity.location &&
      !opportunity.location.toLowerCase().startsWith("remote")
      ? `Remote · ${opportunity.location}`
      : opportunity.location || "Remote"
    : opportunity.location;

  if (location) {
    details.push({
      label: "Location",
      value: location,
    });
  }

  if (opportunity.salary) {
    details.push({
      label: "Salary or funding",
      value: opportunity.salary,
    });
  }

  if (opportunity.employmentType) {
    details.push({
      label: "Employment type",
      value: opportunity.employmentType,
    });
  }

  const deadline = formatDeadline(opportunity.deadline);

  if (deadline) {
    details.push({
      label: "Deadline",
      value: deadline,
    });
  }

  return details;
}

function chooseItems(primary: string[] | undefined, fallback: string[]): string[] {
  return primary?.filter((item) => item.trim().length > 0) ?? fallback;
}

export default function OpportunityDescription({
  opportunity,
}: Props) {
  const cleaned = normalizeOpportunityDescription(opportunity.description);
  const parsed = extractOpportunity(cleaned);
  const overview = opportunity.summary?.trim() || parsed.overview.trim();
  const responsibilities = chooseItems(
    opportunity.responsibilities,
    parsed.responsibilities
  );
  const requirements = chooseItems(opportunity.requirements, parsed.requirements);
  const benefits = chooseItems(opportunity.benefits, parsed.benefits);
  const overviewDetails = buildOverviewDetails(opportunity);

  return (
    <div
      id="opportunity-overview"
      className="scroll-mt-8 space-y-6"
    >
      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Opportunity Details
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Review the opportunity
        </h2>

        <p className="mt-2 max-w-2xl leading-7 text-slate-400">
          Review the details available from the original opportunity source before
          making your decision.
        </p>
      </div>

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

        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {overviewDetails.map((detail) => (
            <div
              key={`${detail.label}-${detail.value}`}
              className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
            >
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {detail.label}
              </dt>

              <dd className="mt-2 text-sm font-medium leading-6 text-slate-200 sm:text-base">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {opportunity.category?.toLowerCase() === "job"
              ? "Job summary"
              : "Opportunity summary"}
          </p>

          <p className="mt-3 whitespace-pre-line text-sm leading-8 text-slate-300 sm:text-base">
            {overview ||
              "A detailed summary is not currently available. Review the original posting before making your decision."}
          </p>
        </div>
      </section>

      {responsibilities.length > 0 && (
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

          <DetailList items={responsibilities} accentColor="bg-blue-400" />
        </section>
      )}

      {requirements.length > 0 && (
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

          <DetailList items={requirements} accentColor="bg-amber-400" />
        </section>
      )}

      {benefits.length > 0 && (
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

          <DetailList items={benefits} accentColor="bg-emerald-400" />
        </section>
      )}
    </div>
  );
}
