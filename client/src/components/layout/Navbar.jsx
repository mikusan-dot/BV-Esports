import { Menu, Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { userData } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 navbar-blur border-b border-[#30363d]">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] transition-all duration-150"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-2.5 bg-[rgba(255,255,255,0.04)] rounded-lg px-3.5 py-2 border border-[#30363d] focus-within:border-[rgba(88,166,255,0.4)] transition-all duration-200">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search players..."
              className="bg-transparent text-[13px] text-text-primary placeholder-text-muted outline-none w-48"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] transition-all duration-150">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#58a6ff] rounded-full shadow-[0_0_6px_rgba(88,166,255,0.4)]" />
          </button>
          <div className="w-px h-6 bg-[#30363d] mx-1" />
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all duration-150 group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[#21262d] flex items-center justify-center overflow-hidden border border-[#30363d] group-hover:border-[#484f58] transition-all duration-200 shadow-sm">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-text-secondary" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#3fb950] rounded-full border-[1.5px] border-[#161b22] shadow-[0_0_4px_rgba(63,185,80,0.3)]" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-text-primary leading-tight">{userData?.name || "User"}</p>
              <p className="text-[10px] text-text-muted font-medium">{userData?.accountRole || "Player"}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
