import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAffiliateStore } from "../store/affiliateStore";
import { formatPrice } from "../../utils/priceCalculator";
import { ORDER_STATUS_LABELS } from "../../admin/types";

const STATUS_OPTIONS = [
  { value: "all", label: "Все статусы" },
  { value: "searching_performer", label: "Поиск исполнителя" },
  { value: "in_progress", label: "В процессе" },
  { value: "waiting_client_confirmation", label: "Ожидает подтверждения" },
  { value: "completed", label: "Завершён" },
  { value: "dispute_opened", label: "Спор" },
  { value: "cancelled", label: "Отменён" },
];

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  dispute_opened: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  searching_performer: "bg-purple-100 text-purple-700",
  waiting_client_confirmation: "bg-yellow-100 text-yellow-700",
};

export function AffiliateOrdersPage() {
  const { orders, isLoadingOrders, loadOrders } = useAffiliateStore();
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadOrders(statusFilter === "all" ? undefined : statusFilter);
  }, [statusFilter]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Заказы</h1>
        <p className="text-sm text-gray-500 mt-0.5">Заказы ваших исполнителей</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-[#006AFF] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoadingOrders ? (
        <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-[#006AFF]" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 text-sm">Заказов не найдено</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Исполнитель</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Услуга</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Адрес</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Сумма</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Дата</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{o.performerName}</td>
                  <td className="px-4 py-3 text-gray-600">{o.serviceName ?? o.categoryName}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{o.address}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{formatPrice(o.priceTotal)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {o.scheduledDate
                      ? new Date(o.scheduledDate).toLocaleDateString("ru-RU")
                      : new Date(o.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {ORDER_STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
