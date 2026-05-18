import { useAnalyticsStore } from "../store/analyticsStore";
import { formatPrice } from "../../utils/priceCalculator";

function RetentionCircle({ label, value }: { label: string; value: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 40 ? "#10b981" : value >= 20 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{value}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-600 text-center">{label}</p>
    </div>
  );
}

export function RetentionSection() {
  const { retention, ltv } = useAnalyticsStore();

  return (
    <div className="space-y-6">
      {/* Retention circles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900 mb-1">Retention пользователей</p>
        <p className="text-xs text-gray-400 mb-6">Доля пользователей, вернувшихся через N дней после первой сессии</p>
        <div className="flex justify-around items-center py-4">
          <RetentionCircle label="Day 1" value={retention?.d1  ?? 0} />
          <RetentionCircle label="Day 7" value={retention?.d7  ?? 0} />
          <RetentionCircle label="Day 30" value={retention?.d30 ?? 0} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Всего пользователей</p>
            <p className="text-xl font-bold text-gray-900">{retention?.totalUsers ?? 0}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Вернулись хотя бы раз</p>
            <p className="text-xl font-bold text-gray-900">{retention?.repeatUsers ?? 0}</p>
          </div>
        </div>
        {(retention?.totalUsers ?? 0) === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Данные появятся после накопления сессий в event_logs
          </p>
        )}
      </div>

      {/* LTV / CAC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LTV */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">LTV — Lifetime Value клиента</p>
          <div className="space-y-3">
            <LTVRow label="Расчётный LTV" value={formatPrice(ltv?.ltv ?? 0)} highlight />
            <LTVRow label="Среднее заказов на клиента" value={`${ltv?.avgOrdersPerUser ?? 0}`} />
            <LTVRow label="Средний чек (завершённые)" value={formatPrice(ltv?.avgOrderValue ?? 0)} />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            LTV = среднее заказов × средний чек завершённых заказов
          </p>
        </div>

        {/* CAC placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">CAC — стоимость привлечения</p>
          <p className="text-xs text-gray-400 mb-6">Для расчёта CAC необходимы данные рекламных кабинетов</p>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
              <p className="text-xs font-semibold text-gray-600 mb-1">Подключить источники трафика</p>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                <li>Google Ads (расходы на кампании)</li>
                <li>Telegram Ads (расходы на канал)</li>
                <li>VK Ads (расходы)</li>
                <li>Органика / реферралы</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">LTV / CAC (после подключения рекламы)</p>
              <p className="text-xl font-bold text-gray-400">— : 1</p>
              <p className="text-xs text-gray-400 mt-0.5">Цель: &gt; 3 : 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Retention benchmarks */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <p className="text-sm font-semibold text-blue-800 mb-3">Ориентиры retention для marketplace</p>
        <div className="grid grid-cols-3 gap-4">
          <Benchmark label="Day 1" good="40%+" ok="20-40%" bad="&lt;20%" value={retention?.d1 ?? 0} />
          <Benchmark label="Day 7" good="15%+" ok="8-15%" bad="&lt;8%"  value={retention?.d7 ?? 0} />
          <Benchmark label="Day 30" good="7%+"  ok="3-7%"  bad="&lt;3%"  value={retention?.d30 ?? 0} />
        </div>
      </div>
    </div>
  );
}

function LTVRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${highlight ? "bg-emerald-50" : "bg-gray-50"}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

function Benchmark({ label, good, ok, bad, value }: { label: string; good: string; ok: string; bad: string; value: number }) {
  const tier = value >= parseInt(good) ? "good" : value >= parseInt(ok) ? "ok" : "bad";
  return (
    <div className="bg-white rounded-lg p-3">
      <p className="text-xs font-bold text-blue-700 mb-2">{label}</p>
      <div className="space-y-1 text-xs">
        <div className={`flex justify-between ${tier === "good" ? "text-emerald-700 font-semibold" : "text-gray-500"}`}>
          <span>Хорошо</span><span>{good}</span>
        </div>
        <div className={`flex justify-between ${tier === "ok" ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
          <span>Норма</span><span>{ok}</span>
        </div>
        <div className={`flex justify-between ${tier === "bad" ? "text-red-500 font-semibold" : "text-gray-400"}`}>
          <span>Слабо</span><span>{bad}</span>
        </div>
      </div>
      {value > 0 && (
        <div className={`mt-2 pt-2 border-t border-gray-100 text-xs font-bold ${tier === "good" ? "text-emerald-600" : tier === "ok" ? "text-amber-500" : "text-red-500"}`}>
          Сейчас: {value}%
        </div>
      )}
    </div>
  );
}
