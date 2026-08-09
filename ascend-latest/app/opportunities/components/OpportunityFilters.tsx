"use client";

type FilterOption = {
  label: string;
  value: string;
};

const filters: FilterOption[] = [
  {
    label: "All",
    value: "All",
  },
  {
    label: "Nigeria",
    value: "Nigeria",
  },
  {
    label: "Africa",
    value: "Africa",
  },
  {
    label: "Remote",
    value: "Remote",
  },
  {
    label: "Jobs",
    value: "Job",
  },
  {
    label: "Internships",
    value: "Internship",
  },
  {
    label: "Scholarships",
    value: "Scholarship",
  },
  {
    label: "Fellowships",
    value: "Fellowship",
  },
  {
    label: "Grants",
    value: "Grant",
  },
  {
    label: "Accelerators",
    value: "Accelerator",
  },
  {
    label: "Competitions",
    value: "Competition",
  },
  {
    label: "Hackathons",
    value: "Hackathon",
  },
  {
    label: "Mentorships",
    value: "Mentorship",
  },
  {
    label: "Volunteering",
    value: "Volunteering",
  },
  {
    label: "Courses",
    value: "Course",
  },
  {
    label: "Programmes",
    value: "Program",
  },
  {
    label: "AI",
    value: "AI",
  },
  {
    label: "Technology",
    value: "Technology",
  },
  {
    label: "Business",
    value: "Business",
  },
  {
    label: "Finance",
    value: "Finance",
  },
  {
    label: "Fashion",
    value: "Fashion",
  },
  {
    label: "Music",
    value: "Music",
  },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M7 12h10m-7 6h4"
      />
    </svg>
  );
}

export default function OpportunityFilters({
  value,
  onChange,
}: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-slate-500">
          <FilterIcon />
        </span>

        <p className="text-sm font-semibold text-white">
          Filter opportunities
        </p>
      </div>

      <div
        role="group"
        aria-label="Filter opportunities"
        className="flex flex-wrap gap-2.5"
      >
        {filters.map((filter) => {
          const active =
            value === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() =>
                onChange(filter.value)
              }
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                active
                  ? "border-cyan-400 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/10"
                  : "border-slate-700 bg-slate-950/40 text-slate-400 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
