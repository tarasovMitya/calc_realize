import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { usePerformerStore } from "../store/performerStore";
import { AvailableOrderCard } from "../components/cards/AvailableOrderCard";

export function AvailableOrdersPage() {
  const { availableOrders, acceptOrder, rejectOrder, isOnline } = usePerformerStore();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Новые заказы</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isOnline
            ? availableOrders.length > 0
              ? `${availableOrders.length} заказа ждут вас`
              : "Новых заказов пока нет"
            : "Вы офлайн — заказы не поступают"}
        </p>
      </motion.div>

      {availableOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 flex flex-col items-center gap-3 text-center"
        >
          <ClipboardList size={36} className="text-gray-200" />
          <p className="text-base font-medium text-gray-400">
            {isOnline ? "Новых заказов пока нет" : "Включите онлайн, чтобы получать заказы"}
          </p>
          <p className="text-sm text-gray-300">Мы уведомим вас, когда появится заказ рядом</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-4">
            {availableOrders.map((order) => (
              <AvailableOrderCard
                key={order.id}
                order={order}
                onAccept={() => acceptOrder(order.id)}
                onReject={() => rejectOrder(order.id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
