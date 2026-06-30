import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft, Phone, BookOpen, Users, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TeacherProfile = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const { teachers, groups, students, teacherAttendance } = useData();

  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) return <div className="p-8 text-center text-muted-foreground">Ustoz topilmadi yoki o'chirilgan</div>;

  const teacherGroups = groups.filter(g => g.teacherId === teacherId);
  const teacherStudentCount = students.filter(s => teacherGroups.some(g => g.id === s.groupId)).length;
  const recentAttendance = teacherAttendance.filter(r => r.teacherId === teacherId).slice(-30);
  const kelgan = recentAttendance.filter(r => r.status === 'kelgan').length;
  const kechikkan = recentAttendance.filter(r => r.status === 'kechikkan').length;
  const kelmagan = recentAttendance.filter(r => r.status === 'kelmagan').length;
  const totalHours = recentAttendance.reduce((sum, r) => sum + (r.workHours || 0), 0);

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/teachers')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Orqaga
      </button>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {teacher.initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{teacher.name}</h1>
            <p className="text-muted-foreground mt-1">{teacher.subject}</p>
            <div className="flex items-center gap-6 mt-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> {teacher.phone}
              </span>
              <span className={teacher.status === 'faol' ? 'badge-active' : 'badge-pending'}>
                {teacher.status === 'faol' ? 'FAOL' : 'DAM OLISHDA'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Guruhlar soni', value: teacherGroups.length, icon: BookOpen, color: 'text-primary' },
          { label: 'Talabalar soni', value: teacherStudentCount, icon: Users, color: 'text-success' },
          { label: 'Jami ish soati', value: totalHours.toFixed(1), icon: Clock, color: 'text-warning' },
          { label: 'Davomat (kelgan)', value: `${kelgan}/${recentAttendance.length}`, icon: Calendar, color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-accent flex items-center justify-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <span className="text-xl font-bold text-foreground">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Guruhlar ro'yxati</h3>
          <div className="space-y-3">
            {teacherGroups.map(g => {
              const count = students.filter(s => s.groupId === g.id).length;
              return (
                <div key={g.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/attendance/${g.id}`)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.days} • {g.time}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{count}/{g.maxStudents}</span>
                      <p className="text-xs text-muted-foreground">talaba</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {teacherGroups.length === 0 && <p className="text-sm text-muted-foreground">Guruhlar topilmadi</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Davomat tarixi</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-success/10 text-center">
              <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-lg font-bold text-success">{kelgan}</p>
              <p className="text-xs text-muted-foreground">Kelgan</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 text-center">
              <AlertCircle className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="text-lg font-bold text-warning">{kechikkan}</p>
              <p className="text-xs text-muted-foreground">Kechikkan</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-lg font-bold text-destructive">{kelmagan}</p>
              <p className="text-xs text-muted-foreground">Kelmagan</p>
            </div>
          </div>
          <div className="space-y-2">
            {recentAttendance.slice(-5).reverse().map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">{r.date}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  r.status === 'kelgan' ? 'bg-success/10 text-success' :
                  r.status === 'kechikkan' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                }`}>
                  {r.status === 'kelgan' ? 'Kelgan' : r.status === 'kechikkan' ? 'Kechikkan' : 'Kelmagan'}
                </span>
                <span className="text-sm text-muted-foreground">{r.workHours}s</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
