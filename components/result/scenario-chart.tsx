import { SectionCard } from "@/components/ui/section-card";
import type { Scenario } from "@/domain/diagnosis/types";

type ScenarioChartProps = {
  scenarios: Scenario[];
};

const WIDTH = 560;
const HEIGHT = 260;
const PADDING = 30;

function buildPath(values: { x: number; y: number }[]) {
  return values
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
}

export function ScenarioChart({ scenarios }: ScenarioChartProps) {
  const months = scenarios[0]?.points.map((point) => point.month) ?? [];

  return (
    <SectionCard>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
        局面シミュレーション
      </p>
      <h2 className="mt-2 text-xl font-semibold text-ink">打ち手で形勢がどう変わるか</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        厳密な予測ではなく、今の局面でどの方向に手を打つと形勢が動きやすいかを直感的に示しています。
      </p>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[560px] rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#f9fbfe,#eef3f9)] p-4">
          <svg className="h-auto w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img">
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = PADDING + ((100 - tick) / 100) * (HEIGHT - PADDING * 2);
              return (
                <g key={tick}>
                  <line x1={PADDING} x2={WIDTH - PADDING} y1={y} y2={y} stroke="#d8e0ea" strokeWidth="1" />
                  <text x={8} y={y + 4} fill="#64748b" fontSize="11">
                    {tick}
                  </text>
                </g>
              );
            })}

            {months.map((month, index) => {
              const x = PADDING + (index / Math.max(months.length - 1, 1)) * (WIDTH - PADDING * 2);
              return (
                <text key={month} x={x} y={HEIGHT - 6} fill="#64748b" fontSize="11" textAnchor="middle">
                  {month}
                </text>
              );
            })}

            {scenarios.map((scenario) => {
              const points = scenario.points.map((point, index) => ({
                x: PADDING + (index / Math.max(scenario.points.length - 1, 1)) * (WIDTH - PADDING * 2),
                y: PADDING + ((100 - point.value) / 100) * (HEIGHT - PADDING * 2)
              }));

              return (
                <g key={scenario.label}>
                  <path
                    d={buildPath(points)}
                    fill="none"
                    stroke={scenario.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {points.map((point, index) => (
                    <circle
                      key={`${scenario.label}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      fill={scenario.color}
                      r="4.5"
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.label}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: scenario.color }}
            />
            {scenario.label}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
