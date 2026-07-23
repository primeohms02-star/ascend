"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function OpportunitySearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="mb-8">

      <div className="relative">

        <Search
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
        />

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="text"
          placeholder="Search opportunities..."
          className="
            w-full
            rounded-2xl
            border
            border-slate-700
            bg-slate-900/60
            py-4
            pl-12
            pr-4
            text-white
            placeholder:text-slate-500
            outline-none
            transition
            focus:border-cyan-500
          "
        />

      </div>

    </div>
  );
}