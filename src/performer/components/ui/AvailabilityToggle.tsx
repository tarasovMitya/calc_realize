import { motion } from "framer-motion";
import { usePerformerStore } from "../../store/performerStore";

export function AvailabilityToggle() {
  const { isOnline, toggleOnline } = usePerformerStore();

  return (
    <button
      onClick={toggleOnline}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition-all w-full ${
        isOnline
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      {/* Toggle pill */}
      <div
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          isOnline ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <motion.div
          animate={{ x: isOnline ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </div>

      <div className="text-left">
        <p className={`text-sm font-semibold ${isOnline ? "text-green-800" : "text-gray-600"}`}>
          {isOnline ? "Вы онлайн" : "Вы офлайн"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {isOnline ? "Получаете новые заказы" : "Заказы не поступают"}
        </p>
      </div>
    </button>
  );
}
