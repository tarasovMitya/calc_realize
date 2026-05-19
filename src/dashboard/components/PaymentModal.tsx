import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Calendar, Clock, MapPin, X } from "lucide-react";
import { useDashboardStore } from "../store/dashboardStore";
import { formatPrice } from "../../utils/priceCalculator";

export function PaymentModal() {
  const { pendingOrder, paymentStatus, startPayment, completePayment, dismissPayment } = useDashboardStore();
  const [cardNumber] = useState("•••• •••• •••• 4242");

  if (!pendingOrder || paymentStatus === "paid") return null;

  const isProcessing = paymentStatus === "processing";

  const handlePay = async () => {
    startPayment();
    await new Promise((r) => setTimeout(r, 2500));
    completePayment();
  };

  const date = pendingOrder.scheduledDate
    ? new Date(pendingOrder.scheduledDate).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        weekday: "short",
      })
    : "—";

  return (
    <AnimatePresence>
      {(paymentStatus === "pending" || paymentStatus === "processing") && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={!isProcessing ? dismissPayment : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 lg:inset-0 lg:flex lg:items-center lg:justify-center p-4"
          >
            <div className="bg-white rounded-3xl w-full max-w-md mx-auto shadow-2xl overflow-hidden">

              {/* Processing overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center gap-4 rounded-3xl"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 rounded-full border-2 border-gray-100 border-t-black"
                    />
                    <p className="text-base font-semibold text-gray-900">Подтверждаем оплату...</p>
                    <p className="text-sm text-gray-400">Это займёт несколько секунд</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Lock size={13} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-400">Безопасная оплата</span>
                  </div>
                  <button onClick={dismissPayment} className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1">
                    <X size={18} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Оплата заказа</h2>
              </div>

              {/* Order summary */}
              <div className="px-6 py-4 flex flex-col gap-4">
                {/* Service */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Услуга
                  </p>
                  <p className="text-base font-semibold text-gray-900">{pendingOrder.serviceName}</p>
                  <p className="text-sm text-gray-500">{pendingOrder.categoryName}</p>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    {date} · {pendingOrder.scheduledTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} className="text-gray-400 shrink-0" />
                    {pendingOrder.duration}
                  </div>
                  {pendingOrder.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      {pendingOrder.address}
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2">
                  {pendingOrder.priceBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-1">
                    <span className="text-sm font-bold text-gray-900">Итого</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(pendingOrder.priceTotal)}
                    </span>
                  </div>
                </div>

                {/* Mock card */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">VISA</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{cardNumber}</span>
                  </div>
                  <span className="text-xs text-gray-400">12/27</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-black text-white font-semibold text-base disabled:opacity-60 hover:bg-gray-800 transition-all active:scale-95"
                >
                  Оплатить {formatPrice(pendingOrder.priceTotal)}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Оплата защищена SSL-шифрованием
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
