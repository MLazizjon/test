import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Calendar, X, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';

const Teachers = () => {
  const { teachers, groups, addTeacher, updateTeacher, deleteTeacher } = useData();
  const { createTeacherAccount, syncTeacherAccount, deleteTeacherAccount } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editTeacher, setEditTeacher] = useState<{ id: string; name: string; phone: string; subject: string; status: 'faol' | 'dam_olishda' } | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [newTeacher, setNewTeacher] = useState({ name: '', phone: '', subject: '', status: 'faol' as 'faol' | 'dam_olishda' });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getTeacherGroups = (teacherId: string) => groups.filter(g => g.teacherId === teacherId);
  const selectedT = teachers.find(t => t.id === selectedTeacher);
  const selectedGroups = selectedTeacher ? getTeacherGroups(selectedTeacher) : [];

  const handleAdd = () => {
    if (!newTeacher.name || !newTeacher.phone || !newTeacher.subject) return;

    const createdTeacher = addTeacher({
      name: newTeacher.name,
      initials: newTeacher.name.split(' ').map(n => n[0]).join('').slice(0, 2),
      phone: newTeacher.phone,
      subject: newTeacher.subject,
      groupIds: [],
      status: newTeacher.status,
      photo: '',
    });

    const credentials = createTeacherAccount({
      id: createdTeacher.id,
      name: createdTeacher.name,
      phone: createdTeacher.phone,
    });

    setNewTeacher({ name: '', phone: '', subject: '', status: 'faol' });
    setShowAddModal(false);
    toast({
      title: "Ustoz qo'shildi",
      description: `${createdTeacher.name} qo'shildi. Login: ${credentials.username}`,
    });
  };

  const handleEditSave = () => {
    if (!editTeacher) return;

    updateTeacher(editTeacher.id, {
      name: editTeacher.name,
      phone: editTeacher.phone,
      subject: editTeacher.subject,
      status: editTeacher.status,
      initials: editTeacher.name.split(' ').map(n => n[0]).join('').slice(0, 2),
    });

    const credentials = syncTeacherAccount({
      id: editTeacher.id,
      name: editTeacher.name,
      phone: editTeacher.phone,
    });

    toast({ title: "Ustoz tahrirlandi", description: `Login yangilandi: ${credentials.username}` });
    setEditTeacher(null);
  };

  const handleDelete = (teacherId: string) => {
    const teacher = teachers.find(item => item.id === teacherId);
    if (!teacher) return;

    deleteTeacher(teacherId);
    deleteTeacherAccount(teacherId);
    if (selectedTeacher === teacherId) {
      setSelectedTeacher(null);
      setShowSchedule(false);
    }
    setDeleteConfirm(null);
    toast({ title: "Ustoz o'chirildi", description: `${teacher.name} ro'yxatdan olib tashlandi`, variant: 'destructive' });
  };

  return (
    <div className="animate-fade-in flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="page-header">
          <div>
            <h1 className="page-title">O'qituvchilar</h1>
            <p className="page-subtitle">Jami: {teachers.length} nafar ustoz</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-input bg-card text-foreground text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ism yoki fan bo'yicha qidirish..." />
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              <Plus className="h-4 w-4" /> Ustoz qo'shish
            </button>
          </div>
        </div>

        <div className="data-table">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['F.I.SH.', "YO'NALISHI", 'GURUHLAR', 'TELEFON', 'HOLATI', 'AMALLAR'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((teacher) => {
                const tGroups = getTeacherGroups(teacher.id);
                const maxGroups = 10;
                const progress = (tGroups.length / maxGroups) * 100;
                return (
                  <tr key={teacher.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <button onClick={() => navigate(`/teacher/${teacher.id}`)} className="flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {teacher.initials}
                        </div>
                        <div>
                          <p className="font-medium text-foreground hover:text-primary transition-colors">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {teacher.id.replace('t', '')}</p>
                        </div>
                      </button>
                    </td>
                    <td className="p-4"><span className="badge-course">{teacher.subject}</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{tGroups.length}</span>
                        <span className="text-xs text-muted-foreground">ta</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{teacher.phone}</td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          const next = teacher.status === 'faol' ? 'dam_olishda' : 'faol';
                          updateTeacher(teacher.id, { status: next });
                          toast({ title: 'Holat yangilandi', description: `${teacher.name}: ${next === 'faol' ? 'FAOL' : 'DAM OLISHDA'}` });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          teacher.status === 'faol'
                            ? 'bg-success/10 text-success hover:bg-success/20'
                            : 'bg-warning/10 text-warning hover:bg-warning/20'
                        }`}
                      >
                        {teacher.status === 'faol' ? 'FAOL' : 'DAM OLISHDA'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => { setSelectedTeacher(teacher.id); setShowSchedule(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                        </button>
                        <div className="relative" ref={openMenu === teacher.id ? menuRef : undefined}>
                          <button onClick={() => setOpenMenu(openMenu === teacher.id ? null : teacher.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === teacher.id && (
                            <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg py-1 z-20 w-44">
                              <button onClick={() => {
                                setEditTeacher({ id: teacher.id, name: teacher.name, phone: teacher.phone, subject: teacher.subject, status: teacher.status });
                                setOpenMenu(null);
                              }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground flex items-center gap-2">
                                <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                              </button>
                              <button onClick={() => { setDeleteConfirm(teacher.id); setOpenMenu(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2">
                                <Trash2 className="h-3.5 w-3.5" /> O'chirish
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 flex items-center justify-between border-t border-border">
            <p className="text-sm text-muted-foreground">{filtered.length === 0 ? '0' : (page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} / {filtered.length} TADAN</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${page === p ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {showSchedule && selectedT && (
        <div className="w-80 shrink-0">
          <div className="bg-card rounded-xl border border-border p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Dars jadvali</h3>
              <button onClick={() => setShowSchedule(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{selectedT.initials}</div>
              <div>
                <p className="font-medium text-foreground">{selectedT.name}</p>
                <p className="text-xs text-muted-foreground">{selectedT.subject}</p>
              </div>
            </div>
            <div className="space-y-3">
              {selectedGroups.map(g => (
                <div key={g.id} className="p-3 rounded-lg border-l-4 border-primary bg-muted/50">
                  <span className="text-xs font-semibold text-primary">{g.time}</span>
                  <p className="font-medium text-foreground mt-1">{g.name}</p>
                  <p className="text-xs text-muted-foreground">Guruh: #{g.id.replace('g', '')}</p>
                </div>
              ))}
              {selectedGroups.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Darslar topilmadi</p>}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Yangi ustoz qo'shish</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ism</label>
                <input value={newTeacher.name} onChange={e => setNewTeacher(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="To'liq ism" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon</label>
                <input value={newTeacher.phone} onChange={e => setNewTeacher(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="+998" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Fan</label>
                <input value={newTeacher.subject} onChange={e => setNewTeacher(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Yo'nalish" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Holati</label>
                <select value={newTeacher.status} onChange={e => setNewTeacher(p => ({ ...p, status: e.target.value as 'faol' | 'dam_olishda' }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="faol">FAOL</option>
                  <option value="dam_olishda">DAM OLISHDA</option>
                </select>
              </div>
              <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {editTeacher && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setEditTeacher(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Ustozni tahrirlash</h2>
              <button onClick={() => setEditTeacher(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ism</label>
                <input value={editTeacher.name} onChange={e => setEditTeacher(p => p ? { ...p, name: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon</label>
                <input value={editTeacher.phone} onChange={e => setEditTeacher(p => p ? { ...p, phone: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Fan</label>
                <input value={editTeacher.subject} onChange={e => setEditTeacher(p => p ? { ...p, subject: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Holati</label>
                <select value={editTeacher.status} onChange={e => setEditTeacher(p => p ? { ...p, status: e.target.value as 'faol' | 'dam_olishda' } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="faol">FAOL</option>
                  <option value="dam_olishda">DAM OLISHDA</option>
                </select>
              </div>
              <button onClick={handleEditSave} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-2">Ustozni o'chirish</h2>
            <p className="text-sm text-muted-foreground mb-6">Bu ustoz o'chirilsa, login va ustozlar davomatidagi ko'rinishi ham olib tashlanadi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted">Bekor qilish</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
