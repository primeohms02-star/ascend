"use client";

import { useEffect, useState } from "react";
import AtlasCard from "./AtlasCard";
import OpportunityStatusSelector from "@/app/components/OpportunityStatusSelector";

type SavedOpportunity = {
  id: string;
  opportunity_id: string;
  title: string;
  company: string;
  source: string;
  status: string;
  created_at: string;
};

export default function SavedOpportunities() {
  const [saved, setSaved] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/opportunities/saved");
        const data = await res.json();

        setSaved(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSaved();
  }, []);

  return (
    <AtlasCard>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Saved Opportunities
        </h2>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
          {saved.length}
        </span>
      </div>

      {loading ? (
        <p className="text-slate-400">
          Loading saved opportunities...
        </p>
      ) : saved.length === 0 ? (
        <p className="text-slate-400">
          You haven't saved any opportunities yet.
        </p>
      ) : (
        <div className="space-y-4">
          {saved.map((opportunity) => (
            <div
              key={opportunity.id}
              className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4"
            >
              <div className="flex items-center justify-between gap-4">

                <div>
                  <h3 className="font-semibold text-white">
                    {opportunity.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {opportunity.company}
                  </p>

                  <p className="mt-2 text-xs text-blue-400">
                    {opportunity.source}
                  </p>
                </div>

                <OpportunityStatusSelector
                  opportunityId={opportunity.opportunity_id}
                  initialStatus={opportunity.status}
                />

              </div>

              <div className="mt-4 text-xs text-slate-500">
                Saved on{" "}
                {new Date(
                  opportunity.created_at
                ).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </AtlasCard>
  );
}