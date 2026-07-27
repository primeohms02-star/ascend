"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />

      <path
        strokeLinecap="round"
        d="m16 16 4 4"
      />
    </svg>
  );
}

function ClearIcon() {
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
        d="m6 6 12 12M18 6 6 18"
      />
    </svg>
  );
}

export default function OpportunitySearch({
  value,
  onChange,
}: Props) {
  return (
    <div>
      <label
        htmlFor="opportunity-search"
        className="mb-3 block text-sm font-semibold text-white"
      >
        Search opportunities
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
          <SearchIcon />
        </span>

        <input
          id="opportunity-search"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          type="search"
          autoComplete="off"
          placeholder="Search by role, company, or skill..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/50 py-4 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 sm:text-base"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear opportunity search"
            className="absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Atlas searches opportunity titles, organizations, and
        identified skills.
      </p>
    </div>
  );
}