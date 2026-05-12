import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PerformerSidebar } from "./PerformerSidebar";
import { MobilePerformerNav } from "./MobilePerformerNav";
import { useAuthStore } from "../../../store/authStore";
import { usePerformerStore } from "../../store/performerStore";

export function PerformerLayout() {
  const { user } = useAuthStore();
  const { hydratePerformer, isHydrated } = usePerformerStore();

  useEffect(() => {
    if (user?.id && !isHydrated) {
      hydratePerformer(user.id);
    }
  }, [user?.id]);

  return (
    <div className="flex min-h-screen bg-white">
      <PerformerSidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <MobilePerformerNav />
    </div>
  );
}
