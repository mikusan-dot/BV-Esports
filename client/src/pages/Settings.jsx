import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { TEAM_CONFIG } from "../config/team";
import { Save, Settings as SettingsIcon, Users, Shield, Plus, X } from "lucide-react";
import { ACCOUNT_ROLES, GAME_ROLES } from "../utils/constants";
import { getRoleColor, getStatusColor } from "../utils/permissions";

function CreateUserModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", accountRole: "Player", gameRole: "", inGameName: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/create-user", form);
      onSave();
      setForm({ name: "", email: "", password: "", accountRole: "Player", gameRole: "", inGameName: "" });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Create User</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Full Name" className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/50" />
          <input type="text" value={form.inGameName} onChange={(e) => setForm({ ...form, inGameName: e.target.value })} placeholder="In-Game Name (optional)" className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/50" />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="Email" className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/50" />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Password (min 6 chars)" className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/50" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.accountRole} onChange={(e) => setForm({ ...form, accountRole: e.target.value })} className="px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none">
              {ACCOUNT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={form.gameRole} onChange={(e) => setForm({ ...form, gameRole: e.target.value })} className="px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none">
              <option value="">Game Role</option>
              {GAME_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white font-medium rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" />Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleChangeModal({ user, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ accountRole: "", gameRole: "" });

  useEffect(() => {
    if (user) setForm({ accountRole: user.accountRole || "Player", gameRole: user.gameRole || "" });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/users/${user.id}/role`, form);
      onSave();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update role");
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-sm animate-fade-in">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Change Role</h3>
          <p className="text-sm text-text-muted mt-1">Update {user.name}'s permissions</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Account Role</label>
            <select value={form.accountRole} onChange={(e) => setForm({ ...form, accountRole: e.target.value })} className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none">
              {ACCOUNT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Game Role</label>
            <select value={form.gameRole} onChange={(e) => setForm({ ...form, gameRole: e.target.value })} className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none">
              <option value="">None</option>
              {GAME_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white font-medium rounded-lg">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Settings() {
  const { userData } = useAuth();
  const [teamSettings, setTeamSettings] = useState({ name: "", description: "", game: "", country: "", socialLinks: {} });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [teamRes, usersRes] = await Promise.all([api.get("/team"), api.get("/auth/users")]);
      setTeamSettings(teamRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveTeam = async () => {
    setSaving(true);
    try {
      await api.put("/team", teamSettings);
      alert("Team settings saved!");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage team and user settings</p>
      </div>

      {/* Team Settings */}
      <div className="card-gradient border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-primary" />Team Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">Team Name</label>
            <input type="text" value={teamSettings.name || ""} onChange={(e) => setTeamSettings({ ...teamSettings, name: e.target.value })} className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Game</label>
            <input type="text" value={teamSettings.game || ""} onChange={(e) => setTeamSettings({ ...teamSettings, game: e.target.value })} className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-text-muted mb-1">Description</label>
            <textarea value={teamSettings.description || ""} onChange={(e) => setTeamSettings({ ...teamSettings, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none resize-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Country</label>
            <input type="text" value={teamSettings.country || ""} onChange={(e) => setTeamSettings({ ...teamSettings, country: e.target.value })} className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50" />
          </div>
        </div>
        <button onClick={handleSaveTeam} disabled={saving} className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50">
          <Save className="w-4 h-4" />{saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* User Management */}
      <div className="card-gradient border border-border rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><Users className="w-4 h-4 text-primary" />User Management</h3>
          <button onClick={() => setCreateModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg">
            <Plus className="w-3.5 h-3.5" />Create User
          </button>
        </div>
        <div className="divide-y divide-border">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-bg-card-hover transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-xs font-bold text-primary">{user.name?.charAt(0) || "?"}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getRoleColor(user.accountRole)}`}>{user.accountRole}</span>
                {user.gameRole && <span className="text-[10px] font-medium px-2 py-0.5 rounded border text-primary bg-primary/10 border-primary/20">{user.gameRole}</span>}
                {user.id !== userData?.id && (
                  <button onClick={() => { setSelectedUser(user); setRoleModal(true); }} className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                    <Shield className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateUserModal isOpen={createModal} onClose={() => setCreateModal(false)} onSave={() => { setCreateModal(false); loadData(); }} />
      <RoleChangeModal user={selectedUser} isOpen={roleModal} onClose={() => { setRoleModal(false); setSelectedUser(null); }} onSave={() => { setRoleModal(false); setSelectedUser(null); loadData(); }} />
    </div>
  );
}
