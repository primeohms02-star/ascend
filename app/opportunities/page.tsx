"use client";
import { useState } from "react";
import OpportunityHeader from "./components/OpportunityHeader";
import OpportunityFilters from "./components/OpportunityFilters";
import OpportunityLibrary from "./components/OpportunityLibrary";
import AtlasInsights from "./components/AtlasInsights";
import OpportunitySearch from "./components/OpportunitySearch";
import OpportunityFeed from "@/app/components/OpportunityFeed";

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">

      <div className="mx-auto max-w-7xl px-6 py-10">

       <OpportunityHeader />

<OpportunitySearch
  value={search}
  onChange={setSearch}
/>
<OpportunityFilters
  value={filter}
  onChange={setFilter}
/>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left Content */}

          <div className="space-y-8 lg:col-span-2">

            <section>

              <h2 className="mb-6 text-2xl font-semibold text-white">
                ⭐ Recommended Opportunities
              </h2>

           <OpportunityFeed
  search={search}
  filter={filter}
/>
            </section>

            <AtlasInsights />

          </div>

          {/* Right Sidebar */}

          <div>

            <OpportunityLibrary />

          </div>

        </div>

      </div>

    </main>
  );
}