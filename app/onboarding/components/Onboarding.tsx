"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

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

  const back = () => {
    if (step === 1) {
      window.location.href = "/";
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#05070B] px-6">

      {/* Back Button */}

      <button
        onClick={back}
        className="absolute left-8 top-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-slate-300 backdrop-blur-md transition hover:border-blue-500/30 hover:bg-white/10 hover:text-white"
      >
        <ArrowLeft size={18} />
        <span className="font-medium">Back</span>
      </button>

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