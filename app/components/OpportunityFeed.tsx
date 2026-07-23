"use client";

import OpportunityCard from "@/app/opportunities/components/OpportunityCard";
import { useEffect, useState } from "react";
import { explainOpportunity } from "@/lib/atlas/opportunities/explainer";
import { RankedOpportunity } from "@/lib/atlas/opportunities/types";


type Props = {
  search: string;
  filter: string;
};

export default function OpportunityFeed({
  search,
  filter,
}: Props) {
 const [opportunities, setOpportunities] =
  useState<RankedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Temporary profile until we connect Atlas Memory
 const profile = {
  clerkId: "temporary",
  careerGoal: "AI Engineer",
  skills: [
    "Python",
    "React",
    "Git",
    "TypeScript",
  ],
  interests: [
    "Artificial Intelligence",
    "Technology",
  ],
  experienceLevel: "intermediate" as const,
  education: "",
  location: "Remote",
  preferredCountries: [],
  remoteOnly: true,
  industries: [
    "Technology",
    "AI",
  ],
  languages: [
    "English",
  ],
};
  useEffect(() => {
    async function loadOpportunities() {
      try {
        const response = await fetch("/api/opportunities");
        const data = await response.json();
        setOpportunities(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadOpportunities();
  }, []);

  if (loading) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-8">
      <div className="text-center text-slate-400">
        ATLAS is discovering opportunities...
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6">
   {opportunities
  .filter((opportunity) => {

   const query = search.toLowerCase();

const matchesSearch =
  !query ||
  opportunity.title.toLowerCase().includes(query) ||
  opportunity.company.toLowerCase().includes(query) ||
  (opportunity.tags ?? []).some(tag =>
    tag.toLowerCase().includes(query)
  );

const matchesFilter =
  filter === "All" ||
  (filter === "Remote" && opportunity.remote) ||
  opportunity.category?.toLowerCase() === filter.toLowerCase() ||
  (opportunity.tags ?? []).some(tag =>
    tag.toLowerCase() === filter.toLowerCase()
  );

return matchesSearch && matchesFilter;

  })
  .map((opportunity) => {
        const insight = explainOpportunity(opportunity, profile);

      return (
  <OpportunityCard
    key={opportunity.id}
    opportunity={opportunity}
    insight={insight}
  />
);
      })}
    </div>
  );
}