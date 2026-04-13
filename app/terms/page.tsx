import { SectionCard } from "@/components/ui/section-card";

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">Terms</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">利用規約</h1>
        <div className="mt-6 space-y-4 text-sm leading-8 text-slate-700">
          <p>本診断は簡易的な経営判断支援を目的とした参考情報です。税務・会計・法務上の最終判断は専門家への相談を前提としてください。</p>
          <p>入力いただいた情報は、診断結果の表示、サービス案内、品質改善のために利用します。</p>
          <p>診断結果の無断転載、改変、営利目的での再利用は禁止します。</p>
        </div>
      </SectionCard>
    </main>
  );
}
