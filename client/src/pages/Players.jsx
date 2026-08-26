import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";
import { getStatusColor, getRoleColor } from "../utils/permissions";
import { GAME_ROLES, PLAYER_STATUSES } from "../utils/constants";
import {
  Search,
  Plus,
  Filter,
  User,
  X,
  Save,
  Trash2,
  Edit3,
  MoreVertical,
  Users,
} from "lucide-react";

function PlayerCard({ player, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card-gradient border border-border rounded-xl p-4 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 overflow-hidden">
          {player.photoURL ? (
            <img src={player.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
            {player.inGameName}
          </h3>
          <p className="text-xs text-text-muted truncate">{player.fullName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {player.primaryRole && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border text-primary bg-primary/10 border-primary/20">
              {player.primaryRole}
            </span>
          )}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getStatusColor(player.status)}`}>
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
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">{player ? "Edit Player" : "Add Player"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">In-Game Name *</label>
              <input
                type="text"
                value={form.inGameName}
                onChange={(e) => setForm({ ...form, inGameName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Free Fire UID</label>
              <input
                type="text"
                value={form.uid}
                onChange={(e) => setForm({ ...form, uid: e.target.value })}
                className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Device</label>
              <input
                type="text"
                value={form.device}
                onChange={(e) => setForm({ ...form, device: e.target.value })}
                placeholder="e.g., iPhone 15 Pro"
                className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Primary Role</label>
              <select
                value={form.primaryRole}
                onChange={(e) => setForm({ ...form, primaryRole: e.target.value })}
                className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
              >
                <option value="">Select role</option>
                {GAME_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
              >
                {PLAYER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Achievements (comma-separated)</label>
            <input
              type="text"
              value={form.achievements}
              onChange={(e) => setForm({ ...form, achievements: e.target.value })}
              placeholder="e.g., Tournament Winner, MVP Award"
              className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
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

  useEffect(() => {
    loadPlayers();
  }, []);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Players</h1>
          <p className="text-sm text-text-muted mt-1">{filtered.length} players</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditingPlayer(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, IGN, or UID..."
            className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-bg-card border border-border rounded-lg animate-fade-in">
          <div>
            <label className="block text-xs text-text-muted mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none"
            >
              <option value="All">All Statuses</option>
              {PLAYER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none"
            >
              <option value="All">All Roles</option>
              {GAME_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No players found</p>
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
