import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";
import { formatCurrency, formatDate, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../utils/constants";
import { ArrowUpRight, ArrowDownRight, Receipt, Plus, X, Save } from "lucide-react";

function TransactionModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ type: "income", amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0], reference: "" });
  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#21262d] text-text-muted"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, type: "income", category: "" })} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${form.type === "income" ? "bg-[rgba(63,185,80,0.1)] text-[#3fb950] border-[rgba(63,185,80,0.2)]" : "bg-[#21262d] text-text-muted border-[#30363d]"}`}>
              <ArrowUpRight className="w-4 h-4 inline mr-1" />Income
            </button>
            <button type="button" onClick={() => setForm({ ...form, type: "expense", category: "" })} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${form.type === "expense" ? "bg-[rgba(248,81,73,0.1)] text-[#f85149] border-[rgba(248,81,73,0.2)]" : "bg-[#21262d] text-text-muted border-[#30363d]"}`}>
              <ArrowDownRight className="w-4 h-4 inline mr-1" />Expense
            </button>
          </div>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0.01" step="0.01" placeholder="Amount (৳)" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description (optional)" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted resize-none" />
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-text-secondary border border-[#30363d] rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 btn-primary rounded-lg text-sm flex items-center gap-2"><Save className="w-4 h-4" />Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Transactions() {
  const { userData } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const role = userData?.accountRole || "Player";
  const canManage = hasPermission(role, "canManageFinance");

  useEffect(() => { loadTransactions(); }, []);

  async function loadTransactions() {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const allCats = [...new Set(transactions.map((t) => t.category))];
  const filtered = transactions.filter((t) => {
    const matchType = filter === "all" || t.type === filter;
    const matchCat = catFilter === "All" || t.category === catFilter;
    return matchType && matchCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Transactions</h1>
          <p className="text-sm text-text-muted mt-1 font-medium">{filtered.length} transactions</p>
        </div>
        {canManage && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 btn-primary rounded-lg text-sm">
            <Plus className="w-4 h-4" />Add Transaction
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-[#21262d] rounded-lg p-0.5 border border-[#30363d]">
          {["all", "income", "expense"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filter === f ? "bg-[#58a6ff] text-[#0d1117]" : "text-text-muted hover:text-text-primary"}`}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
            </button>
          ))}
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-3 py-1 input-premium text-xs text-text-primary">
          <option value="All">All Categories</option>
          {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center h-48"><div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Receipt className="w-12 h-12 text-text-muted/30 mx-auto mb-3" /><p className="text-text-muted font-medium">No transactions found</p></div>
      ) : (
        <div className="card-premium rounded-xl divide-y divide-[#30363d]">
          {filtered.map((tx) => (
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
          ))}
        </div>
      )}

      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); loadTransactions(); }} />
    </div>
  );
}
