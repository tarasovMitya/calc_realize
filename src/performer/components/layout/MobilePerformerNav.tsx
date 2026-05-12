import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Zap, Wallet, User, LogOut } from "lucide-react";
import { usePerformerStore } from "../../store/performerStore";
import { useAuthStore } from "../../../store/authStore";

const nav = [
  { to: "/performer", label: "Главная", icon: LayoutDashboard, end: true },
  { to: "/performer/available", label: "Заказы", icon: ClipboardList },
  { to: "/performer/active", label: "Активные", icon: Zap },
  { to: "/performer/earnings", label: "Заработок", icon: Wallet },
  { to: "/performer/profile", label: "Профиль", icon: User },
];

export function MobilePerformerNav() {
  const { availableOrders } = usePerformerStore();
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/performer/auth", { replace: true });
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40">
      <div className="flex items-center justify-around px-2 py-2">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                isActive ? "text-gray-900" : "text-gray-400"
              }`
            }
          >
            <div className="relative">
              <Icon size={20} />
              {label === "Заказы" && availableOrders.length > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {availableOrders.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}

        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-400 hover:text-gray-700 transition-all"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Выход</span>
        </button>
      </div>
    </nav>
  );
}
