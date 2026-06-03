import { useEffect } from "react";
import { Users, CheckCircle, DollarSign, AlertTriangle } from "lucide-react";
import { useAffiliateStore } from "../store/affiliateStore";
import { formatPrice } from "../../utils/priceCalculator";

function KpiCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function AffiliateOverviewPage() {
  const { stats, isLoadingStats, loadStats } = useAffiliateStore();

  useEffect(() => { loadStats(); }, []);

  if (isLoadingStats) {
    return (
      <div className="p-6 flex justify-center pt-20">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#006AFF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Обзор</h1>
        <p className="text-sm text-gray-500 mt-0.5">Статистика по вашим исполнителям</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KpiCard
          icon={Users}
          label="Привлечено исполнителей"
          value={String(stats?.performersCount ?? 0)}
          color="bg-blue-50 text-[#006AFF]"
        />
        <KpiCard
          icon={CheckCircle}
          label="Выполнено заказов"
          value={String(stats?.completedOrders ?? 0)}
          color="bg-green-50 text-green-600"
        />
        <KpiCard
          icon={DollarSign}
          label="Мой заработок"
          value={formatPrice(stats?.totalEarned ?? 0)}
          color="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Открытых споров"
          value={String(stats?.openDisputes ?? 0)}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
        <strong>Как считается заработок:</strong> 15% от комиссии платформы (10% от суммы заказа) за каждый выполненный заказ ваших исполнителей.
      </div>
    </div>
  );
}
