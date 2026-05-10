import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { AvailabilityToggle } from "../components/ui/AvailabilityToggle";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const TIMES = ["08:00–12:00", "12:00–16:00", "16:00–20:00", "20:00–00:00"];

export function SchedulePage() {
  const [availability, setAvailability] = useState<Record<string, string[]>>({
    Пн: ["08:00–12:00", "12:00–16:00"],
    Вт: ["12:00–16:00", "16:00–20:00"],
    Ср: ["08:00–12:00"],
    Чт: ["08:00–12:00", "12:00–16:00"],
    Пт: ["12:00–16:00", "16:00–20:00"],
    Сб: [],
    Вс: [],
  });

  const toggle = (day: string, time: string) => {
    setAvailability((prev) => {
      const current = prev[day] ?? [];
      return {
        ...prev,
        [day]: current.includes(time)
          ? current.filter((t) => t !== time)
          : [...current, time],
      };
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Расписание</h1>
        <p className="text-sm text-gray-400 mt-1">Укажите когда вы доступны для заказов</p>
      </motion.div>

      {/* Online toggle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <AvailabilityToggle />
      </motion.div>

      {/* Weekly grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Доступность на неделю</h2>
        </div>

        <div className="flex flex-col gap-3">
          {DAYS.map((day, i) => {
            const slots = availability[day] ?? [];
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="border border-gray-100 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">{day}</p>
                  <span className="text-xs text-gray-400">
                    {slots.length === 0 ? "Выходной" : `${slots.length} слота`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {TIMES.map((time) => {
                    const active = slots.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => toggle(day, time)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                          active
                            ? "bg-black text-white"
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
