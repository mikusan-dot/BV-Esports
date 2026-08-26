import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";
import { formatCurrency, formatDate, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../utils/constants";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Save,
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

const COLORS = ["#58a6ff", "#3fb950", "#f85149", "#d29922", "#a371f7", "#39d2c0"];

function TransactionModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
  });

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return alert("Amount must be positive");
    try {
      await api.post("/transactions", { ...form, amount: Number(form.amount) });
      onSave();
      setForm({ type: "income", amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0], reference: "" });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create transaction");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h3 className="text-lg font-bold text-text-primary">Add Transaction</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#21262d] text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Type</label>
            <div className="flex gap-2">
              {[
                { type: "income", icon: ArrowUpRight, label: "Income" },
                { type: "expense", icon: ArrowDownRight, label: "Expense" },
              ].map(({ type, icon: Icon, label }) => (
                <button key={type} type="button" onClick={() => setForm({ ...form, type, category: "" })} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                  form.type === type
                    ? type === "income" ? "bg-[rgba(63,185,80,0.1)] text-[#3fb950] border-[rgba(63,185,80,0.2)]" : "bg-[rgba(248,81,73,0.1)] text-[#f85149] border-[rgba(248,81,73,0.2)]"
                    : "bg-[#21262d] text-text-muted border-[#30363d] hover:border-[#484f58]"
                }`}>
                  <Icon className="w-4 h-4 inline mr-1" />{label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Amount (৳)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0.01" step="0.01" placeholder="0.00" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional description..." className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted resize-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Reference / Note</label>
            <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Optional reference" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
          </div>
          <div className="flex justify-end gap-2.5 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-text-secondary border border-[#30363d] rounded-lg hover:bg-[#21262d] transition-all font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 btn-primary rounded-lg text-sm flex items-center gap-2"><Save className="w-4 h-4" />Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Finance() {
  const { userData } = useAuth();
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const role = userData?.accountRole || "Player";
  const canManage = hasPermission(role, "canManageFinance");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [summaryRes, txRes, statsRes] = await Promise.all([
        api.get("/transactions/summary"),
        api.get("/transactions"),
        api.get("/stats"),
      ]);
      setSummary(summaryRes.data);
      setTransactions(txRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load finance data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);
  const monthlyData = stats?.monthlyData
    ? Object.entries(stats.monthlyData).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([month, data]) => ({ name: month, Income: data.income, Expenses: data.expenses }))
    : [];
  const categoryData = transactions.reduce((acc, tx) => {
    const existing = acc.find((a) => a.name === tx.category);
    if (existing) existing.value += Number(tx.amount);
    else acc.push({ name: tx.category, value: Number(tx.amount) });
    return acc;
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Finance</h1>
          <p className="text-sm text-text-muted mt-1 font-medium">Team financial overview</p>
        </div>
        {canManage && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 btn-primary rounded-lg text-sm">
            <Plus className="w-4 h-4" />Add Transaction
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Income", value: formatCurrency(summary.totalIncome), icon: TrendingUp, color: "text-[#3fb950]", iconBg: "bg-[rgba(63,185,80,0.1)]" },
          { label: "Total Expenses", value: formatCurrency(summary.totalExpenses), icon: TrendingDown, color: "text-[#f85149]", iconBg: "bg-[rgba(248,81,73,0.1)]" },
          { label: "Balance", value: formatCurrency(summary.balance), icon: Wallet, color: summary.balance >= 0 ? "text-[#58a6ff]" : "text-[#f85149]", iconBg: "bg-[rgba(88,166,255,0.1)]" },
        ].map((card) => (
          <div key={card.label} className="card-premium rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-lg ${card.iconBg} flex items-center justify-center border border-[#30363d]`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{card.label}</p>
                <p className={`text-xl font-extrabold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card-premium rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="name" tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px", color: "#e6edf3" }} />
                <Bar dataKey="Income" fill="#3fb950" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f85149" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {categoryData.length > 0 && (
            <div className="card-premium rounded-xl p-5">
              <h3 className="text-sm font-bold text-text-primary mb-4">By Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                    {categoryData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px", color: "#e6edf3" }} formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Transactions List */}
      <div className="card-premium rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h3 className="text-sm font-bold text-text-primary">Transactions</h3>
          <div className="flex gap-1 bg-[#21262d] rounded-lg p-0.5 border border-[#30363d]">
            {["all", "income", "expense"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
                filter === f ? "bg-[#58a6ff] text-[#0d1117]" : "text-text-muted hover:text-text-primary"
              }`}>
                {f === "all" ? "All" : f === "income" ? "Income" : "Expenses"}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-[#30363d]">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8 font-medium">No transactions found</p>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-[#21262d] transition-all duration-150">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-[rgba(63,185,80,0.1)] border border-[rgba(63,185,80,0.15)]" : "bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.15)]"}`}>
                    {tx.type === "income" ? <ArrowUpRight className="w-5 h-5 text-[#3fb950]" /> : <ArrowDownRight className="w-5 h-5 text-[#f85149]" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{tx.category}</p>
                    <p className="text-xs text-text-muted">{tx.description || "No description"} &middot; {formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === "income" ? "text-[#3fb950]" : "text-[#f85149]"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[10px] text-text-muted font-medium">by {tx.createdBy}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); loadData(); }} />
    </div>
  );
}
