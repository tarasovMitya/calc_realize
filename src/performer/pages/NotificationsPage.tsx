import { motion } from "framer-motion";
import { Bell, ClipboardList, Zap, XCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePerformerStore } from "../store/performerStore";
import type { PerformerNotification } from "../types";

const iconMap = {
  new_order: ClipboardList,
  status_change: Zap,
  cancellation: XCircle,
  payment: Wallet,
};

const colorMap = {
  new_order: "bg-amber-50 text-amber-600",
  status_change: "bg-blue-50 text-blue-600",
  cancellation: "bg-red-50 text-red-600",
  payment: "bg-green-50 text-green-600",
};

function NotificationCard({ n, onClick }: { n: PerformerNotification; onClick: () => void }) {
  const Icon = iconMap[n.type];
  const color = colorMap[n.type];

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-colors ${
        n.read ? "bg-white" : "bg-gray-50"
      } hover:bg-gray-50`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${n.read ? "text-gray-700" : "text-gray-900"}`}>
            {n.title}
          </p>
          <span className="text-xs text-gray-400 shrink-0">{n.time}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
      </div>
      {!n.read && <div className="w-2 h-2 rounded-full bg-black shrink-0 mt-1.5" />}
    </motion.button>
  );
}

export function PerformerNotificationsPage() {
  const { notifications, markNotificationRead, markAllRead } = usePerformerStore();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  const handleClick = (n: PerformerNotification) => {
    markNotificationRead(n.id);
    if (n.orderId) navigate(`/performer/orders/${n.orderId}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Уведомления</h1>
          {unread > 0 && (
            <p className="text-sm text-gray-400 mt-1">{unread} непрочитанных</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            Прочитать все
          </button>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <Bell size={36} className="text-gray-200" />
          <p className="text-base font-medium text-gray-400">Нет уведомлений</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-50">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              n={n}
              onClick={() => handleClick(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
