import { useAnalyticsStore } from "../store/analyticsStore";

export function FunnelSection() {
  const { funnel } = useAnalyticsStore();

  if (funnel.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
        Данных воронки нет — начните использовать калькулятор для накопления событий
      </div>
    );
  }

  const maxCount = funnel[0]?.count ?? 1;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900 mb-1">Воронка конверсии</p>
        <p className="text-xs text-gray-400 mb-6">Как пользователи проходят путь от калькулятора до завершения заказа</p>

        <div className="space-y-4">
          {funnel.map((step, i) => (
            <div key={step.event}>
              {/* Step bar */}
              <div className="flex items-center gap-4 mb-1">
                <div className="w-6 text-center">
                  <span className="text-xs font-bold text-gray-400">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{step.label}</span>
                      <span className="ml-2 text-xs font-mono text-gray-400">{step.event}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {i > 0 && step.dropPct > 0 && (
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          −{step.dropPct}%
                        </span>
                      )}
                      <span className="text-xs text-gray-500 w-16 text-right">{step.convPct}% от топа</span>
                      <span className="text-base font-bold text-gray-900 w-16 text-right tabular-nums">{step.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${maxCount > 0 ? (step.count / maxCount) * 100 : 0}%`,
                        background: `linear-gradient(90deg, #3b82f6, #6366f1)`,
                        opacity: 1 - (i * 0.08),
                      }}
                    />
                    {step.count > 0 && (
                      <span className="absolute inset-0 flex items-center px-2 text-xs font-semibold text-white">
                        {step.count.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Drop-off arrow */}
              {i < funnel.length - 1 && step.count > 0 && funnel[i + 1].count < step.count && (
                <div className="flex items-center gap-4 py-1">
                  <div className="w-6" />
                  <div className="flex items-center gap-2 text-xs text-gray-400 pl-0.5">
                    <span className="text-red-400">↓</span>
                    <span>{(step.count - funnel[i + 1].count).toLocaleString()} ушли</span>
                    <span className="text-red-400 font-semibold">
                      ({Math.round(((step.count - funnel[i + 1].count) / step.count) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          label="Конверсия в заказ"
          value={`${funnel.find(s => s.event === "order_created")?.convPct ?? 0}%`}
          sub="от открытия калькулятора"
          color="text-blue-600"
        />
        <SummaryCard
          label="Самый большой отток"
          value={(() => {
            const maxDrop = funnel.reduce((max, s) => s.dropPct > max.dropPct ? s : max, funnel[0]);
            return maxDrop?.dropPct > 0 ? `${maxDrop.dropPct}%` : "—";
          })()}
          sub={(() => {
            const maxDrop = funnel.reduce((max, s) => s.dropPct > max.dropPct ? s : max, funnel[0]);
            return maxDrop?.dropPct > 0 ? `на шаге: ${maxDrop.label}` : "нет данных";
          })()}
          color="text-red-500"
        />
        <SummaryCard
          label="Завершили заказ"
          value={`${funnel.find(s => s.event === "client_confirmed_completion")?.convPct ?? 0}%`}
          sub="подтвердили выполнение"
          color="text-emerald-600"
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
