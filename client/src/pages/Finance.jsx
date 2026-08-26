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
  DollarSign,
  Filter,
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

const COLORS = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4"];

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
    if (!form.amount || Number(form.amount) <= 0) {
      return alert("Amount must be positive");
    }
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
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Add Transaction</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "income", category: "" })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.type === "income"
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-bg-dark text-text-muted border-border hover:border-border-light"
                }`}
              >
                <ArrowUpRight className="w-4 h-4 inline mr-1" />
                Income
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "expense", category: "" })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.type === "expense"
                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                    : "bg-bg-dark text-text-muted border-border hover:border-border-light"
                }`}
              >
                <ArrowDownRight className="w-4 h-4 inline mr-1" />
                Expense
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Amount (৳)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50 resize-none"
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Reference / Note</label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className="w-full px-3 py-2 bg-bg-dark border border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary/50"
              placeholder="Optional reference"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-bg-card-hover transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Add Transaction
            </button>
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
    ? Object.entries(stats.monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({ name: month, Income: data.income, Expenses: data.expenses }))
    : [];

  const categoryData = transactions.reduce((acc, tx) => {
    const existing = acc.find((a) => a.name === tx.category);
    if (existing) existing.value += Number(tx.amount);
    else acc.push({ name: tx.category, value: Number(tx.amount) });
    return acc;
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Finance</h1>
          <p className="text-sm text-text-muted mt-1">Team financial overview</p>
        </div>
        {canManage && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-gradient border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Income</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(summary.totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="card-gradient border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Expenses</p>
              <p className="text-xl font-bold text-red-400">{formatCurrency(summary.totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="card-gradient border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Balance</p>
              <p className={`text-xl font-bold ${summary.balance >= 0 ? "text-accent" : "text-red-400"}`}>{formatCurrency(summary.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card-gradient border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 12 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #1e1e2e", borderRadius: "8px", color: "#e4e4e7" }} />
                <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {categoryData.length > 0 && (
            <div className="card-gradient border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4">By Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#111118", border: "1px solid #1e1e2e", borderRadius: "8px", color: "#e4e4e7" }} formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="card-gradient border border-border rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Transactions</h3>
          <div className="flex gap-1 bg-bg-dark rounded-lg p-0.5">
            {["all", "income", "expense"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === f ? "bg-primary text-white" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {f === "all" ? "All" : f === "income" ? "Income" : "Expenses"}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No transactions found</p>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-bg-card-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    {tx.type === "income" ? <ArrowUpRight className="w-5 h-5 text-green-400" /> : <ArrowDownRight className="w-5 h-5 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{tx.category}</p>
                    <p className="text-xs text-text-muted">{tx.description || "No description"} &middot; {formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[10px] text-text-muted">by {tx.createdBy}</p>
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
