import type { DiagnosisResult } from "@/domain/diagnosis/types";
import { SectionCard } from "@/components/ui/section-card";

const momentumPosition = {
  "優勢": 92,
  "やや優勢": 72,
  "互角": 50,
  "やや苦戦": 28,
  "苦戦": 10
} as const;

export function SummaryBand({ result }: { result: DiagnosisResult }) {
  const evaluationSign = result.evaluationValue >= 0 ? "+" : "";

  return (
    <SectionCard className="overflow-hidden border-navy-900/20 bg-[linear-gradient(160deg,rgba(248,250,252,0.98),rgba(232,238,247,0.98))] p-0 text-ink">
      <div className="grid gap-px bg-slate-200 xl:grid-cols-[0.9fr_1.25fr]">
        <div className="bg-[linear-gradient(140deg,rgba(8,17,32,0.98),rgba(19,52,92,0.98))] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">総合判定</p>
          <div className="mt-5 grid grid-cols-[auto_1fr] gap-4">
            <div className="flex min-h-28 min-w-28 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 px-6 py-5">
              <p className="font-serif text-7xl leading-none text-white">{result.grade}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-slate-200">現在の形勢</p>
              <p className="mt-2 text-3xl font-semibold text-white">{result.evaluationLabel}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {result.overallPhase} / {result.momentum}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  評価値
                </p>
                <p className="mt-2 font-serif text-5xl leading-none text-white">
                  {evaluationSign}
                  {result.evaluationValue}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  総合スコア
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">{result.totalScore}</p>
              </div>
            </div>

            <div className="mt-5 mb-2 flex items-center justify-between text-xs font-medium text-slate-300">
              <span>苦戦</span>
              <span>互角</span>
              <span>優勢</span>
            </div>
            <div className="relative h-3 rounded-full bg-[linear-gradient(90deg,#7f1d1d_0%,#c2410c_24%,#c4a966_50%,#2563eb_76%,#0f766e_100%)]">
              <div
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-navy-900 shadow-lg"
                style={{ left: `${momentumPosition[result.momentum]}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy-700">
              社長の形勢診断
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">今の自社の状況</h1>
            <p className="mt-4 text-sm leading-8 text-slate-700 sm:text-base">{result.summaryComment}</p>
            <div className="mt-5 grid gap-3 rounded-[20px] border border-slate-200 bg-mist-50 px-4 py-4 sm:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-700">
                  局面名
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">{result.overallPhase}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-700">
                  寸評
                </p>
                <p className="mt-2 text-sm font-medium leading-7 text-slate-700">{result.shortMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
