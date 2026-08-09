"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Opportunity } from "@/lib/engine/opportunities";

type OpportunityCardProps = {
  opportunity: Opportunity;
};

export default function OpportunityCard({
  opportunity,
}: OpportunityCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between">

        <div>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
            {opportunity.category}
          </span>

          <h3 className="mt-4 text-xl font-bold text-slate-900">
            {opportunity.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {opportunity.provider}
          </p>

        </div>

        <div className="rounded-2xl bg-green-100 px-3 py-2 text-sm font-bold text-green-700">
          {opportunity.score}%
        </div>

      </div>

      <p className="mt-5 leading-7 text-slate-600">
        {opportunity.description}
      </p>

      <div className="mt-6 space-y-2 text-sm">

        {opportunity.location && (
          <p>
            🌍 <strong>Location:</strong> {opportunity.location}
          </p>
        )}

        {opportunity.deadline && (
          <p>
            ⏳ <strong>Deadline:</strong> {opportunity.deadline}
          </p>
        )}

        {opportunity.difficulty && (
          <p>
            📈 <strong>Difficulty:</strong> {opportunity.difficulty}
          </p>
        )}

      </div>

      <Link
        href={opportunity.url}
        target="_blank"
        className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
      >
        View Opportunity →
      </Link>
    </motion.div>
  );
}