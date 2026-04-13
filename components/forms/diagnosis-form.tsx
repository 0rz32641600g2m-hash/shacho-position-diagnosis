"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { getQuestionCount } from "@/domain/diagnosis/result";
import { defaultAnswers, questionDefinitions } from "@/domain/diagnosis/questions";
import type { DiagnosisAnswers, LeadFormValues, QuestionKey } from "@/domain/diagnosis/types";
import { QuestionCard } from "./question-card";

type ErrorState = Partial<Record<QuestionKey, string>>;
type LeadField = "companyName" | "contactName" | "email" | "consent";
type LeadFormState = LeadFormValues & { phone: string };
type LeadErrorState = Partial<Record<LeadField, string>>;

const defaultLeadForm: LeadFormState = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  consent: false
};

function countCompleted(answers: DiagnosisAnswers) {
  return questionDefinitions.filter((question) => {
    const value = answers[question.key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;
}

export function DiagnosisForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<DiagnosisAnswers>(defaultAnswers);
  const [errors, setErrors] = useState<ErrorState>({});
  const [leadForm, setLeadForm] = useState<LeadFormState>(defaultLeadForm);
  const [leadErrors, setLeadErrors] = useState<LeadErrorState>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completed = useMemo(() => countCompleted(answers), [answers]);
  const total = getQuestionCount();

  const handleChange = (key: QuestionKey, value: string | string[]) => {
    setAnswers((current) => ({
      ...current,
      [key]: value
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined
    }));
  };

  const handleLeadChange = (key: keyof LeadFormState, value: string | boolean) => {
    setLeadForm((current) => ({
      ...current,
      [key]: value
    }));

    setLeadErrors((current) => ({
      ...current,
      [key]: undefined
    }));
  };

  const handleSubmit = () => {
    setSubmitError(null);
    const nextErrors: ErrorState = {};
    const nextLeadErrors: LeadErrorState = {};

    if (!leadForm.companyName.trim()) {
      nextLeadErrors.companyName = "会社名を入力してください。";
    }

    if (!leadForm.contactName.trim()) {
      nextLeadErrors.contactName = "お名前を入力してください。";
    }

    if (!leadForm.email.trim()) {
      nextLeadErrors.email = "メールアドレスを入力してください。";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadForm.email)) {
      nextLeadErrors.email = "メールアドレスの形式を確認してください。";
    }

    if (!leadForm.consent) {
      nextLeadErrors.consent = "利用規約への同意が必要です。";
    }

    questionDefinitions.forEach((question) => {
      const value = answers[question.key];
      const empty = Array.isArray(value) ? value.length === 0 : !value;

      if (question.required && empty) {
        nextErrors[question.key] = "この項目は入力が必要です。";
      }
    });

    if (Object.keys(nextLeadErrors).length > 0) {
      setLeadErrors(nextLeadErrors);
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
    }

    if (Object.keys(nextErrors).length > 0 || Object.keys(nextLeadErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    fetch("/api/diagnosis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lead: leadForm,
        answers
      })
    })
      .then(async (response) => {
        const payload = (await response.json()) as { id?: string; error?: string };

        if (!response.ok || !payload.id) {
          throw new Error(payload.error ?? "保存に失敗しました。");
        }

        router.push(`/result?id=${payload.id}`);
      })
      .catch((error: Error) => {
        setSubmitError(error.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.35fr]">
      <SectionCard className="h-fit overflow-hidden bg-[linear-gradient(160deg,rgba(8,17,32,0.98),rgba(16,35,63,0.92))] text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">
          Shacho Position Diagnosis
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
          社長の形勢診断
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
          12項目の簡易入力から、今の局面が
          <span className="font-semibold text-white">「攻める」「守る」「盤面を整える」</span>
          のどこに近いかを可視化します。
        </p>

        <div className="mt-8 grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5">
          <div>
            <p className="text-sm font-semibold text-white">3分で終わる経営の現在地チェック</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              将棋中継のように、今の局面、守りと攻めのバランス、次の一手候補が一目で分かります。
            </p>
          </div>
          <ProgressBar current={completed} total={total} />
        </div>

        <div className="mt-8 grid gap-3 text-sm text-slate-200">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            1. 現在の局面を判断
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            2. 守り / 攻めの比重を可視化
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            3. 次の一手候補を提示
          </div>
        </div>
      </SectionCard>

      <SectionCard className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
              簡易診断フォーム
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">現状を選ぶだけで結果が出ます</h2>
          </div>
          <p className="text-sm text-slate-500">
            必須項目のみです。迷う場合は一番近い感覚で大丈夫です。
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-mist-50 p-5">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
                事前情報入力
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink">診断前にご連絡先をご入力ください</h3>
            </div>
            <p className="text-sm text-slate-500">
              トラブル回避とご案内品質向上のため、先に情報をご入力ください。
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">会社名</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-navy-500"
                type="text"
                value={leadForm.companyName}
                onChange={(event) => handleLeadChange("companyName", event.target.value)}
              />
              {leadErrors.companyName ? (
                <span className="mt-2 block text-sm font-medium text-rose-600">
                  {leadErrors.companyName}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">お名前</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-navy-500"
                type="text"
                value={leadForm.contactName}
                onChange={(event) => handleLeadChange("contactName", event.target.value)}
              />
              {leadErrors.contactName ? (
                <span className="mt-2 block text-sm font-medium text-rose-600">
                  {leadErrors.contactName}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">メールアドレス</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-navy-500"
                type="email"
                value={leadForm.email}
                onChange={(event) => handleLeadChange("email", event.target.value)}
              />
              {leadErrors.email ? (
                <span className="mt-2 block text-sm font-medium text-rose-600">
                  {leadErrors.email}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">電話番号 任意</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-navy-500"
                type="tel"
                value={leadForm.phone}
                onChange={(event) => handleLeadChange("phone", event.target.value)}
              />
            </label>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <label className="flex items-start gap-3">
              <input
                checked={leadForm.consent}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-navy-900 focus:ring-navy-700"
                type="checkbox"
                onChange={(event) => handleLeadChange("consent", event.target.checked)}
              />
              <span className="text-sm leading-7 text-slate-600">
                <Link className="font-semibold text-navy-800 underline underline-offset-4" href="/terms">
                  利用規約
                </Link>
                と
                <Link
                  className="font-semibold text-navy-800 underline underline-offset-4"
                  href="/privacy"
                >
                  プライバシーポリシー
                </Link>
                に同意して診断を開始します。
              </span>
            </label>
            {leadErrors.consent ? (
              <span className="mt-2 block text-sm font-medium text-rose-600">
                {leadErrors.consent}
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          {questionDefinitions.map((question) => (
            <QuestionCard
              key={question.key}
              error={errors[question.key]}
              question={question}
              value={answers[question.key]}
              onChange={(value) => handleChange(question.key, value)}
            />
          ))}
        </div>

        <div className="sticky bottom-4 rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">入力完了で診断結果へ進みます</p>
              <p className="text-sm text-slate-500">未入力がある場合はその場で分かりやすく案内します。</p>
              {submitError ? (
                <p className="mt-2 text-sm font-medium text-rose-600">{submitError}</p>
              ) : null}
            </div>
            <button
              className="inline-flex items-center justify-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "保存中..." : "診断結果を見る"}
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
