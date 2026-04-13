import { SectionCard } from "@/components/ui/section-card";
import type { InsightSummary } from "@/domain/diagnosis/types";

const sections: Array<{ key: keyof InsightSummary; label: string }> = [
  { key: "goodPoint", label: "良い点" },
  { key: "cautionPoint", label: "注意点" },
  { key: "firstAction", label: "まずやること" }
];

export function ReasonsPanel({ insights }: { insights: InsightSummary }) {
  return (
    <SectionCard>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
        読み筋
      </p>
      <h2 className="mt-2 text-xl font-semibold text-ink">今の局面の見立て</h2>

      <div className="mt-6 space-y-3">
        {sections.map((section) => (
          <div
            key={section.key}
            className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy-700">
              {section.label}
            </p>
            {insights[section.key]}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
