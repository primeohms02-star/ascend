"use client";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div>

      <div className="mb-4 flex items-center justify-between">

        <p className="text-sm font-medium text-slate-400">
          Step {currentStep} of {totalSteps}
        </p>

        <p className="text-sm font-medium text-blue-400">
          {Math.round(progress)}%
        </p>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">

        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  );
}