import { Outlet } from "react-router-dom";
import { AffiliateSidebar } from "./AffiliateSidebar";

export function AffiliateLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AffiliateSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
