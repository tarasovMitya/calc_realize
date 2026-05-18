import { useAnalyticsStore } from "../store/analyticsStore";
import { formatPrice } from "../../utils/priceCalculator";
import { ShoppingBag, LogIn, UserCheck, CheckCircle, AlertTriangle, XCircle, Activity, Zap } from "lucide-react";

const EVENT_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  order_created:               { label: "Новый заказ",           icon: <ShoppingBag size={13} />,  color: "bg-blue-100 text-blue-600" },
  login_success:               { label: "Авторизация",           icon: <LogIn size={13} />,        color: "bg-indigo-100 text-indigo-600" },
  performer_assigned:          { label: "Назначен исполнитель",  icon: <UserCheck size={13} />,    color: "bg-violet-100 text-violet-600" },
  client_confirmed_completion: { label: "Заказ завершён",        icon: <CheckCircle size={13} />,  color: "bg-emerald-100 text-emerald-600" },
  dispute_opened:              { label: "Открыт спор",           icon: <AlertTriangle size={13} />, color: "bg-orange-100 text-orange-600" },
  order_cancelled:             { label: "Отмена заказа",         icon: <XCircle size={13} />,      color: "bg-red-100 text-red-600" },
  react_error:                 { label: "React ошибка",          icon: <Activity size={13} />,     color: "bg-red-100 text-red-600" },
  api_error:                   { label: "API ошибка",            icon: <Activity size={13} />,     color: "bg-red-100 text-red-600" },
  payment_success:             { label: "Оплата прошла",         icon: <Zap size={13} />,          color: "bg-green-100 text-green-600" },
  registration_completed:      { label: "Регистрация",           icon: <UserCheck size={13} />,    color: "bg-teal-100 text-teal-600" },
  performer_registered:        { label: "Новый исполнитель",     icon: <UserCheck size={13} />,    color: "bg-purple-100 text-purple-600" },
  performer_verified:          { label: "Исполнитель верифицирован", icon: <CheckCircle size={13} />, color: "bg-emerald-100 text-emerald-600" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "только что";
  if (m < 60) return `${m} мин. назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч. назад`;
  return new Date(iso).toLocaleDateString("ru-RU");
}

export function ActivitySection() {
  const { activityFeed, topServices } = useAnalyticsStore();

  return (
    <div className="space-y-6">
      {/* Activity feed */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Лента активности</p>
          <span className="text-xs text-gray-400">{activityFeed.length} последних событий</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
          {activityFeed.map((ev) => {
            const meta = EVENT_META[ev.event_name] ?? { label: ev.event_name, icon: <Activity size={13} />, color: "bg-gray-100 text-gray-500" };
            return (
              <div key={ev.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(ev.created_at)}</span>
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    {ev.page && <span className="text-xs text-gray-400 truncate">{ev.page}</span>}
                    {ev.user_id && (
                      <span className="text-xs font-mono text-gray-400">{ev.user_id.slice(0, 8)}…</span>
                    )}
                    {ev.error_message && (
                      <span className="text-xs text-red-500 truncate">{ev.error_message}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {activityFeed.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">Событий нет</div>
          )}
        </div>
      </div>

      {/* Top services table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Топ услуг</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Услуга</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Категория</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Заказы</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Выручка</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ср. чек</th>
              </tr>
            </thead>
            <tbody>
              {(topServices?.byService ?? []).map((svc, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-xs text-gray-400 font-semibold">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800 text-xs">{svc.name}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{svc.category}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-900">{svc.orders}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-900">{formatPrice(svc.revenue)}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-500">{formatPrice(svc.avgPrice)}</td>
                </tr>
              ))}
              {(topServices?.byService?.length ?? 0) === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Нет данных</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geo placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900 mb-2">Гео-аналитика</p>
        <p className="text-xs text-gray-400 mb-5">Для тепловых карт и географических отчётов подключите geo-данные к заказам</p>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">🗺</div>
          <div>
            <p className="text-sm font-medium text-gray-600">Архитектура готова</p>
            <p className="text-xs text-gray-400 mt-1">Добавьте поля lat/lng в shared_orders и подключите карту</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">Heatmap по заказам</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Районы с высоким спросом</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Распределение исполнителей</span>
          </div>
        </div>
      </div>
    </div>
  );
}
