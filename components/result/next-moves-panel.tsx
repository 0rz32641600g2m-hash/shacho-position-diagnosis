import { SectionCard } from "@/components/ui/section-card";
import type { NextMove } from "@/domain/diagnosis/types";

export function NextMovesPanel({ moves, badMoves }: { moves: NextMove[]; badMoves: NextMove[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
              検討手
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">次の一手 候補</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {moves.map((move, index) => (
            <article
              key={move.title}
              className={`rounded-[24px] border p-4 ${
                move.best
                  ? "border-gold-300 bg-[linear-gradient(180deg,rgba(196,169,102,0.10),rgba(255,255,255,0.96))]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mist-100 text-sm font-semibold text-navy-800">
                    {index + 1}
                  </span>
                  {move.best ? (
                    <span className="rounded-full bg-gold-400 px-2.5 py-1 text-xs font-semibold text-ink">
                      Best
                    </span>
                  ) : null}
                </div>
              </div>
              <h3 className="mt-4 text-sm font-semibold leading-6 text-ink">{move.title}</h3>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    想定改善幅
                  </p>
                  <p className="mt-1 font-serif text-3xl leading-none text-navy-900">
                    +{move.evaluationDelta}
                  </p>
                </div>
                <p className="max-w-[15rem] text-right text-xs leading-6 text-slate-500">
                  {move.deltaLabel}
                </p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            注意手
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ink">悪手になる候補手</h2>
        </div>

        <div className="mt-6 space-y-4">
          {badMoves.map((move, index) => (
            <article key={move.title} className="rounded-[24px] border border-rose-100 bg-rose-50/70 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-rose-700">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold leading-6 text-ink">{move.title}</h3>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    想定悪化幅
                  </p>
                  <p className="mt-1 font-serif text-3xl leading-none text-rose-700">
                    {move.evaluationDelta}
                  </p>
                </div>
                <p className="max-w-[15rem] text-right text-xs leading-6 text-slate-500">
                  {move.deltaLabel}
                </p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
