import { SectionCard } from "@/components/ui/section-card";

type PositionMapProps = {
  defense: number;
  offense: number;
};

export function PositionMap({ defense, offense }: PositionMapProps) {
  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
            現在地マップ
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ink">守備力 × 攻撃力</h2>
        </div>
        <div className="rounded-full bg-mist-100 px-3 py-1 text-xs font-semibold text-navy-700">
          現在地
        </div>
      </div>

      <div className="relative mt-6 aspect-square rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff,#eef3f9)] p-4">
        <div className="absolute inset-4 rounded-[20px] border border-dashed border-slate-300" />
        <div className="absolute inset-x-4 top-1/2 h-px bg-slate-300" />
        <div className="absolute inset-y-4 left-1/2 w-px bg-slate-300" />

        <div className="absolute left-6 top-6 text-xs font-medium text-slate-500">
          盤面整理後に伸びる
        </div>
        <div className="absolute right-6 top-6 text-xs font-medium text-slate-500">攻勢局面</div>
        <div className="absolute bottom-6 left-6 text-xs font-medium text-slate-500">守勢局面</div>
        <div className="absolute bottom-6 right-6 text-xs font-medium text-slate-500">
          攻めたいが危うい
        </div>

        <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold tracking-[0.12em] text-slate-400">
          守備力
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-[0.12em] text-slate-400">
          攻撃力
        </div>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${offense}%`, top: `${100 - defense}%` }}
        >
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-800/15 blur-sm" />
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-navy-900 shadow-lg">
            <div className="h-2 w-2 rounded-full bg-gold-300" />
          </div>
          <div className="mt-3 rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white">
            現在地
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
