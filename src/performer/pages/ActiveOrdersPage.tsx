import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { usePerformerStore } from "../store/performerStore";
import { PerformerActiveOrderCard } from "../components/cards/ActiveOrderCard";

export function PerformerActiveOrdersPage() {
  const { activeOrders } = usePerformerStore();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Активные заказы</h1>
        <p className="text-sm text-gray-400 mt-1">
          {activeOrders.length > 0 ? `${activeOrders.length} в работе` : "Нет активных заказов"}
        </p>
      </motion.div>

      {activeOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 flex flex-col items-center gap-3 text-center"
        >
          <Zap size={36} className="text-gray-200" />
          <p className="text-base font-medium text-gray-400">Нет активных заказов</p>
          <p className="text-sm text-gray-300">Примите новый заказ из раздела «Новые заказы»</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PerformerActiveOrderCard order={order} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
