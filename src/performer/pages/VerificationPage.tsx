import { VerificationForm } from "../verification/VerificationForm";

export function PerformerVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-base font-bold text-gray-900 text-center">Верификация профиля</h1>
      </div>
      <VerificationForm />
    </div>
  );
}
