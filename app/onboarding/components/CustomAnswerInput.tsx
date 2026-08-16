"use client";

import {
  Check,
  MessageSquareText,
} from "lucide-react";

type Props = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
};

export default function CustomAnswerInput({
  id,
  label,
  placeholder,
  value,
  maxLength,
  onChange,
}: Props) {
  const hasAnswer =
    value.trim().length >= 2;

  return (
    <div className="mt-5">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-200"
      >
        {label}
      </label>

      <div
        className={`flex min-h-14 items-center gap-3 rounded-2xl border bg-[#080B12] px-4 transition focus-within:border-blue-500/70 focus-within:ring-2 focus-within:ring-blue-500/10 ${
          hasAnswer
            ? "border-blue-500/50"
            : "border-white/10"
        }`}
      >
        <MessageSquareText
          size={19}
          className="shrink-0 text-slate-500"
          aria-hidden="true"
        />

        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          maxLength={maxLength}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-600"
        />

        {hasAnswer && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white"
          >
            <Check
              size={14}
              strokeWidth={2.4}
              aria-hidden="true"
            />

            <span className="sr-only">
              Custom answer selected
            </span>
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-4 text-xs text-slate-500">
        <p>
          Atlas will use your answer in your own words.
        </p>

        <p className="shrink-0">
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
