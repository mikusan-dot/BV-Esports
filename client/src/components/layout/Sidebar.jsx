import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";
import {
  LayoutDashboard,
  Users,
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
  UserCircle,
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
  { path: "/profile", label: "My Profile", icon: UserCircle, minRole: "Player" },
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
      {/* Logo */}
      <div className={`p-4 ${collapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(88,166,255,0.15)] to-[rgba(88,166,255,0.05)] flex items-center justify-center flex-shrink-0 border border-[rgba(88,166,255,0.15)] shadow-sm">
            <Trophy className="w-5 h-5 text-[#58a6ff]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-extrabold tracking-tight whitespace-nowrap">
                <span className="text-[#58a6ff]">BV</span>
                <span className="text-text-muted font-medium ml-1.5">Esports</span>
              </h1>
              <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-semibold mt-0.5">Free Fire</p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      {!collapsed && <div className="mx-4 divider" />}

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto mt-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group relative ${
                isActive
                  ? "nav-active"
                  : "text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.04)]"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-150 ${isActive ? "text-[#58a6ff]" : "group-hover:text-text-primary"}`} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-2.5 border-t border-[#30363d]">
        {!collapsed && userData && (
          <div className="px-3 py-2.5 mb-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[#30363d]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#21262d] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#30363d]">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-[#58a6ff]">{userData.name?.charAt(0) || "?"}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text-primary truncate">{userData.name}</p>
                <p className="text-[10px] text-text-muted font-medium">{role}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#f85149]/80 hover:text-[#f85149] hover:bg-[rgba(248,81,73,0.08)] transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen sidebar-gradient border-r border-[#30363d] z-40 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-9 w-6 h-6 bg-[#21262d] border border-[#30363d] rounded-full flex items-center justify-center text-text-muted hover:text-[#58a6ff] hover:border-[rgba(88,166,255,0.3)] transition-all duration-200 shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 sidebar-gradient border-r border-[#30363d] animate-slide-in shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
