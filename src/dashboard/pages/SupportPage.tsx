import { useState } from "react";
import { ChevronDown, MessageCircle, Phone, Mail } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    q: "Как отменить заказ?",
    a: "Вы можете отменить заказ до того, как исполнитель принял его в работу. Откройте детали заказа и нажмите «Отменить».",
  },
  {
    q: "Что делать, если мастер не приехал?",
    a: "Свяжитесь с поддержкой через кнопку ниже или позвоните нам. Мы найдём нового мастера или вернём деньги.",
  },
  {
    q: "Как повторить заказ?",
    a: "В разделе «История» или на главном экране нажмите «Повторить» рядом с нужным заказом.",
  },
  {
    q: "Как изменить адрес заказа?",
    a: "До назначения исполнителя вы можете изменить адрес в деталях заказа. После назначения — обратитесь в поддержку.",
  },
  {
    q: "В каких городах работает SLOT?",
    a: "Сейчас мы работаем в Москве и Московской области. Скоро открываемся в Санкт-Петербурге.",
  },
];

export function SupportPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-10">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Поддержка</h1>
      <p className="text-sm text-gray-400 mb-8">Мы на связи с 8:00 до 22:00</p>

      {/* Contact options */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: MessageCircle, label: "Чат", sub: "Онлайн" },
          { icon: Phone, label: "Звонок", sub: "+7 800 123-45-67" },
          { icon: Mail, label: "Email", sub: "help@slot.ru" },
        ].map(({ icon: Icon, label, sub }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <Icon size={18} className="text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-900">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Часто задаваемые вопросы
        </p>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }}>
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-gray-500">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
