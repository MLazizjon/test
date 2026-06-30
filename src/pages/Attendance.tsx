import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, CheckCircle, XCircle, AlertCircle, MoreVertical, Plus, X, Pencil, Trash2 } from 'lucide-react';

type AttStatus = 'present' | 'absent' | 'excused';

const Attendance = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { groups, students, teachers, attendance, setAttendance, updateGroup, addStudent, deleteStudent, updateStudent } = useData();
  const topMenuRef = useRef<HTMLDivElement>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'jurnal' | 'statistika'>('jurnal');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [menuOpen, setMenuOpen] = useState(false);
  const [rowMenuOpen, setRowMenuOpen] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editStudent, setEditStudent] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const group = groups.find(g => g.id === groupId);
  const groupStudents = students.filter(s => s.groupId === groupId);

  const [editGroupData, setEditGroupData] = useState({ name: group?.name || '', teacherId: group?.teacherId || '', time: group?.time || '' });

  useEffect(() => {
    if (group) {
      setEditGroupData({ name: group.name, teacherId: group.teacherId, time: group.time });
    }
  }, [group]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) {
        setRowMenuOpen(null);
        setMenuPos(null);
      }
      if (topMenuRef.current && !topMenuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRowMenuToggle = useCallback((studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (rowMenuOpen === studentId) {
      setRowMenuOpen(null);
      setMenuPos(null);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 176 });
      setRowMenuOpen(studentId);
    }
  }, [rowMenuOpen]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('uz-UZ', { month: 'long' });

  const persistedMap = useMemo(() => {
    const map: Record<string, AttStatus> = {};
    attendance.filter(a => a.groupId === groupId).forEach(a => {
      map[`${a.studentId}-${a.date}`] = a.status;
    });
    return map;
  }, [attendance, groupId]);

  const buildLocalAttendance = () => {
    const map = { ...persistedMap };
    groupStudents.forEach(student => {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const key = `${student.id}-${date}`;
        if (!map[key]) map[key] = 'present';
      }
    });
    return map;
  };

  const [localAtt, setLocalAtt] = useState<Record<string, AttStatus>>(() => buildLocalAttendance());

  useEffect(() => {
    setLocalAtt(buildLocalAttendance());
  }, [groupId, month, year, students, attendance]);

  const toggleStatus = (studentId: string, day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const key = `${studentId}-${date}`;
    const current = localAtt[key] || 'present';
    const next: AttStatus = current === 'present' ? 'absent' : current === 'absent' ? 'excused' : 'present';
    setLocalAtt(prev => ({ ...prev, [key]: next }));
  };

  const handleSave = () => {
    const records = Object.entries(localAtt).map(([key, status]) => {
      const [studentId, ...rest] = key.split('-');
      const date = rest.join('-');
      return { groupId: groupId!, studentId, date, status };
    });
    setAttendance(records);
    toast({ title: 'Saqlandi', description: 'Davomat maʼlumotlari muvaffaqiyatli saqlandi' });
  };

  const handleEditGroup = () => {
    if (!groupId) return;
    updateGroup(groupId, { name: editGroupData.name, teacherId: editGroupData.teacherId, time: editGroupData.time });
    setShowEditModal(false);
    toast({ title: 'Guruh tahrirlandi', description: `${editGroupData.name} yangilandi` });
  };

  const handleAddStudentToGroup = () => {
    if (!newStudentName || !groupId) return;
    addStudent({ name: newStudentName, phone: newStudentPhone, groupId, balance: 0, status: 'faol', lastAction: 'Bugun', lastActionType: 'YARATILDI', photo: '' });
    setNewStudentName('');
    setNewStudentPhone('');
    setShowAddStudentModal(false);
    toast({ title: "Talaba qo'shildi", description: `${newStudentName} guruhga qo'shildi` });
  };

  const handleEditStudent = () => {
    if (!editStudent) return;
    updateStudent(editStudent.id, { name: editStudent.name, phone: editStudent.phone });
    setEditStudent(null);
    toast({ title: 'Talaba tahrirlandi', description: `${editStudent.name} ma'lumotlari saqlandi` });
  };

  const handleDeleteStudent = () => {
    if (!deleteStudentId) return;
    const student = groupStudents.find(item => item.id === deleteStudentId);
    deleteStudent(deleteStudentId);
    setDeleteStudentId(null);
    toast({ title: 'Talaba o\'chirildi', description: `${student?.name || 'Talaba'} guruhdan olib tashlandi`, variant: 'destructive' });
  };

  const getStudentTotal = (studentId: string) => {
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (localAtt[`${studentId}-${date}`] === 'present') total++;
    }
    return total;
  };

  const displayDays = Array.from({ length: Math.min(daysInMonth, 26) }, (_, i) => i + 1);

  if (!group) return <div className="p-8 text-center text-muted-foreground">Guruh topilmadi</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground shrink-0"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">Davomat Jurnali</h1>
            <p className="text-sm text-primary font-semibold truncate">{group.name} • {group.time}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="input-base w-auto text-xs sm:text-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{new Date(2024, i).toLocaleDateString('uz-UZ', { month: 'long' })}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="input-base w-auto text-xs sm:text-sm">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex bg-muted rounded-lg p-0.5 ml-auto">
            <button onClick={() => setTab('jurnal')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${tab === 'jurnal' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}>Jurnal</button>
            <button onClick={() => setTab('statistika')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${tab === 'statistika' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}>Statistika</button>
          </div>
          <button onClick={handleSave} className="btn-primary text-xs sm:text-sm">
            <Save className="h-4 w-4" /> Saqlash
          </button>
          <div className="relative" ref={topMenuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg border border-border hover:bg-muted"><MoreVertical className="h-4 w-4" /></button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-xl py-1 z-10 w-48">
                <button onClick={() => { setShowEditModal(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                </button>
                <button onClick={() => { setShowAddStudentModal(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5" /> Talaba qo'shish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-success" /> Keldi</span>
        <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-destructive" /> Kelmadi</span>
        <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5 text-warning" /> Sababli (S)</span>
        <span className="ml-auto">Jami: {groupStudents.length} talaba</span>
      </div>

      {tab === 'jurnal' ? (
        <div className="data-table overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground sticky left-0 bg-card z-10 min-w-[220px]">F.I.SH.</th>
                {displayDays.map(d => (
                  <th key={d} className="p-2 text-center text-xs text-muted-foreground min-w-[32px]">
                    <div>{['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'][new Date(year, month, d).getDay()]}</div>
                    <div className="font-bold text-foreground">{d}</div>
                  </th>
                ))}
                <th className="p-3 text-center text-xs font-semibold text-muted-foreground min-w-[50px]">JAMI</th>
              </tr>
            </thead>
            <tbody>
              {groupStudents.map((student, idx) => (
                 <tr key={student.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 sticky left-0 bg-card z-10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.status === 'faol' ? 'ACTIVE' : 'INACTIVE'}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <button onClick={(e) => handleRowMenuToggle(student.id, e)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  {displayDays.map(d => {
                    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const status = localAtt[`${student.id}-${date}`];
                    const dayOfWeek = new Date(year, month, d).getDay();
                    const isOff = dayOfWeek === 0;
                    return (
                      <td key={d} className={`p-1 text-center ${isOff ? 'bg-muted/50' : ''}`}>
                        {isOff ? <span className="w-6 h-6 inline-block" /> : (
                          <button onClick={() => toggleStatus(student.id, d)} className="w-6 h-6 inline-flex items-center justify-center">
                            {status === 'present' && <CheckCircle className="h-5 w-5 text-success" />}
                            {status === 'absent' && <XCircle className="h-5 w-5 text-destructive" />}
                            {status === 'excused' && <span className="text-warning font-bold text-xs">S</span>}
                            {!status && <span className="w-5 h-5 rounded-full border border-border" />}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-bold text-foreground">{getStudentTotal(student.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="data-table p-6">
          <h3 className="font-semibold text-foreground mb-4">Oy statistikasi - {monthName} {year}</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(() => {
              let present = 0, absent = 0, excused = 0;
              Object.values(localAtt).forEach(s => { if (s === 'present') present++; else if (s === 'absent') absent++; else excused++; });
              return [
                { label: 'Keldi', value: present, color: 'text-success', bg: 'bg-success/10' },
                { label: 'Kelmadi', value: absent, color: 'text-destructive', bg: 'bg-destructive/10' },
                { label: 'Sababli', value: excused, color: 'text-warning', bg: 'bg-warning/10' },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl ${s.bg}`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ));
            })()}
          </div>
          <div className="space-y-2">
            {groupStudents.map(s => {
              const total = getStudentTotal(s.id);
              const pct = Math.round((total / daysInMonth) * 100);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-40 truncate">{s.name}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rowMenuOpen && menuPos && (() => {
        const student = groupStudents.find(s => s.id === rowMenuOpen);
        if (!student) return null;
        return createPortal(
          <div ref={rowMenuRef} className="fixed z-[9999] bg-card border border-border rounded-lg shadow-xl py-1 w-44" style={{ top: menuPos.top, left: menuPos.left }}>
            <button onClick={() => {
              setEditStudent({ id: student.id, name: student.name, phone: student.phone });
              setRowMenuOpen(null);
              setMenuPos(null);
            }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground flex items-center gap-2">
              <Pencil className="h-3.5 w-3.5" /> Tahrirlash
            </button>
            <button onClick={() => {
              setDeleteStudentId(student.id);
              setRowMenuOpen(null);
              setMenuPos(null);
            }} className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2">
              <Trash2 className="h-3.5 w-3.5" /> O'chirish
            </button>
          </div>,
          document.body
        );
      })()}

      {showEditModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Guruhni tahrirlash</h2>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Guruh nomi</label>
                <input value={editGroupData.name} onChange={e => setEditGroupData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">O'qituvchi</label>
                <select value={editGroupData.teacherId} onChange={e => setEditGroupData(p => ({ ...p, teacherId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Vaqt</label>
                <input value={editGroupData.time} onChange={e => setEditGroupData(p => ({ ...p, time: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <button onClick={handleEditGroup} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {showAddStudentModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setShowAddStudentModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Guruhga talaba qo'shish</h2>
              <button onClick={() => setShowAddStudentModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ism</label>
                <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="To'liq ism" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon</label>
                <input value={newStudentPhone} onChange={e => setNewStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="+998" />
              </div>
              <button onClick={handleAddStudentToGroup} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90">Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {editStudent && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setEditStudent(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Talabani tahrirlash</h2>
              <button onClick={() => setEditStudent(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ism</label>
                <input value={editStudent.name} onChange={e => setEditStudent(p => p ? { ...p, name: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon</label>
                <input value={editStudent.phone} onChange={e => setEditStudent(p => p ? { ...p, phone: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <button onClick={handleEditStudent} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {deleteStudentId && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setDeleteStudentId(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-2">Talabani o'chirish</h2>
            <p className="text-sm text-muted-foreground mb-6">Bu talaba guruh va jurnal ro'yxatidan o'chiriladi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteStudentId(null)} className="flex-1 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted">Bekor qilish</button>
              <button onClick={handleDeleteStudent} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90">O'chirish</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>● Tizim holati: OK &nbsp;|&nbsp; Oxirgi tahrir: Bugun, {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')} (Admin)</span>
        <span>Qo'llanma &nbsp; Texnik yordam &nbsp; © 2024</span>
      </div>
    </div>
  );
};

export default Attendance;
