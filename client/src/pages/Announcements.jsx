import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate, ANNOUNCEMENT_PRIORITIES } from "../utils/constants";
import { Megaphone, Plus, X, Save, AlertTriangle, Info, Bell } from "lucide-react";

function AnnouncementModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", message: "", priority: "Normal" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/announcements", form);
      onSave();
      setForm({ title: "", message: "", priority: "Normal" });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create announcement");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h3 className="text-lg font-bold text-text-primary">New Announcement</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#21262d] text-text-muted"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Message *</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary resize-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary">
              {ANNOUNCEMENT_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-text-secondary border border-[#30363d] rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 btn-primary rounded-lg text-sm flex items-center gap-2"><Save className="w-4 h-4" />Publish</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Announcements() {
  const { userData } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const role = userData?.accountRole || "Player";
  const canManage = role === "Owner" || role === "Admin" || role === "Manager";

  useEffect(() => { loadAnnouncements(); }, []);

  async function loadAnnouncements() {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      loadAnnouncements();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete");
    }
  }

  const priorityConfig = {
    Urgent: { bg: "bg-[rgba(248,81,73,0.1)]", text: "text-[#f85149]", border: "border-[rgba(248,81,73,0.15)]", icon: AlertTriangle },
    Important: { bg: "bg-[rgba(210,153,34,0.1)]", text: "text-[#d29922]", border: "border-[rgba(210,153,34,0.15)]", icon: Info },
    Normal: { bg: "bg-[#21262d]", text: "text-text-muted", border: "border-[#30363d]", icon: Bell },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Announcements</h1>
          <p className="text-sm text-text-muted mt-1 font-medium">Team updates and notifications</p>
        </div>
        {canManage && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 btn-primary rounded-lg text-sm">
            <Plus className="w-4 h-4" />New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center h-48"><div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" /></div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16"><Megaphone className="w-12 h-12 text-text-muted/30 mx-auto mb-3" /><p className="text-text-muted font-medium">No announcements yet</p></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const pc = priorityConfig[ann.priority] || priorityConfig.Normal;
            const Icon = pc.icon;
            return (
              <div key={ann.id} className={`card-premium rounded-xl p-5 animate-fade-in`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${pc.bg} flex items-center justify-center flex-shrink-0 border ${pc.border}`}>
                      <Icon className={`w-5 h-5 ${pc.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-text-primary">{ann.title}</h3>
                        <span className={`badge-premium ${pc.bg} ${pc.text} ${pc.border}`}>{ann.priority}</span>
                      </div>
                      <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap">{ann.message}</p>
                      <p className="text-xs text-text-muted mt-3 font-medium">{formatDate(ann.createdAt)} &middot; {ann.createdBy}</p>
                    </div>
                  </div>
                  {canManage && (
                    <button onClick={() => handleDelete(ann.id)} className="p-1.5 rounded-lg text-text-muted hover:text-[#f85149] hover:bg-[rgba(248,81,73,0.1)] transition-all flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnnouncementModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); loadAnnouncements(); }} />
    </div>
  );
}
