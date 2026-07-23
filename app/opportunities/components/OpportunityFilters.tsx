"use client";

const filters = [
  "All",
  "Remote",
  "Jobs",
  "Internships",
  "Scholarships",
  "AI",
  "Technology",
  "Business",
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function OpportunityFilters({
  value,
  onChange,
}: Props) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">

      {filters.map((filter) => {

        const active = value === filter;

        return (

          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`
              rounded-full
              px-4
              py-2
              text-sm
              transition

              ${
                active
                  ? "bg-cyan-500 text-slate-900 font-semibold"
                  : "border border-slate-700 bg-slate-800/50 text-slate-300 hover:border-cyan-400 hover:text-white"
              }
            `}
          >
            {filter}
          </button>

        );

      })}

    </div>
  );
}