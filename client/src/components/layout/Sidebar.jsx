import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";
import {
  LayoutDashboard,
  Users,
  Shield,
  UserCog,
  DollarSign,
  Receipt,
  Megaphone,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Swords,
  Trophy,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, minRole: "Player" },
  { path: "/roster", label: "Roster", icon: Swords, minRole: "Player" },
  { path: "/players", label: "Players", icon: Users, minRole: "Player" },
  { path: "/finance", label: "Finance", icon: DollarSign, permission: "canViewFinance" },
  { path: "/transactions", label: "Transactions", icon: Receipt, permission: "canViewFinance" },
  { path: "/announcements", label: "Announcements", icon: Megaphone, minRole: "Player" },
  { path: "/activity", label: "Activity Log", icon: Activity, permission: "canViewActivity" },
  { path: "/settings", label: "Settings", icon: Settings, permission: "canManageSettings" },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const role = userData?.accountRole || "Player";

  const filteredItems = navItems.filter((item) => {
    if (item.permission) return hasPermission(role, item.permission);
    if (item.minRole) {
      const hierarchy = { Owner: 4, Admin: 3, Manager: 2, Player: 1 };
      return (hierarchy[role] || 0) >= (hierarchy[item.minRole] || 0);
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 p-4 border-b border-border ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-text-primary whitespace-nowrap">BV Esports</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">Free Fire</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover border border-transparent"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        {!collapsed && userData && (
          <div className="px-3 py-2 mb-2 rounded-lg bg-bg-card border border-border">
            <p className="text-sm font-medium text-text-primary truncate">{userData.name}</p>
            <p className="text-xs text-text-muted">{role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-bg-darker border-r border-border transition-all duration-300 z-40 ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-bg-card border border-border rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-bg-darker border-r border-border animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
