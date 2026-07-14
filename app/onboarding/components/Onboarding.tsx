"use client";

import { useState } from "react";

import ProgressBar from "./ProgressBar";
import StepWelcome from "./StepWelcome";
import StepIdentity from "./StepIdentity";
import StepGoal from "./StepGoal";
import StepChallenge from "./StepChallenge";
import StepNorthStar from "./StepNorthStar";
import StepBuilding from "./StepBuilding";
import StepComplete from "./StepComplete";

export default function Onboarding() {
  const [step, setStep] = useState(1);

  const next = () => setStep((prev) => Math.min(prev + 1, 7));

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070B] px-6">
      <div className="w-full max-w-4xl">

        <ProgressBar
          currentStep={step}
          totalSteps={7}
        />

        <div className="mt-10">

          {step === 1 && <StepWelcome onNext={next} />}

          {step === 2 && <StepIdentity onNext={next} />}

          {step === 3 && <StepGoal onNext={next} />}

          {step === 4 && <StepChallenge onNext={next} />}

          {step === 5 && <StepNorthStar onNext={next} />}

          {step === 6 && <StepBuilding onNext={next} />}

          {step === 7 && <StepComplete />}

        </div>

      </div>
    </main>
  );
}