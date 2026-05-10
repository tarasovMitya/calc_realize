import { Bell, CheckCircle, User, Clock, Tag } from "lucide-react";
import type { Notification } from "../../types";

const iconMap = {
  status: Bell,
  performer: User,
  completed: CheckCircle,
  reminder: Clock,
  promo: Tag,
};

const colorMap = {
  status: "bg-blue-50 text-blue-600",
  performer: "bg-indigo-50 text-indigo-600",
  completed: "bg-green-50 text-green-600",
  reminder: "bg-amber-50 text-amber-600",
  promo: "bg-purple-50 text-purple-600",
};

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = iconMap[notification.type];
  const color = colorMap[notification.type];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-colors ${
        notification.read ? "bg-white" : "bg-gray-50"
      } hover:bg-gray-50`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-gray-900"}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
      </div>
    </button>
  );
}
