import { Outlet } from "react-router-dom";
import { PerformerSidebar } from "./PerformerSidebar";
import { MobilePerformerNav } from "./MobilePerformerNav";

export function PerformerLayout() {
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
