import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";
import { formatCurrency, formatDate, formatDateTime } from "../utils/constants";
import {
  Users,
  UserCheck,
  Shield,
  UserCog,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Megaphone,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Swords,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4"];

function StatCard({ icon: Icon, label, value, color = "primary", link }) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const content = (
    <div className={`card-gradient border border-border rounded-xl p-4 hover:border-border-light transition-all duration-200 ${link ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center border`}>
          <Icon className="w-5 h-5" />
        </div>
        {link && <ArrowUpRight className="w-4 h-4 text-text-muted" />}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

export default function Dashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = userData?.accountRole || "Player";

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsRes, txRes, annRes] = await Promise.all([
        api.get("/stats"),
        api.get("/transactions?limit=10"),
        api.get("/announcements"),
      ]);
      setStats(statsRes.data);
      setTransactions(txRes.data.slice(0, 5));
      setAnnouncements(annRes.data.slice(0, 3));

      if (hasPermission(role, "canViewActivity")) {
        const actRes = await api.get("/activity?limit=10");
        setActivityLogs(actRes.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const monthlyChartData = stats?.monthlyData
    ? Object.entries(stats.monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({
          name: month,
          Income: data.income,
          Expenses: data.expenses,
        }))
    : [];

  const pieData = stats
    ? [
        { name: "Income", value: stats.totalIncome || 0 },
        { name: "Expenses", value: stats.totalExpenses || 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          Welcome back, {userData?.name || "Player"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Players" value={stats?.totalPlayers || 0} color="primary" link="/players" />
        <StatCard icon={UserCheck} label="Active Players" value={stats?.activePlayers || 0} color="success" />
        {hasPermission(role, "canViewFinance") && (
          <>
            <StatCard icon={TrendingUp} label="Total Income" value={formatCurrency(stats?.totalIncome)} color="success" link="/finance" />
            <StatCard icon={Wallet} label="Current Balance" value={formatCurrency(stats?.balance)} color="accent" link="/finance" />
          </>
        )}
        {!hasPermission(role, "canViewFinance") && (
          <>
            <StatCard icon={Swords} label="Substitutes" value={stats?.substitutes || 0} color="primary" />
            <StatCard icon={Megaphone} label="Announcements" value={announcements.length} color="accent" link="/announcements" />
          </>
        )}
      </div>

      {/* Finance Charts - only for finance-access roles */}
      {hasPermission(role, "canViewFinance") && monthlyChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card-gradient border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 12 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111118", border: "1px solid #1e1e2e", borderRadius: "8px", color: "#e4e4e7" }}
                />
                <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-gradient border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Balance Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#111118", border: "1px solid #1e1e2e", borderRadius: "8px", color: "#e4e4e7" }}
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-text-muted">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-text-muted">Expenses</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        {hasPermission(role, "canViewFinance") && (
          <div className="card-gradient border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Recent Transactions</h3>
              <Link to="/transactions" className="text-xs text-primary hover:text-primary-light transition-colors">
                View All
              </Link>
            </div>
            {transactions.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-card-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}>
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{tx.category}</p>
                        <p className="text-xs text-text-muted">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Announcements */}
        <div className="card-gradient border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Announcements</h3>
            <Link to="/announcements" className="text-xs text-primary hover:text-primary-light transition-colors">
              View All
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No announcements</p>
          ) : (
            <div className="space-y-2">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 rounded-lg border border-border hover:border-border-light transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-text-primary">{ann.title}</h4>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                      ann.priority === "Urgent"
                        ? "text-red-400 bg-red-400/10 border-red-400/20"
                        : ann.priority === "Important"
                        ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                        : "text-text-muted bg-bg-dark border-border"
                    }`}>
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{ann.message}</p>
                  <p className="text-[10px] text-text-muted mt-2">{formatDate(ann.createdAt)} - {ann.createdBy}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log - only for admin+ */}
        {hasPermission(role, "canViewActivity") && (
          <div className="card-gradient border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
              <Link to="/activity" className="text-xs text-primary hover:text-primary-light transition-colors">
                View All
              </Link>
            </div>
            {activityLogs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary line-clamp-1">{log.description}</p>
                      <p className="text-[10px] text-text-muted">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team Info for Players */}
        {!hasPermission(role, "canViewFinance") && !hasPermission(role, "canViewActivity") && (
          <div className="card-gradient border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Team Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-bg-dark border border-border">
                <p className="text-2xl font-bold text-primary">{stats?.totalPlayers || 0}</p>
                <p className="text-xs text-text-muted mt-1">Team Members</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-bg-dark border border-border">
                <p className="text-2xl font-bold text-green-400">{stats?.activePlayers || 0}</p>
                <p className="text-xs text-text-muted mt-1">Active Players</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-bg-dark border border-border">
                <p className="text-2xl font-bold text-yellow-400">{stats?.managers || 0}</p>
                <p className="text-xs text-text-muted mt-1">Managers</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-bg-dark border border-border">
                <p className="text-2xl font-bold text-purple-400">{stats?.admins || 0}</p>
                <p className="text-xs text-text-muted mt-1">Admins</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
