import { Bell } from "lucide-react";
import { useDashboardStore } from "../store/dashboardStore";
import { NotificationItem } from "../components/ui/NotificationItem";
import { EmptyState } from "../components/ui/EmptyState";

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead } = useDashboardStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Уведомления</h1>
          {unread > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{unread} непрочитанных</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            Прочитать все
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="Нет уведомлений"
          description="Здесь будут статусы заказов и обновления"
        />
      ) : (
        <div className="flex flex-col gap-1">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={() => markNotificationRead(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
