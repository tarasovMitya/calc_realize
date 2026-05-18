import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useAnalyticsStore } from "../store/analyticsStore";
import { formatPrice } from "../../utils/priceCalculator";

function fmt(v: number) { return v >= 1000 ? `${(v / 1000).toFixed(1)}к` : String(v); }

export function RevenueSection() {
  const { revenue, ordersOverTime } = useAnalyticsStore();

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="GMV" value={formatPrice(revenue?.gmv ?? 0)} sub="все оплаченные заказы" />
        <KpiCard label="Платформа (10%)" value={formatPrice(Math.round((revenue?.gmv ?? 0) * 0.1))} sub="комиссия платформы" accent />
        <KpiCard label="Средний чек" value={formatPrice(revenue?.avgOrderValue ?? 0)} sub="оплаченные заказы" />
        <KpiCard label="Завершённых заказов" value={revenue?.completedOrders ?? 0} sub={`всего ${revenue?.totalOrders ?? 0} за период`} />
      </div>

      {/* Revenue over time */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">Выручка по дням</p>
        {(revenue?.byDay?.length ?? 0) > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenue!.byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={45} tickFormatter={fmt} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v: unknown) => [formatPrice(Number(v)), "Выручка"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400">Нет данных за период</div>
        )}
      </div>

      {/* Orders over time */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">Заказы по дням</p>
        {ordersOverTime.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total"     name="Всего"      fill="#93c5fd" radius={[2, 2, 0, 0]} />
                <Bar dataKey="completed" name="Завершено"  fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cancelled" name="Отменено"   fill="#f87171" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400">Нет данных за период</div>
        )}
      </div>

      {/* By category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Выручка по категориям</p>
          {(revenue?.byCategory?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue!.byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={fmt} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: unknown) => [formatPrice(Number(v)), "Выручка"]} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">Нет данных</div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Топ категорий</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Категория</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Заказы</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Выручка</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ср. чек</th>
              </tr>
            </thead>
            <tbody>
              {(revenue?.byCategory ?? []).map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800 text-xs">{row.name}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">{row.orders}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-900">{formatPrice(row.revenue)}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-500">{formatPrice(row.avgPrice)}</td>
                </tr>
              ))}
              {(revenue?.byCategory?.length ?? 0) === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">Нет данных</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "bg-emerald-50 border-emerald-100" : "bg-white border-gray-200"}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-emerald-700" : "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
