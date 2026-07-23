import { RankedOpportunity } from "@/lib/atlas/opportunities/types";

type Props = {
  opportunity: RankedOpportunity;
};

export default function OpportunityDescription({
  opportunity,
}: Props) {
  return (
    <section className="mt-8 rounded-3xl border border-slate-700 bg-slate-900/60 p-8">

      <h2 className="mb-6 text-2xl font-bold text-white">
        About this Opportunity
      </h2>

      <p className="leading-8 text-slate-300">
        {opportunity.description ??
          "No detailed description is available yet. Atlas will display the complete opportunity description once the provider supplies it."}
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">

        <div>

          <h3 className="mb-3 text-lg font-semibold text-white">
            Requirements
          </h3>

          <ul className="space-y-2">

            {(opportunity.tags ?? []).map((tag) => (

              <li
                key={tag}
                className="text-slate-300"
              >
                • {tag}
              </li>

            ))}

          </ul>

        </div>

        <div>

          <h3 className="mb-3 text-lg font-semibold text-white">
            Opportunity Details
          </h3>

          <div className="space-y-3 text-slate-300">

            <div>
              <strong className="text-white">
                Company:
              </strong>{" "}
              {opportunity.company}
            </div>

            <div>
              <strong className="text-white">
                Remote:
              </strong>{" "}
              {opportunity.remote ? "Yes" : "No"}
            </div>

            <div>
              <strong className="text-white">
                Category:
              </strong>{" "}
              {opportunity.category ?? "General"}
            </div>

            <div>
              <strong className="text-white">
                Source:
              </strong>{" "}
              {opportunity.source ?? "Atlas"}
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}