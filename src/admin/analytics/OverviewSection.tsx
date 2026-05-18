import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Users, ShoppingBag, TrendingUp, Star, UserCheck, Wifi, CheckCircle, AlertTriangle } from "lucide-react";
import { useAnalyticsStore } from "../store/analyticsStore";
import { formatPrice } from "../../utils/priceCalculator";

function KpiCard({ label, value, sub, icon, color }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <p className="text-sm font-semibold text-gray-900 mb-4">{title}</p>;
}

export function OverviewSection() {
  const { activeUsers, registrations, quality, marketplace, supplyDemand } = useAnalyticsStore();

  return (
    <div className="space-y-6">
      {/* Product Health KPIs */}
      <div>
        <SectionHeader title="Здоровье продукта" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="DAU"
            value={activeUsers?.dau ?? "—"}
            sub="уникальных за 24ч"
            icon={<Users size={15} className="text-blue-600" />}
            color="bg-blue-50"
          />
          <KpiCard
            label="WAU"
            value={activeUsers?.wau ?? "—"}
            sub="уникальных за 7 дней"
            icon={<Users size={15} className="text-indigo-600" />}
            color="bg-indigo-50"
          />
          <KpiCard
            label="MAU"
            value={activeUsers?.mau ?? "—"}
            sub="уникальных за 30 дней"
            icon={<Users size={15} className="text-violet-600" />}
            color="bg-violet-50"
          />
          <KpiCard
            label="Новых клиентов"
            value={registrations?.clients ?? "—"}
            sub={`+ ${registrations?.performers ?? 0} исполнителей`}
            icon={<UserCheck size={15} className="text-emerald-600" />}
            color="bg-emerald-50"
          />
        </div>
      </div>

      {/* Active users chart */}
      {(activeUsers?.byDay?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader title="Активные пользователи (DAU)" />
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={activeUsers!.byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={28} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="users" name="Пользователи" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Marketplace + Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Marketplace Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader title="Marketplace" />
          <div className="space-y-3">
            <MetricRow label="Принятых заказов" value={`${marketplace?.acceptanceRate ?? 0}%`} bar={marketplace?.acceptanceRate} barColor="bg-blue-500" />
            <MetricRow label="Заказов в поиске" value={marketplace?.searchingOrders ?? 0} />
            <MetricRow label="Активных исполнителей" value={marketplace?.activePerformers ?? 0} />
            <MetricRow label="Онлайн сейчас" value={marketplace?.onlinePerformers ?? 0} bar={(marketplace && marketplace.activePerformers > 0) ? Math.round(((marketplace.onlinePerformers) / marketplace.activePerformers) * 100) : 0} barColor="bg-green-500" />
            <MetricRow label="Заказов на исполнителя" value={marketplace?.ordersPerPerformer ?? 0} />
          </div>
        </div>

        {/* Quality */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader title="Качество" />
          <div className="space-y-3">
            <MetricRow label="Выполнение" value={`${quality?.completionRate ?? 0}%`} bar={quality?.completionRate} barColor="bg-emerald-500" />
            <MetricRow label="Отмены" value={`${quality?.cancellationRate ?? 0}%`} bar={quality?.cancellationRate} barColor="bg-red-400" />
            <MetricRow label="Споры" value={`${quality?.disputeRate ?? 0}%`} bar={quality?.disputeRate} barColor="bg-orange-400" />
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-sm text-gray-600">Средний рейтинг</span>
              <span className="text-sm font-bold text-amber-600">★ {quality?.avgRating?.toFixed(1) ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Оценок</span>
              <span className="text-sm font-semibold text-gray-900">{quality?.ratedOrders ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supply / Demand balance */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <SectionHeader title="Баланс спроса и предложения" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <BalanceCard label="Активных заказов" value={supplyDemand?.activeOrders ?? 0} icon={<ShoppingBag size={14} className="text-blue-600" />} />
          <BalanceCard label="Ищут исполнителя" value={supplyDemand?.searchingOrders ?? 0} icon={<TrendingUp size={14} className="text-orange-500" />} />
          <BalanceCard label="Исполнителей онлайн" value={supplyDemand?.onlinePerformers ?? 0} icon={<Wifi size={14} className="text-green-600" />} />
          <BalanceCard label="Свободных исполнителей" value={supplyDemand?.idlePerformers ?? 0} icon={<CheckCircle size={14} className="text-emerald-600" />} />
          <BalanceCard
            label="Неудовлетворённый спрос"
            value={supplyDemand?.unfulfilledDemand ?? 0}
            icon={<AlertTriangle size={14} className={(supplyDemand?.unfulfilledDemand ?? 0) > 0 ? "text-red-500" : "text-gray-400"} />}
            highlight={(supplyDemand?.unfulfilledDemand ?? 0) > 0}
          />
        </div>
        {/* Balance score */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Баланс платформы</span>
            <span className="font-semibold text-gray-800">{supplyDemand?.balanceScore ?? 0}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${(supplyDemand?.balanceScore ?? 0) >= 80 ? "bg-green-500" : (supplyDemand?.balanceScore ?? 0) >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${supplyDemand?.balanceScore ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Registrations chart */}
      {(registrations?.byDay?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader title="Регистрации" />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={registrations!.byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="clients"    name="Клиенты"     fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="performers" name="Исполнители" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />Клиенты</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />Исполнители</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value, bar, barColor }: { label: string; value: string | number; bar?: number; barColor?: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      {bar !== undefined && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor ?? "bg-blue-500"}`} style={{ width: `${Math.min(100, bar)}%` }} />
        </div>
      )}
    </div>
  );
}

function BalanceCard({ label, value, icon, highlight }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-red-50 border border-red-100" : "bg-gray-50"}`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<p className="text-xs text-gray-500">{label}</p></div>
      <p className={`text-xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

// Suppress unused import warnings
void formatPrice;
void Star;
