import { useCalculatorStore } from "../../store/calculatorStore";
import { calculatePrice, formatPrice } from "../../utils/priceCalculator";

export function CheckoutStep() {
  const { selectedService, fieldValues, schedule, contacts, selectedCategory } =
    useCalculatorStore();
  const breakdown = calculatePrice(selectedService, fieldValues);

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" });
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
        <Section title="Услуга">
          <Row label="Категория" value={selectedCategory?.name ?? "—"} />
          <Row label="Услуга" value={selectedService?.name ?? "—"} />
        </Section>

        <Section title="Состав заказа">
          {breakdown.items.map((item, i) => (
            <Row key={i} label={item.label} value={formatPrice(item.amount)} />
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-base font-bold text-gray-900">Итого</span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(breakdown.total)}</span>
          </div>
        </Section>

        <Section title="Дата и время">
          <Row label="Дата" value={formatDate(schedule.date)} />
          <Row label="Время" value={schedule.time || "—"} />
        </Section>

        <Section title="Контакты">
          <Row label="Имя" value={contacts.name} />
          <Row label="Email" value={contacts.email} />
          <Row label="Адрес" value={contacts.address} />
          {contacts.comment && <Row label="Комментарий" value={contacts.comment} />}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}
