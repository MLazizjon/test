import { useState, useRef, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';
import { Users, CheckCircle, AlertCircle, Archive, Search, Plus, Download, MoreVertical, ChevronLeft, ChevronRight, X, Pencil, Trash2 } from 'lucide-react';

const Students = () => {
  const { students, groups, addStudent, updateStudent, deleteStudent, getCurrencySymbol } = useData();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [balanceInput, setBalanceInput] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editStudent, setEditStudent] = useState<{ id: string; name: string; phone: string; groupId: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const perPage = 10;

  const [newStudent, setNewStudent] = useState({ name: '', phone: '', groupId: groups[0]?.id || '', balance: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search) || s.phone.includes(search);
    const matchGroup = groupFilter === 'all' || s.groupId === groupFilter;
    const matchPayment = paymentFilter === 'all' || (paymentFilter === 'paid' ? s.balance >= 0 : s.balance < 0);
    return matchSearch && matchGroup && matchPayment;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const activeCount = students.filter(s => s.status === 'faol').length;
  const debtCount = students.filter(s => s.balance < 0).length;
  const archiveCount = students.filter(s => s.status === 'arxiv').length;

  const getGroupName = (gId: string) => groups.find(g => g.id === gId)?.name || '-';
  const formatBalance = (b: number) => {
    const sym = getCurrencySymbol();
    const formatted = Math.abs(b).toLocaleString();
    if (b > 0) return `+${formatted} ${sym}`;
    if (b < 0) return `-${formatted} ${sym}`;
    return `0 ${sym}`;
  };

  const handleAddStudent = () => {
    if (!newStudent.name) return;
    addStudent({ ...newStudent, status: 'faol', lastAction: 'Bugun', lastActionType: "YARATILDI", photo: '' });
    setNewStudent({ name: '', phone: '', groupId: groups[0]?.id || '', balance: 0 });
    setShowAddModal(false);
    toast({ title: "Talaba qo'shildi", description: `${newStudent.name} muvaffaqiyatli qo'shildi` });
  };

  const handleBalanceSave = (studentId: string) => {
    updateStudent(studentId, { balance: Number(balanceInput) || 0 });
    setEditingBalance(null);
    toast({ title: "Balans yangilandi" });
  };

  const handleEditSave = () => {
    if (!editStudent) return;
    updateStudent(editStudent.id, { name: editStudent.name, phone: editStudent.phone, groupId: editStudent.groupId });
    toast({ title: "Talaba tahrirlandi", description: `${editStudent.name} ma'lumotlari yangilandi` });
    setEditStudent(null);
  };

  const handleDelete = (id: string) => {
    const name = students.find(s => s.id === id)?.name;
    deleteStudent(id);
    setDeleteConfirm(null);
    toast({ title: "Talaba o'chirildi", description: `${name} ro'yxatdan o'chirildi`, variant: "destructive" });
  };

  const handleExport = () => {
    const csv = ['Ism,Telefon,Guruh,Balans,Status'].concat(
      students.map(s => `${s.name},${s.phone},${getGroupName(s.groupId)},${s.balance},${s.status}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'talabalar.csv'; a.click();
    toast({ title: "Export tayyor", description: "talabalar.csv yuklab olindi" });
  };

  const stats = [
    { label: 'JAMI', value: students.length, icon: Users, color: 'text-primary bg-primary/10' },
    { label: 'FAOL', value: activeCount, icon: CheckCircle, color: 'text-success bg-success/10' },
    { label: 'QARZDORLAR', value: debtCount, icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
    { label: 'ARXIV', value: archiveCount, icon: Archive, color: 'text-muted-foreground bg-muted' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Talabalar Bazasi</h1>
          <p className="page-subtitle">Barcha faol va arxivdagi talabalar ro'yxati</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={handleExport} className="btn-outline text-xs sm:text-sm">
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs sm:text-sm">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Talaba qo'shish</span><span className="sm:hidden">Qo'shish</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-wider">{stat.label}</p>
              <span className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-10"
            placeholder="Ism, telefon yoki ID..." />
        </div>
        <select value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(1); }}
          className="input-base w-auto">
          <option value="all">Barcha guruhlar</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
          className="input-base w-auto">
          <option value="all">To'lov holati</option>
          <option value="paid">To'langan</option>
          <option value="unpaid">Qarzdor</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className="data-table hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['TALABA', 'TELEFON', 'GURUH', 'BALANS', 'OXIRGI HARAKAT', 'AMALLAR'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((student) => (
              <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">ID: #{student.id.replace('s', '')}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-foreground text-sm">{student.phone}</td>
                <td className="p-4"><span className="badge-course">{getGroupName(student.groupId)}</span></td>
                <td className="p-4">
                  {editingBalance === student.id ? (
                    <input autoFocus value={balanceInput} onChange={e => setBalanceInput(e.target.value)}
                      onBlur={() => handleBalanceSave(student.id)} onKeyDown={e => e.key === 'Enter' && handleBalanceSave(student.id)}
                      className="w-32 input-base" />
                  ) : (
                    <button onClick={() => { setEditingBalance(student.id); setBalanceInput(String(student.balance)); }}
                      className={`font-semibold text-sm ${student.balance > 0 ? 'text-success' : student.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {formatBalance(student.balance)}
                    </button>
                  )}
                </td>
                <td className="p-4">
                  <p className="text-sm text-foreground">{student.lastAction}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{student.lastActionType}</p>
                </td>
                <td className="p-4">
                  <div className="relative" ref={openMenu === student.id ? menuRef : undefined}>
                    <button onClick={() => setOpenMenu(openMenu === student.id ? null : student.id)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenu === student.id && (
                      <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-xl py-1 z-20 w-44">
                        <button onClick={() => { setEditStudent({ id: student.id, name: student.name, phone: student.phone, groupId: student.groupId }); setOpenMenu(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground flex items-center gap-2">
                          <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                        </button>
                        <button onClick={() => { setDeleteConfirm(student.id); setOpenMenu(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2">
                          <Trash2 className="h-3.5 w-3.5" /> O'chirib yuborish
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 flex items-center justify-between border-t border-border">
          <p className="text-sm text-muted-foreground">{filtered.length} talabadan {Math.min((page - 1) * perPage + 1, filtered.length)}-{Math.min(page * perPage, filtered.length)} ko'rsatilmoqda</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${page === p ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>{p}</button>
            ))}
            {totalPages > 5 && <span className="px-1 text-muted-foreground">...</span>}
            {totalPages > 5 && (
              <button onClick={() => setPage(totalPages)} className={`h-8 w-8 rounded-lg text-sm font-medium ${page === totalPages ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>{totalPages}</button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map((student) => (
          <div key={student.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.phone}</p>
                </div>
              </div>
              <div className="relative" ref={openMenu === student.id ? menuRef : undefined}>
                <button onClick={() => setOpenMenu(openMenu === student.id ? null : student.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
                {openMenu === student.id && (
                  <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-xl py-1 z-20 w-44">
                    <button onClick={() => { setEditStudent({ id: student.id, name: student.name, phone: student.phone, groupId: student.groupId }); setOpenMenu(null); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground flex items-center gap-2">
                      <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                    </button>
                    <button onClick={() => { setDeleteConfirm(student.id); setOpenMenu(null); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2">
                      <Trash2 className="h-3.5 w-3.5" /> O'chirib yuborish
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="badge-course text-xs">{getGroupName(student.groupId)}</span>
              <button onClick={() => { setEditingBalance(student.id); setBalanceInput(String(student.balance)); }}
                className={`font-semibold text-sm ${student.balance > 0 ? 'text-success' : student.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                {formatBalance(student.balance)}
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">{filtered.length} tadan {page}/{totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-medium text-foreground px-2">{page}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Yangi talaba qo'shish</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ism</label>
                <input value={newStudent.name} onChange={e => setNewStudent(p => ({ ...p, name: e.target.value }))}
                  className="input-base" placeholder="To'liq ism" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon</label>
                <input value={newStudent.phone} onChange={e => setNewStudent(p => ({ ...p, phone: e.target.value }))}
                  className="input-base" placeholder="+998 90 123 45 67" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Guruh</label>
                <select value={newStudent.groupId} onChange={e => setNewStudent(p => ({ ...p, groupId: e.target.value }))}
                  className="input-base">
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <button onClick={handleAddStudent} className="w-full btn-primary justify-center py-2.5">Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setEditStudent(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Talabani tahrirlash</h2>
              <button onClick={() => setEditStudent(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ism</label>
                <input value={editStudent.name} onChange={e => setEditStudent(p => p ? { ...p, name: e.target.value } : p)}
                  className="input-base" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon</label>
                <input value={editStudent.phone} onChange={e => setEditStudent(p => p ? { ...p, phone: e.target.value } : p)}
                  className="input-base" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Guruh</label>
                <select value={editStudent.groupId} onChange={e => setEditStudent(p => p ? { ...p, groupId: e.target.value } : p)}
                  className="input-base">
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <button onClick={handleEditSave} className="w-full btn-primary justify-center py-2.5">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-2">O'chirishni tasdiqlang</h2>
            <p className="text-sm text-muted-foreground mb-6">Bu talabani o'chirib yuborishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline justify-center">Bekor qilish</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
