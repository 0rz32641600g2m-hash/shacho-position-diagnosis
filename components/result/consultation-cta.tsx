import { SectionCard } from "@/components/ui/section-card";
import type { DiagnosisResult } from "@/domain/diagnosis/types";

export function ConsultationCta({ result }: { result: DiagnosisResult }) {
  return (
    <SectionCard className="border-navy-900/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,243,249,0.96))]">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
            個別診断のご案内
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">
            局面が見えた今こそ、御社の本筋の一手を整理しませんか
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            この診断で分かるのは局面までです。将棋でいえば、形勢判断の次に必要なのは具体的な読みです。
            実際にどこまで攻めてよいかは、粗利構造・固定費・回収サイトまで見て初めて明確になります。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            className="inline-flex items-center justify-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
            href="#"
          >
            無料で個別診断を相談する
          </a>
        </div>
      </div>
    </SectionCard>
  );
}
