import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import OpportunityLibraryView from "./components/OpportunityLibraryView";

import {
  getOpportunitiesByCategory,
  getOpportunityLibraryCounts,
  type OpportunityLibraryCategory,
} from "@/lib/atlas/opportunities/memory";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

const VALID_CATEGORIES: OpportunityLibraryCategory[] = [
  "saved",
  "applied",
  "completed",
];

function isValidCategory(
  category: string
): category is OpportunityLibraryCategory {
  return VALID_CATEGORIES.includes(
    category as OpportunityLibraryCategory
  );
}

export default async function OpportunityLibraryPage({
  params,
}: Props) {
  const { category } = await params;

  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  if (!isValidCategory(category)) {
    notFound();
  }

  const [opportunities, counts] =
    await Promise.all([
      getOpportunitiesByCategory(
        userId,
        category
      ),

      getOpportunityLibraryCounts(userId),
    ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#08111f] to-[#0f172a]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <OpportunityLibraryView
          category={category}
          initialOpportunities={opportunities}
          counts={counts}
        />
      </div>
    </main>
  );
}