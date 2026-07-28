"use client";

import {
  useCallback,
  useState,
} from "react";

import { ArrowLeft } from "lucide-react";

import ProgressBar from "./ProgressBar";
import StepWelcome from "./StepWelcome";
import StepIdentity from "./StepIdentity";
import StepGoal from "./StepGoal";
import StepChallenge from "./StepChallenge";
import StepNorthStar from "./StepNorthStar";
import StepBuilding from "./StepBuilding";
import StepComplete from "./StepComplete";

import {
  initialOnboardingAnswers,
  type OnboardingAnswers,
} from "./types";

export default function Onboarding() {
  const [step, setStep] =
    useState(1);

  const [
    answers,
    setAnswers,
  ] =
    useState<OnboardingAnswers>(
      initialOnboardingAnswers
    );

  const next = useCallback(() => {
    setStep((current) =>
      Math.min(
        current + 1,
        7
      )
    );
  }, []);

  function back() {
    if (step === 1) {
      window.location.href = "/";

      return;
    }

    setStep((current) =>
      Math.max(
        current - 1,
        1
      )
    );
  }

  function updateAnswer<
    Key extends keyof OnboardingAnswers
  >(
    key: Key,
    value: OnboardingAnswers[Key]
  ) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#05070B] px-6 py-24">
      {step !== 6 && (
        <button
          type="button"
          onClick={back}
          className="absolute left-6 top-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-slate-300 backdrop-blur-md transition hover:border-blue-500/30 hover:bg-white/10 hover:text-white sm:left-8 sm:top-8"
        >
          <ArrowLeft size={18} />

          <span className="font-medium">
            Back
          </span>
        </button>
      )}

      <div className="w-full max-w-5xl">
        <ProgressBar
          currentStep={step}
          totalSteps={7}
        />

        <div className="mt-10">
          {step === 1 && (
            <StepWelcome
              onNext={next}
            />
          )}

          {step === 2 && (
            <StepIdentity
              value={
                answers.identity
              }
              onSelect={(
                identity
              ) =>
                updateAnswer(
                  "identity",
                  identity
                )
              }
              onNext={next}
            />
          )}

          {step === 3 && (
            <StepGoal
              value={answers.goal}
              onSelect={(goal) =>
                updateAnswer(
                  "goal",
                  goal
                )
              }
              onNext={next}
            />
          )}

          {step === 4 && (
            <StepChallenge
              value={
                answers.challenges
              }
              onChange={(
                challenges
              ) =>
                updateAnswer(
                  "challenges",
                  challenges
                )
              }
              onNext={next}
            />
          )}

          {step === 5 && (
            <StepNorthStar
              value={
                answers.northStar
              }
              onChange={(
                northStar
              ) =>
                updateAnswer(
                  "northStar",
                  northStar
                )
              }
              onNext={next}
            />
          )}

          {step === 6 && (
            <StepBuilding
              answers={answers}
              onComplete={next}
            />
          )}

          {step === 7 && (
            <StepComplete />
          )}
        </div>
      </div>
    </main>
  );
}