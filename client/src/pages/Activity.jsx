import { useState, useEffect } from "react";
import api from "../services/api";
import { formatDateTime } from "../utils/constants";
import { Activity as ActivityIcon } from "lucide-react";

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("All");

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    try {
      const res = await api.get("/activity?limit=100");
      setLogs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const actionTypes = [...new Set(logs.map((l) => l.action))];
  const filtered = actionFilter === "All" ? logs : logs.filter((l) => l.action === actionFilter);

  const actionLabels = {
    create_player: "Added Player",
    update_player: "Updated Player",
    delete_player: "Deleted Player",
    create_user: "Created User",
    delete_user: "Deleted User",
    change_role: "Changed Role",
    change_player_role: "Changed Player Role",
    add_income: "Added Income",
    add_expense: "Added Expense",
    update_transaction: "Updated Transaction",
    delete_transaction: "Deleted Transaction",
    create_announcement: "Created Announcement",
    delete_announcement: "Deleted Announcement",
    update_team_settings: "Updated Team Settings",
    update_profile: "Updated Profile",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Activity Log</h1>
          <p className="text-sm text-text-muted mt-1 font-medium">Track all team operations</p>
        </div>
      </div>

      <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 input-premium text-sm text-text-primary w-auto">
        <option value="All">All Actions</option>
        {actionTypes.map((a) => <option key={a} value={a}>{actionLabels[a] || a}</option>)}
      </select>

      {loading ? (
        <div className="flex justify-center h-48"><div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><ActivityIcon className="w-12 h-12 text-text-muted/30 mx-auto mb-3" /><p className="text-text-muted font-medium">No activity recorded</p></div>
      ) : (
        <div className="card-premium rounded-xl divide-y divide-[#30363d]">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-[#21262d] transition-all duration-150">
              <div className="w-8 h-8 rounded-lg bg-[rgba(88,166,255,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[rgba(88,166,255,0.15)]">
                <ActivityIcon className="w-3.5 h-3.5 text-[#58a6ff]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">{log.description}</p>
                <p className="text-xs text-text-muted mt-1 font-medium">{formatDateTime(log.createdAt)}</p>
              </div>
              <span className="badge-premium text-text-muted bg-[#21262d] border border-[#30363d] flex-shrink-0">
                {actionLabels[log.action] || log.action}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
