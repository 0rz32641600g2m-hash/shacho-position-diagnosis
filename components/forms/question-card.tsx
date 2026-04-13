"use client";

import { cn } from "@/lib/utils";
import type { QuestionDefinition } from "@/domain/diagnosis/types";

type QuestionCardProps = {
  question: QuestionDefinition;
  value: string | string[];
  error?: string;
  onChange: (next: string | string[]) => void;
};

export function QuestionCard({ question, value, error, onChange }: QuestionCardProps) {
  const isMultiple = Boolean(question.multiple);
  const selectedValues = Array.isArray(value) ? value : [];

  const handleClick = (optionValue: string) => {
    if (!isMultiple) {
      onChange(optionValue);
      return;
    }

    const next = selectedValues.includes(optionValue)
      ? selectedValues.filter((item) => item !== optionValue)
      : [...selectedValues, optionValue];

    onChange(next);
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {question.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{question.title}</h3>
          {question.description ? (
            <p className="mt-1 text-sm text-slate-500">{question.description}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-mist-100 px-3 py-1 text-xs font-semibold text-navy-800">
          {isMultiple ? "複数選択" : "1つ選択"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const selected = isMultiple
            ? selectedValues.includes(option.value)
            : value === option.value;

          return (
            <button
              key={option.value}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm transition",
                selected
                  ? "border-navy-800 bg-navy-900 text-white shadow-lg shadow-navy-900/10"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-navy-300 hover:bg-white"
              )}
              type="button"
              onClick={() => handleClick(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
