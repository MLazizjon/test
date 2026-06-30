import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, User, MapPin, Calendar, Clock, X, Trash2, Pencil } from 'lucide-react';
import { GroupIcon } from '@/components/GroupIcon';

const Groups = () => {
  const { groups, teachers, students, addGroup, updateGroup, deleteGroup } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'faol' | 'yakunlangan' | 'kutilmoqda'>('faol');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGroup, setEditGroup] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: '', course: '', teacherId: teachers[0]?.id || '', days: 'Dush, Chor, Juma', time: '14:00 - 16:00', maxStudents: 15 });
  const [editData, setEditData] = useState({ name: '', teacherId: '' });

  const visibleGroups = user?.role === 'teacher'
    ? groups.filter(g => g.teacherId === user.teacherId)
    : groups;

  const filtered = visibleGroups.filter(g =>
    g.status === tab && (g.name.toLowerCase().includes(search.toLowerCase()) || g.course.toLowerCase().includes(search.toLowerCase()))
  );

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || '-';
  const getStudentCount = (groupId: string) => students.filter(s => s.groupId === groupId).length;

  const cycleStatus = (groupId: string) => {
    const g = groups.find(gr => gr.id === groupId);
    if (!g) return;
    const next = g.status === 'faol' ? 'yakunlangan' : g.status === 'yakunlangan' ? 'kutilmoqda' : 'faol';
    updateGroup(groupId, { status: next as 'faol' | 'yakunlangan' | 'kutilmoqda' });
  };

  const handleAdd = () => {
    if (!newGroup.name) return;
    addGroup({ ...newGroup, status: 'faol', icon: 'book-open', color: 'bg-blue-100' });
    setNewGroup({ name: '', course: '', teacherId: teachers[0]?.id || '', days: 'Dush, Chor, Juma', time: '14:00 - 16:00', maxStudents: 15 });
    setShowAddModal(false);
  };

  const handleEdit = (groupId: string) => {
    updateGroup(groupId, { name: editData.name, teacherId: editData.teacherId });
    setEditGroup(null);
  };

  const tabs = [
    { key: 'faol' as const, label: `Faol guruhlar (${visibleGroups.filter(g => g.status === 'faol').length})` },
    { key: 'yakunlangan' as const, label: 'Yakunlanganlar' },
    { key: 'kutilmoqda' as const, label: 'Kutilmoqda' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guruhlar</h1>
          <p className="page-subtitle">O'quv markazidagi barcha guruhlar va ularning ko'rsatkichlari</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus className="h-4 w-4" /> Yangi guruh qo'shish
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border mb-6">
        <div className="flex items-center border-b border-border">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Guruh nomi yoki kurs bo'yicha qidirish..." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(group => {
          const studentCount = getStudentCount(group.id);
          const progress = (studentCount / group.maxStudents) * 100;
          return (
            <div key={group.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4">
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === group.id ? null : group.id); }}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen === group.id && (
                  <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg py-1 z-10 w-40">
                    <button onClick={() => { setEditGroup(group.id); setEditData({ name: group.name, teacherId: group.teacherId }); setMenuOpen(null); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2 text-foreground">
                      <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                    </button>
                    <button onClick={() => { deleteGroup(group.id); setMenuOpen(null); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2">
                      <Trash2 className="h-3.5 w-3.5" /> O'chirish
                    </button>
                  </div>
                )}
              </div>

              <div className="cursor-pointer" onClick={() => navigate(`/attendance/${group.id}`)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-primary">
                    <GroupIcon name={group.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{group.name}</h3>
                    <button onClick={(e) => { e.stopPropagation(); cycleStatus(group.id); }}
                      className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${group.status === 'faol' ? 'bg-success/10 text-success' : group.status === 'yakunlangan' ? 'bg-muted text-muted-foreground' : 'bg-warning/10 text-warning'}`}>
                      {group.status === 'faol' ? 'FAOL' : group.status === 'yakunlangan' ? 'YAKUNLANGAN' : 'KUTILMOQDA'}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><User className="h-3.5 w-3.5" />{getTeacherName(group.teacherId)}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{group.days}</div>
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{group.time}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground uppercase tracking-wider font-semibold">O'QUVCHILAR</span>
                    <span className={`font-bold ${progress >= 100 ? 'text-foreground' : 'text-primary'}`}>{studentCount} / {group.maxStudents}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progress >= 100 ? 'bg-foreground' : 'bg-primary'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-12 text-muted-foreground">Bu kategoriyada guruhlar topilmadi</div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Yangi guruh qo'shish</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <input value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Guruh nomi" />
              <input value={newGroup.course} onChange={e => setNewGroup(p => ({ ...p, course: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Kurs nomi" />
              <select value={newGroup.teacherId} onChange={e => setNewGroup(p => ({ ...p, teacherId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select value={newGroup.days} onChange={e => setNewGroup(p => ({ ...p, days: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option>Dush, Chor, Juma</option>
                <option>Sesh, Pay, Shan</option>
              </select>
              <input value={newGroup.time} onChange={e => setNewGroup(p => ({ ...p, time: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="14:00 - 16:00" />
              <input type="number" value={newGroup.maxStudents} onChange={e => setNewGroup(p => ({ ...p, maxStudents: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Max talabalar" />
              <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90">Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {editGroup && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setEditGroup(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">Guruhni tahrirlash</h2>
            <div className="space-y-4">
              <input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              <select value={editData.teacherId} onChange={e => setEditData(p => ({ ...p, teacherId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={() => handleEdit(editGroup)} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
