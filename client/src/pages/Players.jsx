import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { hasPermission, getStatusColor } from "../utils/permissions";
import { GAME_ROLES, PLAYER_STATUSES } from "../utils/constants";
import {
  Search,
  Plus,
  Filter,
  User,
  X,
  Save,
  Users,
} from "lucide-react";

function PlayerCard({ player, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card-premium rounded-xl p-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-[#21262d] flex items-center justify-center flex-shrink-0 border border-[#30363d] overflow-hidden">
          {player.photoURL ? (
            <img src={player.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-text-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-text-primary group-hover:text-[#58a6ff] transition-colors duration-150 truncate">
            {player.inGameName}
          </h3>
          <p className="text-xs text-text-muted mt-0.5 truncate">{player.fullName}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {player.primaryRole && (
            <span className="badge-premium text-[#58a6ff] bg-[rgba(88,166,255,0.1)] border border-[rgba(88,166,255,0.15)]">
              {player.primaryRole}
            </span>
          )}
          <span className={`badge-premium ${getStatusColor(player.status)}`}>
            {player.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function PlayerModal({ player, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: "",
    inGameName: "",
    uid: "",
    primaryRole: "",
    secondaryRole: "",
    status: "Active",
    device: "",
    achievements: "",
    socialLinks: { facebook: "", instagram: "", discord: "" },
  });

  useEffect(() => {
    if (player) {
      setForm({
        fullName: player.fullName || "",
        inGameName: player.inGameName || "",
        uid: player.uid || "",
        primaryRole: player.primaryRole || "",
        secondaryRole: player.secondaryRole || "",
        status: player.status || "Active",
        device: player.device || "",
        achievements: (player.achievements || []).join(", "),
        socialLinks: player.socialLinks || { facebook: "", instagram: "", discord: "" },
      });
    } else {
      setForm({
        fullName: "",
        inGameName: "",
        uid: "",
        primaryRole: "",
        secondaryRole: "",
        status: "Active",
        device: "",
        achievements: "",
        socialLinks: { facebook: "", instagram: "", discord: "" },
      });
    }
  }, [player]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      achievements: form.achievements ? form.achievements.split(",").map((a) => a.trim()) : [],
    };

    try {
      if (player) {
        await api.put(`/players/${player.id}`, data);
      } else {
        await api.post("/players", data);
      }
      onSave();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save player");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h3 className="text-lg font-bold text-text-primary">{player ? "Edit Player" : "Add Player"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#21262d] text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">In-Game Name *</label>
              <input type="text" value={form.inGameName} onChange={(e) => setForm({ ...form, inGameName: e.target.value })} required className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Free Fire UID</label>
              <input type="text" value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Device</label>
              <input type="text" value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} placeholder="e.g., iPhone 15 Pro" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Primary Role</label>
              <select value={form.primaryRole} onChange={(e) => setForm({ ...form, primaryRole: e.target.value })} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary">
                <option value="">Select role</option>
                {GAME_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary">
                {PLAYER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Achievements (comma-separated)</label>
            <input type="text" value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} placeholder="e.g., Tournament Winner, MVP Award" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-text-secondary border border-[#30363d] rounded-lg hover:bg-[#21262d] transition-all font-medium">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 btn-primary rounded-lg text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              {player ? "Update" : "Add"} Player
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Players() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const role = userData?.accountRole || "Player";
  const canManage = hasPermission(role, "canManagePlayers");

  useEffect(() => { loadPlayers(); }, []);

  async function loadPlayers() {
    try {
      const res = await api.get("/players");
      setPlayers(res.data);
    } catch (error) {
      console.error("Failed to load players:", error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = players.filter((p) => {
    const s = search.toLowerCase();
    const matchSearch = !s || p.fullName?.toLowerCase().includes(s) || p.inGameName?.toLowerCase().includes(s) || p.uid?.toString().includes(s);
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchRole = roleFilter === "All" || p.primaryRole === roleFilter || p.secondaryRole === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Players</h1>
          <p className="text-sm text-text-muted mt-1 font-medium">{filtered.length} players</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditingPlayer(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 btn-primary rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, IGN, or UID..."
            className="w-full pl-10 pr-4 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#21262d] rounded-lg text-sm text-text-secondary hover:text-text-primary border border-[#30363d] hover:border-[#484f58] transition-all"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-[#21262d] rounded-lg animate-fade-in border border-[#30363d]">
          <div>
            <label className="block text-[10px] text-text-muted mb-1 font-semibold uppercase tracking-wider">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 input-premium text-sm text-text-primary">
              <option value="All">All Statuses</option>
              {PLAYER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-1 font-semibold uppercase tracking-wider">Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-1.5 input-premium text-sm text-text-primary">
              <option value="All">All Roles</option>
              {GAME_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted font-medium">No players found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => {
                if (canManage) {
                  setEditingPlayer(player);
                  setModalOpen(true);
                } else {
                  navigate(`/players/${player.id}`);
                }
              }}
            />
          ))}
        </div>
      )}

      <PlayerModal
        player={editingPlayer}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingPlayer(null); }}
        onSave={() => { setModalOpen(false); setEditingPlayer(null); loadPlayers(); }}
      />
    </div>
  );
}
