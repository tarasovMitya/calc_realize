import { Wrench } from "lucide-react";

export function TestModeBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <Wrench size={15} className="text-amber-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Тестовый режим</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Платформа работает в тестовом режиме. Оплата производится напрямую исполнителю после выполнения работ.
        </p>
      </div>
    </div>
  );
}
