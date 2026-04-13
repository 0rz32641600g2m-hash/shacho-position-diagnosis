import { SectionCard } from "@/components/ui/section-card";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">Privacy</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">プライバシーポリシー</h1>
        <div className="mt-6 space-y-4 text-sm leading-8 text-slate-700">
          <p>取得した会社名、お名前、メールアドレス、電話番号、診断回答は、診断提供、問い合わせ対応、関連サービス案内のために利用します。</p>
          <p>法令に基づく場合を除き、ご本人の同意なく第三者へ提供しません。</p>
          <p>保存された情報の開示・訂正・削除をご希望の場合は、株式会社ユアブレーンまでご連絡ください。</p>
        </div>
      </SectionCard>
    </main>
  );
}
