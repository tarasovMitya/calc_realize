import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { useDashboardStore } from "../store/dashboardStore";
import { PaymentCard } from "../components/cards/PaymentCard";
import { EmptyState } from "../components/ui/EmptyState";

export function PaymentMethodsPage() {
  const { payments, setDefaultPayment, deletePayment } = useDashboardStore();
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Способы оплаты</h1>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={28} />}
          title="Нет способов оплаты"
          description="Добавьте карту для быстрой оплаты"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <PaymentCard
              key={p.id}
              payment={p}
              onSetDefault={() => setDefaultPayment(p.id)}
              onDelete={() => deletePayment(p.id)}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setShowComingSoon(true)}
        className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
      >
        <Plus size={16} />
        Добавить карту
      </button>

      {showComingSoon && (
        <div className="mt-3 flex items-center justify-between gap-3 bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-600">
          <span>Добавление карт будет доступно в ближайшем обновлении</span>
          <button onClick={() => setShowComingSoon(false)} className="text-gray-400 hover:text-gray-600 shrink-0 text-lg leading-none">×</button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        Данные карты хранятся в зашифрованном виде и не передаются третьим лицам
      </p>
    </div>
  );
}
