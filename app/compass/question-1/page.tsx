"use client";

import Link from "next/link";
import ProgressBar from "../components/ProgressBar";
import QuestionCard from "../components/QuestionCard";

const options = [
  "🎓 Secondary School",
  "📚 University",
  "🎉 Recent Graduate",
  "💼 Working Professional",
  "🚀 Entrepreneur",
  "🔄 Career Transition",
];

export default function QuestionOne() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">

        <ProgressBar
          current={1}
          total={10}
        />

        <QuestionCard
          title="Where are you in your journey today?"
          subtitle="Choose the option that best describes your current stage."
        >
          <div className="space-y-4">
            {options.map((option) => (
              <button
                key={option}
                className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-5 text-left transition hover:border-black hover:bg-slate-100"
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <Link
              href="/compass/question-2"
              className="rounded-xl bg-black px-8 py-4 font-semibold text-white transition hover:bg-slate-800"
            >
              Continue Journey →
            </Link>
          </div>
        </QuestionCard>

      </div>
    </main>
  );
}