import { Link } from "react-router-dom";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { StatusBadge } from "../ui/StatusBadge";
import { PerformerCard } from "../ui/PerformerCard";
import { formatPrice } from "../../../utils/priceCalculator";
import type { Order } from "../../types";

const statusProgress: Record<string, number> = {
  searching: 10,
  assigned: 30,
  on_the_way: 55,
  in_progress: 80,
  completed: 100,
};

interface ActiveOrderCardProps {
  order: Order;
}

export function ActiveOrderCard({ order }: ActiveOrderCardProps) {
  const progress = statusProgress[order.status] ?? 0;
  const date = new Date(order.scheduledDate).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-100 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <Link to={`/dashboard/orders/${order.id}`}>
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <StatusBadge status={order.status} />
              <p className="text-base font-semibold text-gray-900 mt-2">{order.serviceName}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {date} · {order.scheduledTime}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} />
                  {order.address}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </div>

          {/* Progress bar */}
          <div className="mt-4 mb-1">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-black rounded-full"
              />
            </div>
          </div>
        </div>
      </Link>

      {/* Performer + ETA */}
      {order.performer && (
        <div className="px-5 py-4 border-t border-gray-50">
          <PerformerCard performer={order.performer} showPhone />
          {order.eta && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
              <Clock size={12} className="text-gray-400" />
              Прибудет <span className="font-semibold text-gray-900">{order.eta}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer price */}
      <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400">Стоимость</span>
        <span className="text-sm font-semibold text-gray-900">{formatPrice(order.priceTotal)}</span>
      </div>
    </motion.div>
  );
}
