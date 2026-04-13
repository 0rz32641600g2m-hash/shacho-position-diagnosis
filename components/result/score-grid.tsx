import { SectionCard } from "@/components/ui/section-card";
import type { DiagnosisResult } from "@/domain/diagnosis/types";

const accents: Record<string, string> = {
  defense: "from-gold-300 to-gold-500",
  offense: "from-sky-300 to-sky-500",
  boardAwareness: "from-indigo-300 to-indigo-500",
  decisionMaking: "from-emerald-300 to-emerald-500"
};

const descriptions: Record<string, string> = {
  defense: "手元資金、利益状況、資金繰り不安、資金繰り表の有無から見た守りの強さです。",
  offense: "新規顧客の安定性、売上見通し、粗利把握から見た攻めの強さです。",
  boardAwareness: "月次数字の速さ、資金繰り表、利益や粗利の把握状況から見た現状把握の力です。",
  decisionMaking: "採用・広告・投資判断を数字で支えられているかを見る項目です。"
};

export function ScoreGrid({ scores }: { scores: DiagnosisResult["scores"] }) {
  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
            成績表
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ink">局面を支える4項目</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Object.values(scores).map((score) => (
          <div key={score.key} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-mist-50 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-500">{score.label}</p>
                    <div className="group relative">
                      <button
                        aria-label={`${score.label}の説明`}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-slate-500 transition hover:border-navy-500 hover:text-navy-700"
                        type="button"
                      >
                        ?
                      </button>
                      <div className="pointer-events-none absolute left-1/2 top-7 z-10 w-56 -translate-x-1/2 rounded-2xl bg-ink px-3 py-2 text-xs leading-6 text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                        {descriptions[score.key]}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-medium text-navy-700">{score.tone}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-5xl leading-none text-ink">{score.level}</p>
                  <p className="mt-1 text-xs tracking-[0.18em] text-slate-400">5段階</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${accents[score.key]}`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">{score.levelLabel}</p>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={`${score.key}-${index}`}
                      className={`h-2.5 w-7 rounded-full ${
                        index < score.level ? "bg-navy-800" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{score.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
