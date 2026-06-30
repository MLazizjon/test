import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Trash2, Filter,
  Download, Calendar, Users, ArrowUpRight, ArrowDownRight, PieChart,
  CreditCard, Receipt, BarChart3, ChevronDown, ChevronRight, Search, FileText, Eye
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Payment {
  id: string; studentId: string; groupId: string; amount: number; date: string;
  type: 'kirim' | 'chiqim'; category: string; description: string; method: 'naqd' | 'karta' | 'online';
}

interface Expense {
  id: string; amount: number; date: string; category: string; description: string; method: 'naqd' | 'karta' | 'online';
}

function loadLS<T>(key: string, def: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function saveLS(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }

const expenseCategories = ["Ish haqi", "Arenda", "Kommunal", "Jihozlar", "Marketing", "Transport", "Boshqa"];
const paymentMethods = [
  { value: 'naqd' as const, label: 'Naqd pul' },
  { value: 'karta' as const, label: 'Plastik karta' },
  { value: 'online' as const, label: 'Online' },
];

const Finance = () => {
  const { students, groups, teachers, getCurrencySymbol, settings } = useData();
  const currency = getCurrencySymbol();

  const [payments, setPayments] = useState<Payment[]>(() => loadLS('edu_payments', generateInitialPayments()));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadLS('edu_expenses', generateInitialExpenses()));

  const [activeTab, setActiveTab] = useState<'umumiy' | 'kirimlar' | 'chiqimlar' | 'qarzdorlar' | 'hisobot'>('umumiy');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [searchQuery, setSearchQuery] = useState('');

  // New payment/expense forms
  const [newPayment, setNewPayment] = useState({
    studentId: '', groupId: '', amount: '', description: '', method: 'naqd' as const, category: "To'lov"
  });
  const [newExpense, setNewExpense] = useState({
    amount: '', category: 'Ish haqi', description: '', method: 'naqd' as const
  });

  const savePayments = (next: Payment[]) => { setPayments(next); saveLS('edu_payments', next); };
  const saveExpenses = (next: Expense[]) => { setExpenses(next); saveLS('edu_expenses', next); };

  // Filtered data
  const monthStart = startOfMonth(parseISO(filterMonth + '-01'));
  const monthEnd = endOfMonth(monthStart);
  const monthPayments = payments.filter(p => {
    try { return isWithinInterval(parseISO(p.date), { start: monthStart, end: monthEnd }); } catch { return false; }
  });
  const monthExpenses = expenses.filter(e => {
    try { return isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }); } catch { return false; }
  });

  // Stats
  const totalIncome = monthPayments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpense;
  const debtors = students.filter(s => s.balance < 0 && s.status === 'faol');
  const totalDebt = debtors.reduce((s, d) => s + Math.abs(d.balance), 0);

  // CRUD
  const addPayment = () => {
    if (!newPayment.studentId || !newPayment.amount) return;
    const p: Payment = {
      id: `pay_${Date.now()}`, studentId: newPayment.studentId, groupId: newPayment.groupId || students.find(s => s.id === newPayment.studentId)?.groupId || '',
      amount: Number(newPayment.amount), date: format(new Date(), 'yyyy-MM-dd'), type: 'kirim',
      category: newPayment.category, description: newPayment.description, method: newPayment.method,
    };
    savePayments([...payments, p]);
    setNewPayment({ studentId: '', groupId: '', amount: '', description: '', method: 'naqd', category: "To'lov" });
    setShowAddPayment(false);
  };

  const addExpense = () => {
    if (!newExpense.amount) return;
    const e: Expense = {
      id: `exp_${Date.now()}`, amount: Number(newExpense.amount), date: format(new Date(), 'yyyy-MM-dd'),
      category: newExpense.category, description: newExpense.description, method: newExpense.method,
    };
    saveExpenses([...expenses, e]);
    setNewExpense({ amount: '', category: 'Ish haqi', description: '', method: 'naqd' });
    setShowAddExpense(false);
  };

  const deletePayment = (id: string) => savePayments(payments.filter(p => p.id !== id));
  const deleteExpense = (id: string) => saveExpenses(expenses.filter(e => e.id !== id));

  // Format
  const fmt = (n: number) => {
    if (settings.currency === 'UZS') return n.toLocaleString('uz-UZ') + " " + currency;
    return currency + n.toLocaleString();
  };

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthExpenses]);

  // Income by group
  const incomeByGroup = useMemo(() => {
    const map: Record<string, number> = {};
    monthPayments.forEach(p => {
      const g = groups.find(g => g.id === p.groupId);
      const name = g?.name || 'Boshqa';
      map[name] = (map[name] || 0) + p.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthPayments, groups]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const ms = startOfMonth(d);
      const me = endOfMonth(d);
      const income = payments.filter(p => { try { return isWithinInterval(parseISO(p.date), { start: ms, end: me }); } catch { return false; } }).reduce((s, p) => s + p.amount, 0);
      const expense = expenses.filter(e => { try { return isWithinInterval(parseISO(e.date), { start: ms, end: me }); } catch { return false; } }).reduce((s, e) => s + e.amount, 0);
      months.push({ month: format(d, 'MMM'), income, expense });
    }
    return months;
  }, [payments, expenses]);

  const maxTrend = Math.max(...monthlyTrend.map(m => Math.max(m.income, m.expense)), 1);

  const tabs = [
    { key: 'umumiy' as const, label: 'Umumiy', icon: PieChart },
    { key: 'kirimlar' as const, label: 'Kirimlar', icon: ArrowUpRight },
    { key: 'chiqimlar' as const, label: 'Chiqimlar', icon: ArrowDownRight },
    { key: 'qarzdorlar' as const, label: 'Qarzdorlar', icon: Users },
    { key: 'hisobot' as const, label: 'Hisobot', icon: BarChart3 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Wallet className="h-6 w-6 text-primary" /> Moliya</h1>
          <p className="text-sm text-muted-foreground mt-1">Kirimlar, chiqimlar va moliyaviy hisobotlar</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Jami kirim', value: fmt(totalIncome), icon: TrendingUp, color: 'text-success bg-success/10', change: '+12%' },
          { label: 'Jami chiqim', value: fmt(totalExpense), icon: TrendingDown, color: 'text-destructive bg-destructive/10', change: '-5%' },
          { label: 'Foyda', value: fmt(profit), icon: DollarSign, color: profit >= 0 ? 'text-primary bg-primary/10' : 'text-destructive bg-destructive/10', change: profit >= 0 ? '+' : '' },
          { label: 'Qarzdorlik', value: fmt(totalDebt), icon: CreditCard, color: 'text-warning bg-warning/10', change: `${debtors.length} ta` },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <span className="text-xs font-medium text-muted-foreground">{s.change}</span>
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold text-foreground mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ===== UMUMIY ===== */}
        {activeTab === 'umumiy' && (
          <motion.div key="umumiy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly trend chart */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Oylik trend (6 oy)</h3>
                <div className="flex items-end gap-3 h-40">
                  {monthlyTrend.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex gap-1 items-end w-full justify-center" style={{ height: '120px' }}>
                        <div className="w-3 bg-success/80 rounded-t transition-all" style={{ height: `${(m.income / maxTrend) * 100}%` }} title={`Kirim: ${fmt(m.income)}`} />
                        <div className="w-3 bg-destructive/60 rounded-t transition-all" style={{ height: `${(m.expense / maxTrend) * 100}%` }} title={`Chiqim: ${fmt(m.expense)}`} />
                      </div>
                      <span className="text-xs text-muted-foreground">{m.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success/80" /> Kirim</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive/60" /> Chiqim</span>
                </div>
              </div>

              {/* Expense by category */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Chiqimlar taqsimoti</h3>
                {expenseByCategory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Ma'lumot yo'q</p>
                ) : (
                  <div className="space-y-3">
                    {expenseByCategory.map(([cat, amount], i) => {
                      const pct = totalExpense ? Math.round(amount / totalExpense * 100) : 0;
                      const colors = ['bg-destructive', 'bg-warning', 'bg-primary', 'bg-accent', 'bg-success', 'bg-destructive', 'bg-primary'];
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-foreground">{cat}</span>
                            <span className="text-muted-foreground">{fmt(amount)} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${colors[i % colors.length]} transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Income by group */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> Guruhlar bo'yicha kirim</h3>
                {incomeByGroup.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Ma'lumot yo'q</p>
                ) : (
                  <div className="space-y-2">
                    {incomeByGroup.map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-medium text-foreground">{name}</span>
                        <span className="text-sm font-bold text-success">{fmt(amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent transactions */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> So'nggi operatsiyalar</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...monthPayments.map(p => ({ ...p, type: 'kirim' as const, key: p.id })), ...monthExpenses.map(e => ({ ...e, type: 'chiqim' as const, key: e.id, studentId: '', groupId: '' }))]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 10)
                    .map(tx => {
                      const student = students.find(s => s.id === tx.studentId);
                      return (
                        <div key={tx.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === 'kirim' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                              {tx.type === 'kirim' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{student?.name || tx.category}</p>
                              <p className="text-xs text-muted-foreground">{tx.date} • {tx.description || tx.category}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${tx.type === 'kirim' ? 'text-success' : 'text-destructive'}`}>
                            {tx.type === 'kirim' ? '+' : '-'}{fmt(tx.amount)}
                          </span>
                        </div>
                      );
                    })}
                  {monthPayments.length === 0 && monthExpenses.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">Operatsiyalar yo'q</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== KIRIMLAR ===== */}
        {activeTab === 'kirimlar' && (
          <motion.div key="kirimlar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Kirimlar — To'lovlar</h2>
              <button onClick={() => setShowAddPayment(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" /> To'lov qo'shish
              </button>
            </div>
            {showAddPayment && (
              <div className="bg-card border border-border rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <select value={newPayment.studentId} onChange={e => setNewPayment(p => ({ ...p, studentId: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                    <option value="">Talaba tanlang</option>
                    {students.filter(s => s.status === 'faol').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input type="number" placeholder="Summa" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                  <select value={newPayment.method} onChange={e => setNewPayment(p => ({ ...p, method: e.target.value as any }))}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                    {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <input placeholder="Izoh" value={newPayment.description} onChange={e => setNewPayment(p => ({ ...p, description: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm sm:col-span-2 lg:col-span-3" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addPayment} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Saqlash</button>
                  <button onClick={() => setShowAddPayment(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Bekor</button>
                </div>
              </div>
            )}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sana</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Talaba</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Guruh</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Summa</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Usul</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Izoh</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthPayments.sort((a, b) => b.date.localeCompare(a.date)).map(p => {
                      const student = students.find(s => s.id === p.studentId);
                      const group = groups.find(g => g.id === p.groupId);
                      return (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{student?.name || '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{group?.name || '—'}</td>
                          <td className="px-4 py-3 text-right font-bold text-success">+{fmt(p.amount)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              {paymentMethods.find(m => m.value === p.method)?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{p.description}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => deletePayment(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      );
                    })}
                    {monthPayments.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">To'lovlar yo'q</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== CHIQIMLAR ===== */}
        {activeTab === 'chiqimlar' && (
          <motion.div key="chiqimlar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chiqimlar</h2>
              <button onClick={() => setShowAddExpense(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" /> Chiqim qo'shish
              </button>
            </div>
            {showAddExpense && (
              <div className="bg-card border border-border rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input type="number" placeholder="Summa" value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                  <select value={newExpense.category} onChange={e => setNewExpense(p => ({ ...p, category: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                    {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newExpense.method} onChange={e => setNewExpense(p => ({ ...p, method: e.target.value as any }))}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                    {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <input placeholder="Izoh" value={newExpense.description} onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm sm:col-span-2 lg:col-span-3" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addExpense} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Saqlash</button>
                  <button onClick={() => setShowAddExpense(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Bekor</button>
                </div>
              </div>
            )}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sana</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kategoriya</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Summa</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Usul</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Izoh</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{e.category}</td>
                        <td className="px-4 py-3 text-right font-bold text-destructive">-{fmt(e.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {paymentMethods.find(m => m.value === e.method)?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{e.description}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => deleteExpense(e.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {monthExpenses.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Chiqimlar yo'q</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== QARZDORLAR ===== */}
        {activeTab === 'qarzdorlar' && (
          <motion.div key="qarzdorlar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Qarzdor Talabalar</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input placeholder="Qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm w-48" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center"><CreditCard className="h-6 w-6 text-destructive" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Umumiy qarzdorlik</p>
                <p className="text-xl font-bold text-destructive">{fmt(totalDebt)}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">Qarzdorlar soni</p>
                <p className="text-xl font-bold text-foreground">{debtors.length} ta</p>
              </div>
            </div>
            <div className="space-y-2">
              {debtors
                .filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => a.balance - b.balance)
                .map((d, i) => {
                  const group = groups.find(g => g.id === d.groupId);
                  return (
                    <motion.div key={d.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold text-sm">
                          {d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{group?.name || '—'} • {d.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-destructive">{fmt(Math.abs(d.balance))}</p>
                        <p className="text-xs text-muted-foreground">qarzdor</p>
                      </div>
                    </motion.div>
                  );
                })}
              {debtors.length === 0 && <p className="text-center text-muted-foreground py-8">Qarzdor talabalar yo'q 🎉</p>}
            </div>
          </motion.div>
        )}

        {/* ===== HISOBOT ===== */}
        {activeTab === 'hisobot' && (
          <motion.div key="hisobot" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Moliyaviy Hisobot</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary card */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> Oylik xulosasi</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
                    <span className="text-sm text-foreground">Jami kirimlar</span>
                    <span className="font-bold text-success">{fmt(totalIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-destructive/5 rounded-lg">
                    <span className="text-sm text-foreground">Jami chiqimlar</span>
                    <span className="font-bold text-destructive">{fmt(totalExpense)}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className={`flex justify-between items-center p-3 rounded-lg ${profit >= 0 ? 'bg-primary/5' : 'bg-destructive/5'}`}>
                    <span className="text-sm font-semibold text-foreground">Sof foyda</span>
                    <span className={`font-bold text-lg ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>{fmt(profit)}</span>
                  </div>
                </div>
              </div>

              {/* Payment methods breakdown */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> To'lov usullari</h3>
                {paymentMethods.map(m => {
                  const mIncome = monthPayments.filter(p => p.method === m.value).reduce((s, p) => s + p.amount, 0);
                  const mExpense = monthExpenses.filter(e => e.method === m.value).reduce((s, e) => s + e.amount, 0);
                  return (
                    <div key={m.value} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors mb-2">
                      <span className="text-sm text-foreground">{m.label}</span>
                      <div className="text-right text-xs">
                        <span className="text-success mr-3">+{fmt(mIncome)}</span>
                        <span className="text-destructive">-{fmt(mExpense)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Teacher salaries */}
              <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> O'qituvchilar ish haqi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">O'qituvchi</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fan</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Guruhlar</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Talabalar</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Holati</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map(t => {
                        const tGroups = groups.filter(g => g.teacherId === t.id);
                        const tStudents = students.filter(s => tGroups.some(g => g.id === s.groupId) && s.status === 'faol');
                        return (
                          <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{t.subject}</td>
                            <td className="px-4 py-3 text-center">{tGroups.length}</td>
                            <td className="px-4 py-3 text-center">{tStudents.length}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'faol' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                {t.status === 'faol' ? 'Faol' : 'Dam olishda'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Generate initial mock payments
function generateInitialPayments(): Payment[] {
  const payments: Payment[] = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 60));
    payments.push({
      id: `pay_init_${i}`,
      studentId: `s${(i % 20) + 1}`,
      groupId: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'][i % 8],
      amount: [300000, 450000, 500000, 600000, 800000, 1000000, 1200000, 350000][i % 8],
      date: format(d, 'yyyy-MM-dd'),
      type: 'kirim',
      category: "To'lov",
      description: ["Oylik to'lov", "To'liq to'lov", "Qisman to'lov", "Avans"][i % 4],
      method: (['naqd', 'karta', 'online'] as const)[i % 3],
    });
  }
  return payments;
}

function generateInitialExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const now = new Date();
  const items = [
    { cat: 'Ish haqi', min: 3000000, max: 8000000 },
    { cat: 'Arenda', min: 5000000, max: 8000000 },
    { cat: 'Kommunal', min: 500000, max: 1500000 },
    { cat: 'Jihozlar', min: 200000, max: 3000000 },
    { cat: 'Marketing', min: 300000, max: 2000000 },
    { cat: 'Transport', min: 100000, max: 500000 },
  ];
  for (let i = 0; i < 20; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 60));
    const item = items[i % items.length];
    expenses.push({
      id: `exp_init_${i}`,
      amount: Math.round((item.min + Math.random() * (item.max - item.min)) / 1000) * 1000,
      date: format(d, 'yyyy-MM-dd'),
      category: item.cat,
      description: `${item.cat} - ${format(d, 'MMMM')}`,
      method: (['naqd', 'karta', 'online'] as const)[i % 3],
    });
  }
  return expenses;
}

export default Finance;
