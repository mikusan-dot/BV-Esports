import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";
import { formatCurrency, formatDate, formatDateTime } from "../utils/constants";
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Megaphone,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Swords,
  ArrowRight,
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

const CHART_COLORS = ["#58a6ff", "#3fb950", "#f85149", "#d29922", "#a371f7", "#39d2c0"];

function StatCard({ icon: Icon, label, value, color = "primary", link }) {
  const colorMap = {
    primary: {
      iconBg: "bg-[rgba(88,166,255,0.1)]",
      iconText: "text-[#58a6ff]",
      border: "border-[rgba(88,166,255,0.15)]",
    },
    success: {
      iconBg: "bg-[rgba(63,185,80,0.1)]",
      iconText: "text-[#3fb950]",
      border: "border-[rgba(63,185,80,0.15)]",
    },
    danger: {
      iconBg: "bg-[rgba(248,81,73,0.1)]",
      iconText: "text-[#f85149]",
      border: "border-[rgba(248,81,73,0.15)]",
    },
  };

  const c = colorMap[color] || colorMap.primary;

  const content = (
    <div className="card-premium rounded-xl p-5 group cursor-pointer relative overflow-hidden">
      <div className={`w-11 h-11 rounded-lg ${c.iconBg} flex items-center justify-center border ${c.border} mb-4`}>
        <Icon className={`w-5 h-5 ${c.iconText}`} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-text-primary tracking-tight">{value}</p>
        <p className="text-xs text-text-muted mt-1 font-medium">{label}</p>
      </div>
      {link && (
        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4 text-text-muted" />
        </div>
      )}
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
        <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1 font-medium">
            Welcome back, <span className="text-[#58a6ff]">{userData?.name || "Player"}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-text-muted font-semibold uppercase tracking-widest">
          BV Esports
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Players" value={stats?.totalPlayers || 0} color="primary" link="/players" />
        <StatCard icon={UserCheck} label="Active Players" value={stats?.activePlayers || 0} color="success" />
        {hasPermission(role, "canViewFinance") && (
          <>
            <StatCard icon={TrendingUp} label="Total Income" value={formatCurrency(stats?.totalIncome)} color="success" link="/finance" />
            <StatCard icon={Wallet} label="Current Balance" value={formatCurrency(stats?.balance)} color="primary" link="/finance" />
          </>
        )}
        {!hasPermission(role, "canViewFinance") && (
          <>
            <StatCard icon={Swords} label="Substitutes" value={stats?.substitutes || 0} color="primary" />
            <StatCard icon={Megaphone} label="Announcements" value={announcements.length} color="primary" link="/announcements" />
          </>
        )}
      </div>

      {/* Finance Charts */}
      {hasPermission(role, "canViewFinance") && monthlyChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card-premium rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="name" tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px", color: "#e6edf3" }}
                />
                <Bar dataKey="Income" fill="#3fb950" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f85149" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-premium rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4">Balance Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px", color: "#e6edf3" }}
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
                <span className="text-xs text-text-muted font-medium">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
                <span className="text-xs text-text-muted font-medium">Expenses</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        {hasPermission(role, "canViewFinance") && (
          <div className="card-premium rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">Recent Transactions</h3>
              <Link to="/transactions" className="text-xs text-[#58a6ff] hover:text-[#79c0ff] transition-colors font-semibold flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {transactions.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-1.5">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#21262d] transition-all duration-150">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        tx.type === "income" ? "bg-[rgba(63,185,80,0.1)] border border-[rgba(63,185,80,0.15)]" : "bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.15)]"
                      }`}>
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-4 h-4 text-[#3fb950]" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-[#f85149]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{tx.category}</p>
                        <p className="text-xs text-text-muted">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === "income" ? "text-[#3fb950]" : "text-[#f85149]"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Announcements */}
        <div className="card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary">Announcements</h3>
            <Link to="/announcements" className="text-xs text-[#58a6ff] hover:text-[#79c0ff] transition-colors font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No announcements</p>
          ) : (
            <div className="space-y-2">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-lg border border-[#30363d] hover:border-[#484f58] transition-all duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-text-primary">{ann.title}</h4>
                    <span className={`badge-premium shrink-0 ${
                      ann.priority === "Urgent"
                        ? "text-[#f85149] bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.2)]"
                        : ann.priority === "Important"
                        ? "text-[#d29922] bg-[rgba(210,153,34,0.1)] border border-[rgba(210,153,34,0.2)]"
                        : "text-text-muted bg-[#21262d] border border-[#30363d]"
                    }`}>
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{ann.message}</p>
                  <p className="text-[10px] text-text-muted mt-2 font-medium">{formatDate(ann.createdAt)} - {ann.createdBy}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        {hasPermission(role, "canViewActivity") && (
          <div className="card-premium rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">Recent Activity</h3>
              <Link to="/activity" className="text-xs text-[#58a6ff] hover:text-[#79c0ff] transition-colors font-semibold flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {activityLogs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-1.5">
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(88,166,255,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[rgba(88,166,255,0.15)]">
                      <Activity className="w-3.5 h-3.5 text-[#58a6ff]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary line-clamp-1">{log.description}</p>
                      <p className="text-[10px] text-text-muted font-medium">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team Info for Players */}
        {!hasPermission(role, "canViewFinance") && !hasPermission(role, "canViewActivity") && (
          <div className="card-premium rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4">Team Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Team Members", value: stats?.totalPlayers || 0, color: "text-[#58a6ff]" },
                { label: "Active Players", value: stats?.activePlayers || 0, color: "text-[#3fb950]" },
                { label: "Managers", value: stats?.managers || 0, color: "text-[#d29922]" },
                { label: "Admins", value: stats?.admins || 0, color: "text-[#a371f7]" },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-lg bg-[#21262d] border border-[#30363d]">
                  <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-text-muted mt-1 font-semibold uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
