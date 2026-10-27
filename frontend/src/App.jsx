import React from 'react';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, Plus, Pencil, Trash2, Search, X, TrendingUp, ReceiptText, CalendarDays, CircleDollarSign, LoaderCircle, Utensils, CarFront, Receipt, ShoppingBag, HeartPulse, GraduationCap, Ellipsis } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Health", "Education", "Other"];
const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: CarFront,
  Bills: Receipt,
  Shopping: ShoppingBag,
  Health: HeartPulse,
  Education: GraduationCap,
  Other: Ellipsis
};
const EMPTY_FORM = { title: "", amount: "", category: "Food", date: new Date().toISOString().slice(0, 10) };

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2
}).format(Number(amount || 0));

const dateLabel = (value) => new Date(value).toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "numeric", timeZone: "UTC"
});

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const notify = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 3800);
  };

  const loadExpenses = useCallback(async () => {
    try {
      const response = await fetch(`${API}/expenses`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load expenses.");
      setExpenses(data);
    } catch (error) {
      notify("error", `${error.message} Check that the backend is running.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const total = useMemo(() => expenses.reduce((sum, item) => sum + Number(item.amount), 0), [expenses]);
  const filtered = useMemo(() => expenses.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesQuery && matchesCategory;
  }), [expenses, query, categoryFilter]);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return notify("error", "Enter an expense title.");
    if (form.title.trim().length < 2) return notify("error", "Title must have at least 2 characters.");
    if (!form.amount || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      return notify("error", "Amount must be greater than zero.");
    }
    if (!form.date) return notify("error", "Choose a date.");

    setSaving(true);
    try {
      const response = await fetch(`${API}/expenses${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, title: form.title.trim(), amount: Number(form.amount) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save expense.");
      notify("success", result.message || "Expense saved.");
      resetForm();
      await loadExpenses();
    } catch (error) {
      notify("error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      amount: String(item.amount),
      category: item.category,
      date: new Date(item.date).toISOString().slice(0, 10)
    });
    document.getElementById("expense-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteExpense = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This action cannot be undone.`)) return;
    try {
      const response = await fetch(`${API}/expenses/${item._id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not delete expense.");
      setExpenses((current) => current.filter((expense) => expense._id !== item._id));
      if (editingId === item._id) resetForm();
      notify("success", result.message || "Expense deleted.");
    } catch (error) {
      notify("error", error.message);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Pennywise home">
          <span className="brand-mark"><Wallet size={21} strokeWidth={2.4} /></span>
          <span>Pennywise<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-right"><span className="status-dot" /> Personal finance dashboard</div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">YOUR MONEY, IN FOCUS</p>
          <h1>Track every <span>little thing.</span></h1>
          <p className="subtitle">A clearer view of your spending starts here.</p>
        </div>
        <div className="intro-icon"><TrendingUp size={29} /></div>
      </section>


      <div className="content-grid">
        <section className="panel form-panel" id="expense-form">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingId ? "MAKE A CHANGE" : "KEEP IT UP TO DATE"}</p>
              <h2>{editingId ? "Edit expense" : "Add an expense"}</h2>
            </div>
            <span className="heading-icon">{editingId ? <Pencil size={18} /> : <Plus size={20} />}</span>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Expense title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Lunch with friends" maxLength={100} required />
            <div className="form-row">
              <div className="field">
                <label htmlFor="amount">Amount (₹)</label>
                <div className="amount-input"><span>₹</span><input id="amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" required /></div>
              </div>
              <div className="field">
                <label htmlFor="date">Date</label>
                <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />
              </div>
            </div>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? <LoaderCircle size={18} className="spin" /> : editingId ? <Pencil size={17} /> : <Plus size={18} />}
              {saving ? "Saving..." : editingId ? "Save changes" : "Add expense"}
            </button>
            {editingId && <button className="secondary-button" type="button" onClick={resetForm}><X size={16} /> Cancel editing</button>}
          </form>
          <p className="form-note"><span className="note-star">✳</span> Your expenses are saved to your database.</p>
        </section>

        <section className="panel list-panel">
          <div className="panel-heading list-heading">
            <div>
              <p className="eyebrow">YOUR TRANSACTIONS</p>
              <h2>Recent expenses <span className="count-pill">{expenses.length}</span></h2>
            </div>
          </div>
          <div className="filter-row">
            <div className="search-box"><Search size={17} aria-hidden="true" /><input aria-label="Search expenses by title" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search expenses..." /></div>
            <select aria-label="Filter by category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All categories</option>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="empty-state"><LoaderCircle className="spin" size={28} /><p>Loading your expenses...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><ReceiptText size={25} /></span>
              <h3>{expenses.length ? "No matching expenses" : "A fresh start"}</h3>
              <p>{expenses.length ? "Try a different search or category." : "Your expense list is empty. Add your first expense to get going."}</p>
            </div>
          ) : (
            <div className="expense-list">
              {filtered.map((item) => {
                const CategoryIcon = CATEGORY_ICONS[item.category] || ReceiptText;
                return (
                <article className="expense-item" key={item._id}>
                  <div className={`category-icon category-${item.category.toLowerCase()}`} aria-hidden="true"><CategoryIcon size={19} /></div>
                  <div className="expense-main">
                    <h3>{item.title}</h3>
                    <div className="expense-meta"><span>{item.category}</span><i /> <span>{dateLabel(item.date)}</span></div>
                  </div>
                  <div className="expense-trailing">
                    <strong>{money(item.amount)}</strong>
                    <div className="item-actions">
                      <button className="icon-button edit-button" type="button" onClick={() => startEdit(item)} aria-label={`Edit ${item.title}`} title="Edit"><Pencil size={15} /></button>
                      <button className="icon-button delete-button" type="button" onClick={() => deleteExpense(item)} aria-label={`Delete ${item.title}`} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          )}
          <div className="list-footer"><span><span className="footer-dot" /> Synced with your database</span><span>{filtered.length} shown</span></div>
        </section>
      </div>
      <section className="summary-grid" aria-label="Expense summary">
        <article className="summary-card total-card">
          <div className="summary-icon purple"><CircleDollarSign size={22} /></div>
          <p className="summary-label">Total amount spent</p>
          <h2>{money(total)}</h2>
          <p className="summary-foot">Across {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}</p>
        </article>
        <article className="summary-card">
          <div className="summary-icon peach"><ReceiptText size={21} /></div>
          <p className="summary-label">Recorded expenses</p>
          <h2>{expenses.length}</h2>
          <p className="summary-foot">Everything you've logged</p>
        </article>
        <article className="summary-card">
          <div className="summary-icon mint"><CalendarDays size={21} /></div>
          <p className="summary-label">This month</p>
          <h2>{money(expenses.filter((item) => {
            const date = new Date(item.date);
            const now = new Date();
            return date.getUTCMonth() === now.getMonth() && date.getUTCFullYear() === now.getFullYear();
          }).reduce((sum, item) => sum + Number(item.amount), 0))}</h2>
          <p className="summary-foot">Spending this calendar month</p>
        </article>
      </section>


      <footer className="footer"><span>Made for mindful spending.</span><span>Pennywise <span className="brand-dot">●</span></span></footer>

      {notice && <div className={`toast ${notice.type}`} role="status"><span className="toast-mark">{notice.type === "success" ? "✓" : "!"}</span>{notice.message}<button onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={15} /></button></div>}
    </main>
  );
}

export default App;
