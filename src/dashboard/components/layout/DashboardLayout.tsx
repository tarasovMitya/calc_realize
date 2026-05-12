import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuthStore } from "../../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";

export function DashboardLayout() {
  const { user } = useAuthStore();
  const { hydrateClient, isHydrated } = useDashboardStore();

  useEffect(() => {
    if (user?.id && !isHydrated) {
      hydrateClient(user.id);
    }
  }, [user?.id]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
}
