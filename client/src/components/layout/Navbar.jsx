import { Menu, Bell, Search, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { userData } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-bg-dark/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 bg-bg-card border border-border rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search players..."
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-48"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-text-primary leading-tight">{userData?.name || "User"}</p>
              <p className="text-[10px] text-text-muted">{userData?.accountRole || "Player"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
