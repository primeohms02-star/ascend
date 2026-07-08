"use client";

import { useParams, useRouter } from "next/navigation";
import { questions } from "../questions";
import { saveCompassAnswer } from "../actions";

import ProgressBar from "@/app/components/ProgressBar";
import QuestionCard from "@/app/components/QuestionCard";
import OptionButton from "@/app/components/OptionButton";

export default function CompassStepPage() {
  const params = useParams();
  const router = useRouter();

  const step = Number(params.step);

  const question = questions.find((q) => q.id === step);

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">
          Question not found.
        </h1>
      </main>
    );
  }

  async function handleOptionClick(answer: string) {
    try {
      await saveCompassAnswer(step, answer);

      console.log("✅ Answer saved!");

      if (step < questions.length) {
        router.push(`/compass/${step + 1}`);
      } else {
        router.push("/finding-your-star");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving your answer.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <ProgressBar
          current={step}
          total={questions.length}
        />

        <QuestionCard
          title={question.title}
          subtitle={question.subtitle}
        >
          <div className="space-y-4">
            {question.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                onClick={() => handleOptionClick(option)}
              />
            ))}
          </div>
        </QuestionCard>
      </div>
    </main>
  );
}