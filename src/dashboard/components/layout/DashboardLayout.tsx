import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuthStore } from "../../../store/authStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { useSharedOrdersStore } from "../../../store/sharedOrdersStore";
import { dbSubscribeSharedOrderUpdates, dbGetSharedOrder } from "../../../lib/db";
import type { SharedOrder } from "../../../store/sharedOrdersStore";

export function DashboardLayout() {
  const { user } = useAuthStore();
  const { hydrateClient, isHydrated, orderFlowStatus, activeSharedOrderId, onPerformerAssigned } = useDashboardStore();
  const { updateOrder: updateSharedOrder } = useSharedOrdersStore();

  useEffect(() => {
    if (user?.id && !isHydrated) {
      hydrateClient(user.id);
    }
  }, [user?.id]);

  // Subscribe to Realtime + poll while searching for a performer
  useEffect(() => {
    if (orderFlowStatus !== "searching" || !activeSharedOrderId) return;

    const handleUpdate = (order: SharedOrder) => {
      updateSharedOrder(order);
      if (order.status === "performer_assigned") {
        onPerformerAssigned();
      }
    };

    // Realtime (fires instantly when DB changes)
    const unsubscribe = dbSubscribeSharedOrderUpdates(activeSharedOrderId, handleUpdate);

    // Poll every 5 seconds as reliable fallback
    const interval = setInterval(async () => {
      const order = await dbGetSharedOrder(activeSharedOrderId);
      if (order) handleUpdate(order);
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [orderFlowStatus, activeSharedOrderId]);

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
