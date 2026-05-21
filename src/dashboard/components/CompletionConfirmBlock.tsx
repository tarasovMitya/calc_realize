import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Check, Clock, Info } from "lucide-react";
import { trackEvent } from "../../hooks/useAnalytics";

interface CompletionConfirmBlockProps {
  comment: string | null | undefined;
  completionTime: string | null | undefined;
  afterPhotos?: string[];
  onConfirm: () => Promise<void>;
  onDispute: () => void;
}

export function CompletionConfirmBlock({
  comment,
  completionTime,
  afterPhotos,
  onConfirm,
  onDispute,
}: CompletionConfirmBlockProps) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = async () => {
    if (!agreed || confirming) return;
    setConfirming(true);
    try {
      await onConfirm();
      trackEvent("order_confirmed");
      setConfirmed(true);
    } finally {
      setConfirming(false);
    }
  };

  const timeStr = completionTime
    ? new Date(completionTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    : "";

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-green-100 bg-green-50 rounded-2xl p-5 flex flex-col items-center gap-2 text-center"
      >
        <CheckCircle size={28} className="text-green-600" />
        <p className="text-sm font-semibold text-green-800">Выполнение подтверждено</p>
        <p className="text-xs text-green-600">Спасибо! Оцените работу исполнителя</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-green-100 bg-green-50 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle size={16} className="text-green-600 shrink-0" />
        <span className="text-sm font-semibold text-green-800">Исполнитель завершил работу</span>
        {timeStr && (
          <span className="ml-auto text-xs text-green-600 shrink-0 flex items-center gap-1">
            <Clock size={11} /> {timeStr}
          </span>
        )}
      </div>

      {/* Performer comment */}
      {comment && (
        <p className="text-sm text-gray-700 bg-white rounded-xl px-4 py-3 mb-4 border border-green-100">
          {comment}
        </p>
      )}

      {/* After photos */}
      {afterPhotos && afterPhotos.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Фото результата</p>
          <div className="grid grid-cols-3 gap-2">
            {afterPhotos.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={url} alt={`Результат ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 bg-white rounded-xl px-3.5 py-3 border border-green-100 mb-4">
        <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 leading-snug">
          После подтверждения деньги переводятся исполнителю.
          Если есть претензии — откройте спор.
          Споры принимаются в течение 24 часов после закрытия.
        </p>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-3 cursor-pointer mb-4">
        <button
          onClick={() => setAgreed(!agreed)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
            agreed ? "bg-green-600 border-green-600" : "border-gray-300 bg-white"
          }`}
        >
          {agreed && <Check size={11} className="text-white" strokeWidth={3} />}
        </button>
        <span className="text-sm text-gray-700 leading-snug">
          Работа выполнена, претензий к исполнителю нет
        </span>
      </label>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleConfirm}
          disabled={!agreed || confirming}
          className="w-full py-3.5 rounded-2xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all active:scale-95 disabled:opacity-40"
        >
          {confirming ? "Подтверждение..." : "Подтвердить выполнение"}
        </button>
        <button
          onClick={onDispute}
          className="w-full py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-red-200 hover:text-red-600 transition-all flex items-center justify-center gap-1.5"
        >
          <AlertCircle size={14} />
          Есть проблема — открыть спор
        </button>
      </div>
    </motion.div>
  );
}
