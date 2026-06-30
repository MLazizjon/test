import { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';
import { Users, CheckCircle, Clock, XCircle, Search, Calendar, Download, Pencil, X } from 'lucide-react';

const TeacherAttendance = () => {
  const { teachers, groups, teacherAttendance, setTeacherAttendanceRecord } = useData();
  const [statusFilter, setStatusFilter] = useState<'all' | 'kelgan' | 'kelmadi'>('all');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editRecord, setEditRecord] = useState<{
    teacherId: string; arrivedAt: string; leftAt: string;
    status: 'kelgan' | 'kechikkan' | 'kelmagan'; workHours: number; note: string;
  } | null>(null);

  const recordsMap = useMemo(() => {
    return new Map(teacherAttendance.filter(record => record.date === selectedDate).map(record => [record.teacherId, record]));
  }, [selectedDate, teacherAttendance]);

  const getTeacherGroups = (teacherId: string) => groups.filter(g => g.teacherId === teacherId);

  const getRecord = (teacherId: string) => {
    const saved = recordsMap.get(teacherId);
    if (saved) return saved;
    const teacher = teachers.find(item => item.id === teacherId);
    if (!teacher) return { teacherId, date: selectedDate, arrivedAt: '--:--', leftAt: '--:--', status: 'kelmagan' as const, workHours: 0, note: '' };
    if (teacher.status === 'dam_olishda') return { teacherId, date: selectedDate, arrivedAt: '--:--', leftAt: '--:--', status: 'kelmagan' as const, workHours: 0, note: 'Dam olishda' };
    return { teacherId, date: selectedDate, arrivedAt: '08:00', leftAt: '17:00', status: 'kelgan' as const, workHours: 9, note: 'Avtomatik holat' };
  };

  const allRecords = teachers.map(teacher => ({ teacher, record: getRecord(teacher.id) }));

  const filtered = allRecords.filter(({ teacher, record }) => {
    const matchSearch = teacher.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'kelgan'
      ? record.status === 'kelgan' || record.status === 'kechikkan'
      : record.status === 'kelmagan');
    return matchSearch && matchStatus;
  });

  const kelganlar = allRecords.filter(({ record }) => record.status === 'kelgan').length;
  const kechikkanlar = allRecords.filter(({ record }) => record.status === 'kechikkan').length;
  const kelmaganlar = allRecords.filter(({ record }) => record.status === 'kelmagan').length;

  const handleEditSave = () => {
    if (!editRecord) return;
    const nextRecord = editRecord.status === 'kelmagan'
      ? { ...editRecord, arrivedAt: '--:--', leftAt: '--:--', workHours: 0 }
      : editRecord;
    setTeacherAttendanceRecord({ teacherId: nextRecord.teacherId, date: selectedDate, arrivedAt: nextRecord.arrivedAt, leftAt: nextRecord.leftAt, status: nextRecord.status, workHours: nextRecord.workHours, note: nextRecord.note });
    const name = teachers.find(t => t.id === nextRecord.teacherId)?.name;
    toast({ title: 'Davomat yangilandi', description: `${name} uchun ${selectedDate} sanasi saqlandi` });
    setEditRecord(null);
  };

  const stats = [
    { label: 'Jami ustozlar', value: teachers.length, icon: Users, color: 'text-primary bg-primary/10' },
    { label: 'Kelganlar', value: kelganlar, icon: CheckCircle, color: 'text-success bg-success/10' },
    { label: 'Kechikkanlar', value: kechikkanlar, icon: Clock, color: 'text-warning bg-warning/10' },
    { label: 'Kelmaganlar', value: kelmaganlar, icon: XCircle, color: 'text-destructive bg-destructive/10' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ustozlar Davomati</h1>
          <p className="page-subtitle">Kunlik ish vaqti va davomat nazorati</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <span className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</span>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar mb-6">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-base pl-10" placeholder="Ustoz ismini qidiring..." />
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {(['all', 'kelgan', 'kelmadi'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${statusFilter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {f === 'all' ? 'Barchasi' : f === 'kelgan' ? 'Kelgan' : 'Kelmadi'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="input-base w-auto" />
        </div>
      </div>

      {/* Desktop table */}
      <div className="data-table hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['USTOZ', 'FAN', 'GURUHLAR', 'KELGAN / KETGAN', 'HOLATI', 'ISH SOATI', 'AMALLAR'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ teacher, record }) => {
                const tGroups = getTeacherGroups(teacher.id);
                return (
                  <tr key={teacher.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{teacher.initials}</div>
                        <div>
                          <p className="font-medium text-foreground">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="badge-course">{teacher.subject}</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {tGroups.slice(0, 2).map(g => (
                          <span key={g.id} className="text-xs font-medium bg-accent text-accent-foreground px-1.5 py-0.5 rounded">{g.name.slice(0, 10)}</span>
                        ))}
                        {tGroups.length > 2 && <span className="text-xs text-muted-foreground">+{tGroups.length - 2}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className={`text-sm font-medium ${record.status === 'kelmagan' ? 'text-muted-foreground' : 'text-success'}`}>{record.arrivedAt}</p>
                      <p className="text-xs text-muted-foreground">{record.leftAt}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        record.status === 'kelgan' ? 'bg-success/10 text-success' :
                        record.status === 'kechikkan' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          record.status === 'kelgan' ? 'bg-success' : record.status === 'kechikkan' ? 'bg-warning' : 'bg-destructive'
                        }`} />
                        {record.status === 'kelgan' ? 'Kelgan' : record.status === 'kechikkan' ? 'Kechikkan' : 'Kelmagan'}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-foreground">{record.workHours?.toFixed(1)} s.</td>
                    <td className="p-4">
                      <button onClick={() => setEditRecord({
                        teacherId: teacher.id,
                        arrivedAt: record.arrivedAt === '--:--' ? '08:00' : record.arrivedAt,
                        leftAt: record.leftAt === '--:--' ? '17:00' : record.leftAt,
                        status: record.status, workHours: record.workHours, note: record.note || '',
                      })} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map(({ teacher, record }) => (
          <div key={teacher.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{teacher.initials}</div>
                <div>
                  <p className="font-medium text-foreground">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                </div>
              </div>
              <button onClick={() => setEditRecord({
                teacherId: teacher.id,
                arrivedAt: record.arrivedAt === '--:--' ? '08:00' : record.arrivedAt,
                leftAt: record.leftAt === '--:--' ? '17:00' : record.leftAt,
                status: record.status, workHours: record.workHours, note: record.note || '',
              })} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                record.status === 'kelgan' ? 'bg-success/10 text-success' :
                record.status === 'kechikkan' ? 'bg-warning/10 text-warning' :
                'bg-destructive/10 text-destructive'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  record.status === 'kelgan' ? 'bg-success' : record.status === 'kechikkan' ? 'bg-warning' : 'bg-destructive'
                }`} />
                {record.status === 'kelgan' ? 'Kelgan' : record.status === 'kechikkan' ? 'Kechikkan' : 'Kelmagan'}
              </span>
              <span className="text-sm text-muted-foreground">{record.arrivedAt} — {record.leftAt}</span>
              <span className="text-sm font-medium text-foreground">{record.workHours?.toFixed(1)} s.</span>
            </div>
          </div>
        ))}
      </div>

      {editRecord && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setEditRecord(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Davomatni tahrirlash</h2>
              <button onClick={() => setEditRecord(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Holati</label>
                <select value={editRecord.status} onChange={e => setEditRecord(p => p ? { ...p, status: e.target.value as any } : p)} className="input-base">
                  <option value="kelgan">Kelgan</option>
                  <option value="kechikkan">Kechikkan</option>
                  <option value="kelmagan">Kelmagan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Kelgan vaqti</label>
                  <input type="time" value={editRecord.arrivedAt} disabled={editRecord.status === 'kelmagan'} onChange={e => setEditRecord(p => p ? { ...p, arrivedAt: e.target.value } : p)} className="input-base disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Ketgan vaqti</label>
                  <input type="time" value={editRecord.leftAt} disabled={editRecord.status === 'kelmagan'} onChange={e => setEditRecord(p => p ? { ...p, leftAt: e.target.value } : p)} className="input-base disabled:opacity-50" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ish soati</label>
                <input type="number" value={editRecord.workHours} disabled={editRecord.status === 'kelmagan'} onChange={e => setEditRecord(p => p ? { ...p, workHours: Number(e.target.value) } : p)} className="input-base disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Izoh</label>
                <textarea value={editRecord.note} onChange={e => setEditRecord(p => p ? { ...p, note: e.target.value } : p)} className="input-base resize-none" rows={2} />
              </div>
              <button onClick={handleEditSave} className="w-full btn-primary justify-center py-2.5">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
