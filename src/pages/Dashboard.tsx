import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Layers, CalendarCheck, GraduationCap, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Dashboard = () => {
  const { students, groups, teachers } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dayFilter, setDayFilter] = useState<'toq' | 'juft'>('toq');

  const activeStudents = students.filter(s => s.status === 'faol').length;
  const activeGroups = groups.filter(g => g.status === 'faol').length;
  const activeTeachers = teachers.filter(t => t.status === 'faol').length;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const isOddDay = [1, 3, 5].includes(dayOfWeek);
  const isEvenDay = [2, 4, 6].includes(dayOfWeek);

  const oddDayGroups = groups.filter(g => g.status === 'faol' && g.days.includes('Dush'));
  const evenDayGroups = groups.filter(g => g.status === 'faol' && g.days.includes('Sesh'));

  const filteredGroups = dayFilter === 'toq' ? oddDayGroups : evenDayGroups;
  const todayLessons = isOddDay ? oddDayGroups.length : isEvenDay ? evenDayGroups.length : 0;

  const getTeacherName = (teacherId: string) => teachers.find(t => t.id === teacherId)?.name || '';
  const getTeacherInitials = (teacherId: string) => teachers.find(t => t.id === teacherId)?.initials || '';

  const stats = [
    { label: 'Faol talabalar', value: activeStudents, icon: Users, color: 'text-primary bg-primary/10' },
    { label: 'Faol guruhlar', value: activeGroups, icon: Layers, color: 'text-warning bg-warning/10' },
    { label: 'Bugungi darslar', value: todayLessons, icon: CalendarCheck, color: 'text-success bg-success/10' },
    { label: 'Faol ustozlar', value: activeTeachers, icon: GraduationCap, color: 'text-accent-foreground bg-accent' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Boshqaruv Paneli</h1>
        <p className="page-subtitle">Xush kelibsiz, {user?.name}! Bugungi faoliyat ko'rsatkichlari.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card flex items-center gap-3 sm:gap-4">
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">{stat.label}</p>
              <span className="text-xl sm:text-3xl font-bold text-foreground">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="data-table">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Bugungi dars jadvali</h2>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setDayFilter('toq')}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${dayFilter === 'toq' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Toq kunlar
            </button>
            <button
              onClick={() => setDayFilter('juft')}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${dayFilter === 'juft' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Juft kunlar
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">VAQT</th>
                <th className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">GURUH</th>
                <th className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">KURS</th>
                <th className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">O'QITUVCHI</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <tr key={group.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/attendance/${group.id}`)}>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
                      <Clock className="h-3 w-3" /> {group.time}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-foreground">{group.name}</td>
                  <td className="p-4 text-muted-foreground">{group.course}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {getTeacherInitials(group.teacherId)}
                      </div>
                      <span className="text-foreground">{getTeacherName(group.teacherId)}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGroups.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Bu kun uchun darslar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-border">
          {filteredGroups.map((group) => (
            <div key={group.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/attendance/${group.id}`)}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{group.name}</span>
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">{group.time}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{group.course}</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {getTeacherInitials(group.teacherId)}
                  </div>
                  <span className="text-xs text-muted-foreground">{getTeacherName(group.teacherId)}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Bu kun uchun darslar topilmadi</div>
          )}
        </div>

        <div className="p-4 text-center border-t border-border">
          <button onClick={() => navigate('/groups')} className="text-primary text-sm font-medium hover:underline">
            To'liq jadvalni ko'rish →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
