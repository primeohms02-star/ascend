"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "./questions";
import Report from "./report";

export default function CompassPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);

  const question = questions[currentQuestion];
  const selectedAnswer = answers[question.id] || "";

  const nextQuestion = () => {
    if (!selectedAnswer) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  if (completed) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl">
          <Report answers={answers} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl">

        <div className="mb-10">
          <div className="flex justify-between text-sm text-slate-500 mb-3">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <span>
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-500"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl bg-white shadow-xl p-10"
          >
            <p className="uppercase tracking-[0.3em] text-sm text-slate-500">
              ASCEND Compass
            </p>

            <h1 className="mt-4 text-4xl font-bold">
              {question.title}
            </h1>

            <p className="mt-5 text-lg text-slate-600">
              {question.subtitle}
            </p>

            <div className="mt-10 space-y-4">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: option,
                    }))
                  }
                  className={`w-full rounded-2xl border p-5 text-left transition-all ${
                    selectedAnswer === option
                      ? "border-black bg-black text-white"
                      : "border-slate-200 hover:border-black"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-10 flex justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="rounded-xl border px-6 py-3 disabled:opacity-30"
              >
                Back
              </button>

              <button
                onClick={nextQuestion}
                disabled={!selectedAnswer}
                className="rounded-xl bg-black px-8 py-3 text-white disabled:opacity-30"
              >
                {currentQuestion === questions.length - 1
                  ? "Show My Compass"
                  : "Continue"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </main>
  );
}