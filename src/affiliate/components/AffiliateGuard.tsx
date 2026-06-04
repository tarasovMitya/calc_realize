import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAffiliateStore } from "../store/affiliateStore";
import { supabase } from "../../lib/supabase";
import { useState } from "react";

export function AffiliateGuard() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { setUserId } = useAffiliateStore();
  const [role, setRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (!user) return;
    setUserId(user.id);
    supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setRole((data?.role as string) ?? null);
        setIsLoadingRole(false);
      });
  }, [user, setUserId]);

  if (isLoading || isLoadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#006AFF] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (role !== "affiliate_manager") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080a14]">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">Нет доступа</p>
          <p className="text-gray-500 text-sm">Эта страница доступна только аффилейт-менеджерам</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
