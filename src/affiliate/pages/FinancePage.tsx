import { useEffect, useState } from "react";
import { Loader2, DollarSign, TrendingUp, Clock } from "lucide-react";
import { useAffiliateStore } from "../store/affiliateStore";
import { formatPrice } from "../../utils/priceCalculator";

type Period = "all" | "month" | "week";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "all",   label: "Всё время" },
  { value: "month", label: "Месяц" },
  { value: "week",  label: "Неделя" },
];

function periodStart(period: Period): Date | null {
  const now = new Date();
  if (period === "week") return new Date(now.getTime() - 7 * 86400000);
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

export function AffiliateFinancePage() {
  const { earnings, isLoadingEarnings, loadEarnings } = useAffiliateStore();
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => { loadEarnings(); }, []);

  const cutoff = periodStart(period);
  const filtered = earnings.filter((e) =>
    cutoff ? new Date(e.createdAt) >= cutoff : true
  );

  const total = filtered.reduce((s, e) => s + e.affiliateFee, 0);
  const monthTotal = earnings
    .filter((e) => new Date(e.createdAt) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((s, e) => s + e.affiliateFee, 0);

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Финансы</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ваш заработок с исполнителей</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Итого заработано</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{formatPrice(earnings.reduce((s, e) => s + e.affiliateFee, 0))}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-50 text-[#006AFF]">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">За текущий месяц</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{formatPrice(monthTotal)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-orange-50 text-orange-500">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Ожидает выплаты</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">—</p>
          </div>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex gap-2 mb-4">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              period === opt.value
                ? "bg-[#006AFF] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoadingEarnings ? (
        <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-[#006AFF]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm">Начислений за выбранный период нет</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Дата</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Исполнитель</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Сумма заказа</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Комиссия площадки (10%)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Мой заработок (15%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{new Date(e.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.performerName ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatPrice(e.orderAmount)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatPrice(e.platformFee)}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{formatPrice(e.affiliateFee)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-100">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Итого за период:</td>
                <td className="px-4 py-3 text-emerald-600 font-bold">{formatPrice(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
