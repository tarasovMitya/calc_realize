import { useCalculatorStore } from "../store/calculatorStore";

const STEPS = ["category", "service", "parameters", "datetime", "contacts", "checkout"];
const STEP_LABELS: Record<string, string> = {
  category: "Категория",
  service: "Услуга",
  parameters: "Параметры",
  datetime: "Дата",
  contacts: "Контакты",
  checkout: "Итог",
};

export function ProgressBar() {
  const { step } = useCalculatorStore();
  const currentIdx = STEPS.indexOf(step);
  if (currentIdx === -1) return null;

  return (
    <div className="flex items-center gap-1 w-full">
      {STEPS.map((s, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`h-1 w-full rounded-full transition-all duration-300 ${
                isDone ? "bg-black" : isActive ? "bg-gray-400" : "bg-gray-100"
              }`}
            />
            <span
              className={`text-[10px] font-medium hidden sm:block transition-colors ${
                isActive ? "text-gray-900" : isDone ? "text-gray-500" : "text-gray-300"
              }`}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
