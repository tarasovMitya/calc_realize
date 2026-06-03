import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ClipboardList, AlertTriangle,
  MessageSquare, DollarSign, CheckSquare, Link2, LogOut,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

const nav = [
  { to: "/affiliate",           label: "Обзор",          icon: LayoutDashboard, end: true },
  { to: "/affiliate/performers",label: "Исполнители",    icon: Users },
  { to: "/affiliate/orders",    label: "Заказы",         icon: ClipboardList },
  { to: "/affiliate/disputes",  label: "Споры",          icon: AlertTriangle },
  { to: "/affiliate/chats",     label: "Чаты",           icon: MessageSquare },
  { to: "/affiliate/finance",   label: "Финансы",        icon: DollarSign },
  { to: "/affiliate/tasks",     label: "Задачник",       icon: CheckSquare },
  { to: "/affiliate/referral",  label: "Реф. ссылка",   icon: Link2 },
];

export function AffiliateSidebar() {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-gray-800">
        <img src="/logo-full.svg" alt="SLOT" className="h-6 w-auto brightness-0 invert mb-1" />
        <p className="text-gray-400 text-xs mt-1">Партнёрский кабинет</p>
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#006AFF] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-gray-800">
        <button
          onClick={async () => { await signOut(); navigate("/auth", { replace: true }); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={15} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
