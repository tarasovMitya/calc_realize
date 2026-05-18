import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useAnalyticsStore } from "../store/analyticsStore";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high:     "bg-orange-100 text-orange-700",
  medium:   "bg-yellow-100 text-yellow-700",
  low:      "bg-gray-100 text-gray-500",
};

const ERROR_LABELS: Record<string, string> = {
  react_error:   "React краш",
  api_error:     "API ошибка",
  auth_error:    "Auth ошибка",
  db_error:      "DB ошибка",
  network_error: "Network",
  realtime_error:"Realtime",
};

export function ErrorsSection() {
  const { errors } = useAnalyticsStore();

  const sev = errors?.bySeverity ?? { critical: 0, high: 0, medium: 0, low: 0 };
  const totalSev = Object.values(sev).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SevCard label="Критических" value={sev.critical} color="bg-red-50 border-red-100 text-red-700" />
        <SevCard label="Высоких"     value={sev.high}     color="bg-orange-50 border-orange-100 text-orange-700" />
        <SevCard label="Средних"     value={sev.medium}   color="bg-yellow-50 border-yellow-100 text-yellow-700" />
        <SevCard label="Низких"      value={sev.low}      color="bg-gray-50 border-gray-100 text-gray-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Error type chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Ошибки по типу</p>
          {(errors?.byType?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={errors!.byType.map(r => ({ ...r, name: ERROR_LABELS[r.name] ?? r.name }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="Ошибки" fill="#f87171" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">Ошибок не зафиксировано</div>
          )}
        </div>

        {/* Severity distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Распределение по severity</p>
          <div className="space-y-3">
            {(["critical", "high", "medium", "low"] as const).map((sev_key) => (
              <div key={sev_key}>
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[sev_key]}`}>{sev_key}</span>
                  <span className="text-sm font-bold text-gray-900">{sev[sev_key]}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${sev_key === "critical" ? "bg-red-500" : sev_key === "high" ? "bg-orange-500" : sev_key === "medium" ? "bg-yellow-500" : "bg-gray-400"}`}
                    style={{ width: `${totalSev > 0 ? Math.round((sev[sev_key] / totalSev) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {totalSev === 0 && (
              <div className="py-6 text-center text-sm text-gray-400">Нет ошибок за период</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent errors table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Последние ошибки</p>
          <span className="text-xs text-gray-400">{errors?.total ?? 0} записей за период</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ошибка</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Компонент</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Страница</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Время</th>
              </tr>
            </thead>
            <tbody>
              {(errors?.recent ?? []).map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-red-50/20">
                  <td className="px-4 py-2.5 max-w-xs">
                    <p className="text-xs font-medium text-red-700 truncate">{e.error_message}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{e.component ?? "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 truncate max-w-[120px]">{e.page ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_COLORS[e.severity] ?? "bg-gray-100 text-gray-600"}`}>
                      {e.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString("ru-RU")}
                  </td>
                </tr>
              ))}
              {(errors?.recent?.length ?? 0) === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Ошибок нет — всё чисто</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SevCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
