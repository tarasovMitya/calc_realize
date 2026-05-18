import { useNavigate } from "react-router-dom";
import { ShieldCheck, Clock, XCircle } from "lucide-react";
import { usePerformerStore } from "../store/performerStore";

interface VerificationGateProps {
  children: React.ReactNode;
}

export function VerificationGate({ children }: VerificationGateProps) {
  const { verificationStatus, rejectionReason } = usePerformerStore();
  const navigate = useNavigate();

  if (verificationStatus === "approved") {
    return <>{children}</>;
  }

  if (verificationStatus === "not_started") {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 pb-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={28} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Чтобы начать принимать заказы, необходимо пройти проверку профиля
          </h2>
          <p className="text-sm text-gray-500 mb-7">
            Верификация помогает повысить доверие клиентов и безопасность платформы.
            Проверка занимает в среднем 24 часа.
          </p>
          <button
            onClick={() => navigate("/performer/verification")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Пройти верификацию
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === "pending") {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 pb-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ваша анкета отправлена на проверку</h2>
          <p className="text-sm text-gray-500 mb-5">
            Администратор проверяет ваши документы. Вы получите уведомление после завершения.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-amber-700">Среднее время проверки — 24 часа</p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === "rejected") {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 pb-10">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <XCircle size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Верификация отклонена</h2>
          {rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-red-500 mb-1 uppercase tracking-wider">Причина отказа</p>
              <p className="text-sm text-red-700">{rejectionReason}</p>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Исправьте указанные замечания и отправьте анкету повторно.
          </p>
          <button
            onClick={() => navigate("/performer/verification")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Отправить повторно
          </button>
        </div>
      </div>
    );
  }

  // blocked or unknown
  return (
    <div className="max-w-lg mx-auto px-4 pt-16 text-center">
      <p className="text-sm text-gray-400">Доступ к заказам ограничен. Обратитесь в поддержку.</p>
    </div>
  );
}
