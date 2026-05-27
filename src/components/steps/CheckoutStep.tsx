import { useCalculatorStore } from "../../store/calculatorStore";
import { formatPrice, pluralService } from "../../utils/priceCalculator";

export function CheckoutStep() {
  const { cart, schedule, contacts } = useCalculatorStore();

  const grandTotal = cart.reduce((sum, item) => sum + item.priceTotal, 0);

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "long",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Проверьте заказ
        </h2>
        <p className="text-gray-500 mt-2 text-lg">Всё верно?</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Services — one card per service */}
        <Section title={`Состав заказа · ${cart.length} ${pluralService(cart.length)}`}>
          {cart.map((item, idx) => (
            <div key={item.id} className={idx > 0 ? "pt-4 border-t border-gray-50" : ""}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-gray-900">{item.serviceName}</span>
              </div>
              <div className="flex flex-col gap-1.5 pl-7">
                {item.priceBreakdown.map((b, i) => (
                  <Row key={i} label={b.label} value={formatPrice(b.amount)} />
                ))}
                {item.priceBreakdown.length > 1 && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Подитог</span>
                    <span className="text-xs font-semibold text-gray-700">{formatPrice(item.priceTotal)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Grand total */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-2">
            <span className="text-base font-bold text-gray-900">Итого</span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(grandTotal)}</span>
          </div>
        </Section>

        <Section title="Дата и время">
          <Row label="Дата" value={formatDate(schedule.date)} />
          <Row label="Время" value={schedule.time || "—"} />
        </Section>

        <Section title="Контакты">
          <Row label="Имя" value={contacts.name} />
          <Row label="Email" value={contacts.email} warn={!contacts.email} />
          <Row label="Адрес" value={contacts.address} warn={!contacts.address} />
          {contacts.comment && <Row label="Комментарий" value={contacts.comment} />}
        </Section>

        {(!contacts.email || !contacts.address) && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Заполните email и адрес — без них нельзя назначить исполнителя
          </div>
        )}

        {/* Price disclaimer */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Стоимость является предварительной оценкой. Финальная стоимость согласовывается с исполнителем.
        </div>

        {/* TEST MODE notice */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span className="font-semibold">Тестовый режим.</span> Оплата производится напрямую исполнителю после выполнения работ.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${warn ? "text-amber-600 italic" : "text-gray-900"}`}>
        {value || "Не указано"}
      </span>
    </div>
  );
}
