import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { User, Swords, Shield, Headphones, Users, Star } from "lucide-react";

const ROLE_SECTIONS = [
  { title: "In-Game Leader", roles: ["IGL"], icon: Star },
  { title: "Fraggers", roles: ["Rusher", "Assaulter", "Fragger"], icon: Swords },
  { title: "Support & Sniper", roles: ["Support", "Sniper"], icon: Shield },
  { title: "Staff", roles: ["Coach", "Analyst"], icon: Headphones },
  { title: "Substitutes", roles: ["Substitute"], icon: Users },
];

function RosterCard({ player }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/players/${player.id}`)} className="card-premium rounded-xl p-4 cursor-pointer group relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-[#21262d] flex items-center justify-center border border-[#30363d] overflow-hidden flex-shrink-0">
          {player.photoURL ? <img src={player.photoURL} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-text-muted" />}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-primary group-hover:text-[#58a6ff] transition-colors duration-150 truncate">{player.inGameName}</h3>
          <p className="text-xs text-text-muted truncate">{player.fullName}</p>
          {player.primaryRole && <p className="text-[10px] text-[#58a6ff] font-semibold mt-0.5">{player.primaryRole}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Roster() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/players").then((res) => setPlayers(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Team Roster</h1>
        <p className="text-sm text-text-muted mt-1 font-medium">BV Esports Free Fire Squad</p>
      </div>

      {ROLE_SECTIONS.map((section) => {
        const sectionPlayers = players.filter((p) => section.roles.includes(p.primaryRole) && p.status === "Active");
        if (sectionPlayers.length === 0) return null;
        const Icon = section.icon;
        return (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(88,166,255,0.1)] flex items-center justify-center border border-[rgba(88,166,255,0.15)]">
                <Icon className="w-4 h-4 text-[#58a6ff]" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
              <span className="badge-premium text-text-muted bg-[#21262d] border border-[#30363d]">{sectionPlayers.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sectionPlayers.map((p) => <RosterCard key={p.id} player={p} />)}
            </div>
          </div>
        );
      })}

      {players.filter((p) => p.status === "Active").length === 0 && (
        <div className="text-center py-16"><Users className="w-12 h-12 text-text-muted/30 mx-auto mb-3" /><p className="text-text-muted font-medium">No active roster</p></div>
      )}
    </div>
  );
}
