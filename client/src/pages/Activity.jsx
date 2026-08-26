import { useState, useEffect } from "react";
import api from "../services/api";
import { formatDateTime } from "../utils/constants";
import { Activity as ActivityIcon, Filter } from "lucide-react";

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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activity Log</h1>
          <p className="text-sm text-text-muted mt-1">Track all team operations</p>
        </div>
      </div>

      <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary outline-none w-auto">
        <option value="All">All Actions</option>
        {actionTypes.map((a) => <option key={a} value={a}>{actionLabels[a] || a}</option>)}
      </select>

      {loading ? (
        <div className="flex justify-center h-48"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><ActivityIcon className="w-12 h-12 text-text-muted mx-auto mb-3" /><p className="text-text-muted">No activity recorded</p></div>
      ) : (
        <div className="card-gradient border border-border rounded-xl divide-y divide-border">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20">
                <ActivityIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">{log.description}</p>
                <p className="text-xs text-text-muted mt-1">{formatDateTime(log.createdAt)}</p>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-bg-dark border-border text-text-muted flex-shrink-0">
                {actionLabels[log.action] || log.action}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
