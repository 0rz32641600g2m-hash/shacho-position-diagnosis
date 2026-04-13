import Link from "next/link";

import { ConsultationCta } from "@/components/result/consultation-cta";
import { NextMovesPanel } from "@/components/result/next-moves-panel";
import { ReasonsPanel } from "@/components/result/reasons-panel";
import { ScoreGrid } from "@/components/result/score-grid";
import { SummaryBand } from "@/components/result/summary-band";
import { SectionCard } from "@/components/ui/section-card";
import { generateDiagnosisResult } from "@/domain/diagnosis/result";
import { findSubmissionById } from "@/lib/submission-repository";
import { deserializeAnswers } from "@/lib/query-state";

type ResultPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const submissionId = typeof resolvedParams.id === "string" ? resolvedParams.id : undefined;
  const serialized = typeof resolvedParams.data === "string" ? resolvedParams.data : undefined;
  const savedSubmission = submissionId ? await findSubmissionById(submissionId) : null;
  const answers = savedSubmission?.answers ?? deserializeAnswers(serialized);

  if (!answers) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6">
        <SectionCard className="max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-navy-700">
            社長の形勢診断
          </p>
          <h1 className="mt-4 font-serif text-3xl text-ink">診断データが見つかりませんでした</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            入力内容が未送信か、URLの情報が不足しています。最初の画面から改めて診断をお試しください。
          </p>
          <Link
            className="mt-8 inline-flex rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
            href="/"
          >
            診断入力に戻る
          </Link>
        </SectionCard>
      </main>
    );
  }

  const result = savedSubmission?.result ?? generateDiagnosisResult(answers);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <SummaryBand result={result} />

      <section className="grid gap-6">
        <ReasonsPanel insights={result.insights} />
        <NextMovesPanel badMoves={result.badMoves} moves={result.nextMoves} />
      </section>

      <section className="grid gap-6">
        <ScoreGrid scores={result.scores} />
      </section>

      <ConsultationCta result={result} />
    </main>
  );
}
