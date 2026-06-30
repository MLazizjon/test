import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, FileText, ClipboardCheck, Calendar, ChevronDown, ChevronRight, Plus, Trash2, Check, X, Pencil, Trophy, TrendingUp, BarChart3, GraduationCap, Users, Home, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GroupIcon } from '@/components/GroupIcon';
import { format, startOfWeek } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Topic {
  id: string; groupId: string; date: string; title: string; description: string; completed: boolean;
}
interface TestRecord {
  id: string; groupId: string; weekStart: string; title: string; maxScore: number;
  results: { studentId: string; score: number }[];
}
interface ControlWork {
  id: string; groupId: string; month: string; title: string; maxScore: number;
  results: { studentId: string; score: number }[];
}
interface Homework {
  id: string; groupId: string; date: string; title: string; description: string; deadline: string;
  submissions: { studentId: string; status: 'topshirgan' | 'topshirmagan' | 'kechikkan'; score: number; comment: string }[];
}

function loadLS<T>(key: string, def: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function saveLS(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }

const LessonSchedule = () => {
  const { groups, teachers, students } = useData();
  const { user } = useAuth();

  const visibleGroups = user?.role === 'teacher'
    ? groups.filter(g => g.teacherId === user.teacherId)
    : groups.filter(g => g.status === 'faol');

  const [selectedGroupId, setSelectedGroupId] = useState(visibleGroups[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'mavzular' | 'testlar' | 'nazorat' | 'vazifalar' | 'umumiy'>('mavzular');

  const [topics, setTopics] = useState<Topic[]>(() => loadLS('edu_topics', []));
  const [tests, setTests] = useState<TestRecord[]>(() => loadLS('edu_tests', []));
  const [controls, setControls] = useState<ControlWork[]>(() => loadLS('edu_controls', []));
  const [homeworks, setHomeworks] = useState<Homework[]>(() => loadLS('edu_homeworks', []));

  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [showAddControl, setShowAddControl] = useState(false);
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);

  const [newTopic, setNewTopic] = useState({ date: format(new Date(), 'yyyy-MM-dd'), title: '', description: '' });
  const [newTest, setNewTest] = useState({ title: '', maxScore: 100 });
  const [newControl, setNewControl] = useState({ title: '', maxScore: 100 });
  const [newHomework, setNewHomework] = useState({ title: '', description: '', deadline: format(new Date(), 'yyyy-MM-dd'), maxScore: 10 });

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupStudents = students.filter(s => s.groupId === selectedGroupId && s.status === 'faol');
  const teacher = teachers.find(t => t.id === selectedGroup?.teacherId);

  const groupTopics = useMemo(() => topics.filter(t => t.groupId === selectedGroupId).sort((a, b) => a.date.localeCompare(b.date)), [topics, selectedGroupId]);
  const groupTests = useMemo(() => tests.filter(t => t.groupId === selectedGroupId), [tests, selectedGroupId]);
  const groupControls = useMemo(() => controls.filter(c => c.groupId === selectedGroupId), [controls, selectedGroupId]);
  const groupHomeworks = useMemo(() => homeworks.filter(h => h.groupId === selectedGroupId).sort((a, b) => b.date.localeCompare(a.date)), [homeworks, selectedGroupId]);

  const saveTopics = (next: Topic[]) => { setTopics(next); saveLS('edu_topics', next); };
  const saveTests = (next: TestRecord[]) => { setTests(next); saveLS('edu_tests', next); };
  const saveControls = (next: ControlWork[]) => { setControls(next); saveLS('edu_controls', next); };
  const saveHomeworks = (next: Homework[]) => { setHomeworks(next); saveLS('edu_homeworks', next); };

  const addTopic = () => {
    if (!newTopic.title.trim()) return;
    saveTopics([...topics, { id: `tp_${Date.now()}`, groupId: selectedGroupId, date: newTopic.date, title: newTopic.title, description: newTopic.description, completed: false }]);
    setNewTopic({ date: format(new Date(), 'yyyy-MM-dd'), title: '', description: '' });
    setShowAddTopic(false);
  };
  const toggleTopic = (id: string) => saveTopics(topics.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTopic = (id: string) => saveTopics(topics.filter(t => t.id !== id));
  const updateTopicTitle = (id: string, title: string) => { saveTopics(topics.map(t => t.id === id ? { ...t, title } : t)); setEditingTopic(null); };

  const addTest = () => {
    if (!newTest.title.trim()) return;
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    saveTests([...tests, { id: `ts_${Date.now()}`, groupId: selectedGroupId, weekStart, title: newTest.title, maxScore: newTest.maxScore, results: [] }]);
    setNewTest({ title: '', maxScore: 100 });
    setShowAddTest(false);
  };
  const deleteTest = (id: string) => saveTests(tests.filter(t => t.id !== id));
  const updateTestScore = (testId: string, studentId: string, score: number) => {
    saveTests(tests.map(t => {
      if (t.id !== testId) return t;
      const results = [...t.results];
      const idx = results.findIndex(r => r.studentId === studentId);
      if (idx >= 0) results[idx] = { studentId, score }; else results.push({ studentId, score });
      return { ...t, results };
    }));
  };

  const addControl = () => {
    if (!newControl.title.trim()) return;
    saveControls([...controls, { id: `cw_${Date.now()}`, groupId: selectedGroupId, month: format(new Date(), 'yyyy-MM'), title: newControl.title, maxScore: newControl.maxScore, results: [] }]);
    setNewControl({ title: '', maxScore: 100 });
    setShowAddControl(false);
  };
  const deleteControl = (id: string) => saveControls(controls.filter(c => c.id !== id));
  const updateControlScore = (controlId: string, studentId: string, score: number) => {
    saveControls(controls.map(c => {
      if (c.id !== controlId) return c;
      const results = [...c.results];
      const idx = results.findIndex(r => r.studentId === studentId);
      if (idx >= 0) results[idx] = { studentId, score }; else results.push({ studentId, score });
      return { ...c, results };
    }));
  };

  // Homework CRUD
  const addHomework = () => {
    if (!newHomework.title.trim()) return;
    saveHomeworks([...homeworks, {
      id: `hw_${Date.now()}`, groupId: selectedGroupId, date: format(new Date(), 'yyyy-MM-dd'),
      title: newHomework.title, description: newHomework.description, deadline: newHomework.deadline,
      submissions: [],
    }]);
    setNewHomework({ title: '', description: '', deadline: format(new Date(), 'yyyy-MM-dd'), maxScore: 10 });
    setShowAddHomework(false);
  };
  const deleteHomework = (id: string) => saveHomeworks(homeworks.filter(h => h.id !== id));
  const updateSubmission = (hwId: string, studentId: string, status: 'topshirgan' | 'topshirmagan' | 'kechikkan', score: number, comment: string) => {
    saveHomeworks(homeworks.map(h => {
      if (h.id !== hwId) return h;
      const subs = [...h.submissions];
      const idx = subs.findIndex(s => s.studentId === studentId);
      if (idx >= 0) subs[idx] = { studentId, status, score, comment }; else subs.push({ studentId, status, score, comment });
      return { ...h, submissions: subs };
    }));
  };

  // Stats
  const completedTopics = groupTopics.filter(t => t.completed).length;
  const avgTestScore = groupTests.length ? Math.round(groupTests.reduce((sum, t) => {
    const avg = t.results.length ? t.results.reduce((s, r) => s + r.score, 0) / t.results.length : 0;
    return sum + avg;
  }, 0) / groupTests.length) : 0;
  const avgControlScore = groupControls.length ? Math.round(groupControls.reduce((sum, c) => {
    const avg = c.results.length ? c.results.reduce((s, r) => s + r.score, 0) / c.results.length : 0;
    return sum + avg;
  }, 0) / groupControls.length) : 0;
  const hwSubmitted = groupHomeworks.reduce((s, h) => s + h.submissions.filter(sub => sub.status === 'topshirgan').length, 0);
  const hwTotal = groupHomeworks.length * groupStudents.length;

  const tabs = [
    { key: 'mavzular' as const, label: 'Mavzular', icon: BookOpen },
    { key: 'vazifalar' as const, label: 'Uyga Vazifalar', icon: Home },
    { key: 'testlar' as const, label: 'Haftalik Testlar', icon: FileText },
    { key: 'nazorat' as const, label: 'Nazorat Ishlari', icon: ClipboardCheck },
    { key: 'umumiy' as const, label: 'Umumiy Statistika', icon: BarChart3 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Calendar className="h-6 w-6 text-primary" /> Darslar Jadvali</h1>
          <p className="text-sm text-muted-foreground mt-1">Mavzular, vazifalar, testlar va nazorat ishlarini boshqaring</p>
        </div>
      </div>

      {/* Group selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {visibleGroups.map(g => (
          <button key={g.id} onClick={() => setSelectedGroupId(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedGroupId === g.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border text-muted-foreground hover:bg-accent'}`}>
            <GroupIcon name={g.icon} className="h-4 w-4" /> {g.name}
          </button>
        ))}
      </div>

      {selectedGroup && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Mavzular', value: `${completedTopics}/${groupTopics.length}`, icon: BookOpen, color: 'text-primary bg-primary/10' },
              { label: 'Vazifalar', value: `${hwSubmitted}/${hwTotal || 0}`, icon: Home, color: 'text-accent-foreground bg-accent/10' },
              { label: 'Testlar', value: groupTests.length, icon: FileText, color: 'text-primary bg-primary/10' },
              { label: "O'rtacha test", value: avgTestScore, icon: TrendingUp, color: 'text-warning bg-warning/10' },
              { label: "Nazorat o'rtacha", value: avgControlScore, icon: Trophy, color: 'text-success bg-success/10' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Group info */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4 text-sm">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-primary">
              <GroupIcon name={selectedGroup.icon} className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{selectedGroup.name}</p>
              <p className="text-muted-foreground">{selectedGroup.course}</p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="text-muted-foreground"><Calendar className="h-4 w-4 inline mr-1" />{selectedGroup.days} • {selectedGroup.time}</div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="text-muted-foreground flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {teacher?.name || '-'}</div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="text-muted-foreground flex items-center gap-1"><Users className="h-4 w-4" /> {groupStudents.length} ta talaba</div>
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
            {/* ===== MAVZULAR ===== */}
            {activeTab === 'mavzular' && (
              <motion.div key="mavzular" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Kunlik Mavzular</h2>
                  <button onClick={() => setShowAddTopic(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" /> Mavzu qo'shish
                  </button>
                </div>
                {showAddTopic && (
                  <div className="bg-card border border-border rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="date" value={newTopic.date} onChange={e => setNewTopic(p => ({ ...p, date: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                      <input placeholder="Mavzu nomi" value={newTopic.title} onChange={e => setNewTopic(p => ({ ...p, title: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                      <input placeholder="Qo'shimcha izoh" value={newTopic.description} onChange={e => setNewTopic(p => ({ ...p, description: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={addTopic} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Saqlash</button>
                      <button onClick={() => setShowAddTopic(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Bekor</button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {groupTopics.length === 0 && <p className="text-center text-muted-foreground py-8">Hali mavzu qo'shilmagan</p>}
                  {groupTopics.map((topic, i) => (
                    <motion.div key={topic.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${topic.completed ? 'bg-success/5 border-emerald-500/20' : 'bg-card border-border'}`}>
                      <button onClick={() => toggleTopic(topic.id)} className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${topic.completed ? 'bg-success border-emerald-500 text-white' : 'border-muted-foreground/30 hover:border-primary'}`}>
                        {topic.completed && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <div className="text-xs text-muted-foreground shrink-0 w-24">{topic.date}</div>
                      <div className="flex-1 min-w-0">
                        {editingTopic === topic.id ? (
                          <input autoFocus defaultValue={topic.title}
                            onBlur={e => updateTopicTitle(topic.id, e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && updateTopicTitle(topic.id, (e.target as HTMLInputElement).value)}
                            className="px-2 py-1 rounded border border-border bg-background text-foreground text-sm w-full" />
                        ) : (
                          <p className={`text-sm font-medium ${topic.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{topic.title}</p>
                        )}
                        {topic.description && <p className="text-xs text-muted-foreground">{topic.description}</p>}
                      </div>
                      <button onClick={() => setEditingTopic(topic.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteTopic(topic.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== UYGA VAZIFALAR ===== */}
            {activeTab === 'vazifalar' && (
              <motion.div key="vazifalar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Uyga Vazifalar</h2>
                  <button onClick={() => setShowAddHomework(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" /> Vazifa berish
                  </button>
                </div>
                {showAddHomework && (
                  <div className="bg-card border border-border rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input placeholder="Vazifa nomi" value={newHomework.title} onChange={e => setNewHomework(p => ({ ...p, title: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                      <input type="date" value={newHomework.deadline} onChange={e => setNewHomework(p => ({ ...p, deadline: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                    </div>
                    <textarea placeholder="Vazifa tavsifi (ixtiyoriy)" value={newHomework.description} onChange={e => setNewHomework(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 mt-3 rounded-lg border border-border bg-background text-foreground text-sm resize-none" />
                    <div className="flex gap-2 mt-3">
                      <button onClick={addHomework} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Saqlash</button>
                      <button onClick={() => setShowAddHomework(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Bekor</button>
                    </div>
                  </div>
                )}
                {groupHomeworks.length === 0 && <p className="text-center text-muted-foreground py-8">Hali vazifa berilmagan</p>}
                {groupHomeworks.map(hw => (
                  <HomeworkCard key={hw.id} homework={hw} students={groupStudents} onUpdateSubmission={updateSubmission} onDelete={deleteHomework} />
                ))}
              </motion.div>
            )}

            {/* ===== TESTLAR ===== */}
            {activeTab === 'testlar' && (
              <motion.div key="testlar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Haftalik Testlar</h2>
                  <button onClick={() => setShowAddTest(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" /> Test qo'shish
                  </button>
                </div>
                {showAddTest && (
                  <div className="bg-card border border-border rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input placeholder="Test nomi" value={newTest.title} onChange={e => setNewTest(p => ({ ...p, title: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                      <input type="number" placeholder="Maksimal ball" value={newTest.maxScore} onChange={e => setNewTest(p => ({ ...p, maxScore: Number(e.target.value) }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={addTest} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Saqlash</button>
                      <button onClick={() => setShowAddTest(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Bekor</button>
                    </div>
                  </div>
                )}
                {groupTests.length === 0 && <p className="text-center text-muted-foreground py-8">Hali test qo'shilmagan</p>}
                {groupTests.map(test => (
                  <TestCard key={test.id} test={test} students={groupStudents} onUpdateScore={updateTestScore} onDelete={deleteTest} />
                ))}
              </motion.div>
            )}

            {/* ===== NAZORAT ===== */}
            {activeTab === 'nazorat' && (
              <motion.div key="nazorat" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Oylik Nazorat Ishlari</h2>
                  <button onClick={() => setShowAddControl(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" /> Nazorat qo'shish
                  </button>
                </div>
                {showAddControl && (
                  <div className="bg-card border border-border rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input placeholder="Nazorat ishi nomi" value={newControl.title} onChange={e => setNewControl(p => ({ ...p, title: e.target.value }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                      <input type="number" placeholder="Maksimal ball" value={newControl.maxScore} onChange={e => setNewControl(p => ({ ...p, maxScore: Number(e.target.value) }))} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={addControl} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Saqlash</button>
                      <button onClick={() => setShowAddControl(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Bekor</button>
                    </div>
                  </div>
                )}
                {groupControls.length === 0 && <p className="text-center text-muted-foreground py-8">Hali nazorat ishi qo'shilmagan</p>}
                {groupControls.map(ctrl => (
                  <ControlCard key={ctrl.id} control={ctrl} students={groupStudents} onUpdateScore={updateControlScore} onDelete={deleteControl} />
                ))}
              </motion.div>
            )}

            {/* ===== UMUMIY STATISTIKA ===== */}
            {activeTab === 'umumiy' && (
              <motion.div key="umumiy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <h2 className="text-lg font-semibold text-foreground mb-4">Talabalar Reytingi</h2>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Talaba</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Test o'rt.</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Nazorat o'rt.</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Vazifa %</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Umumiy</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Daraja</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupStudents.map((student, i) => {
                          const testScores = groupTests.map(t => t.results.find(r => r.studentId === student.id)?.score || 0);
                          const controlScores = groupControls.map(c => c.results.find(r => r.studentId === student.id)?.score || 0);
                          const avgTest = testScores.length ? Math.round(testScores.reduce((a, b) => a + b, 0) / testScores.length) : 0;
                          const avgControl = controlScores.length ? Math.round(controlScores.reduce((a, b) => a + b, 0) / controlScores.length) : 0;
                          const hwDone = groupHomeworks.filter(h => h.submissions.find(s => s.studentId === student.id && s.status === 'topshirgan')).length;
                          const hwPercent = groupHomeworks.length ? Math.round(hwDone / groupHomeworks.length * 100) : 0;
                          const overall = Math.round((avgTest * 0.4 + avgControl * 0.4 + hwPercent * 0.2));
                          const grade = overall >= 85 ? "A'lo" : overall >= 70 ? 'Yaxshi' : overall >= 55 ? 'Qoniqarli' : 'Yomon';
                          const gradeColor = overall >= 85 ? 'text-success bg-success/10' : overall >= 70 ? 'text-primary bg-primary/10' : overall >= 55 ? 'text-warning bg-warning/10' : 'text-red-600 bg-destructive/10';
                          return (
                            <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                              <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                              <td className="px-4 py-3 text-center">{avgTest}</td>
                              <td className="px-4 py-3 text-center">{avgControl}</td>
                              <td className="px-4 py-3 text-center">{hwPercent}%</td>
                              <td className="px-4 py-3 text-center font-bold">{overall}</td>
                              <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${gradeColor}`}>{grade}</span></td>
                            </tr>
                          );
                        })}
                        {groupStudents.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Talabalar topilmadi</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

// --- Homework Card ---
function HomeworkCard({ homework, students, onUpdateSubmission, onDelete }: {
  homework: Homework;
  students: { id: string; name: string }[];
  onUpdateSubmission: (hwId: string, studentId: string, status: 'topshirgan' | 'topshirmagan' | 'kechikkan', score: number, comment: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const submitted = homework.submissions.filter(s => s.status === 'topshirgan').length;
  const late = homework.submissions.filter(s => s.status === 'kechikkan').length;
  const isOverdue = new Date(homework.deadline) < new Date();

  return (
    <div className="bg-card border border-border rounded-xl mb-3 overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <Home className="h-5 w-5 text-accent-foreground" />
          <div>
            <p className="font-medium text-foreground">{homework.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Berildi: {homework.date}</span>
              <span>•</span>
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
                <Clock className="h-3 w-3" /> Muddat: {homework.deadline}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> {submitted}</span>
            {late > 0 && <span className="flex items-center gap-1 text-warning"><AlertCircle className="h-3.5 w-3.5" /> {late}</span>}
            <span className="text-muted-foreground">/ {students.length}</span>
          </div>
          <button onClick={e => { e.stopPropagation(); onDelete(homework.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {homework.description && !expanded && (
        <div className="px-4 pb-3 -mt-1"><p className="text-xs text-muted-foreground">{homework.description}</p></div>
      )}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-border px-4 pb-4">
              {homework.description && <p className="text-sm text-muted-foreground mt-3 mb-2 p-3 bg-muted/50 rounded-lg">{homework.description}</p>}
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-2">Talaba</th>
                    <th className="text-center py-2 w-36">Holati</th>
                    <th className="text-center py-2 w-24">Ball</th>
                    <th className="text-left py-2 w-40">Izoh</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const sub = homework.submissions.find(sub => sub.studentId === s.id);
                    const status = sub?.status || 'topshirmagan';
                    const score = sub?.score ?? 0;
                    const comment = sub?.comment || '';
                    return (
                      <tr key={s.id} className="border-t border-border/30">
                        <td className="py-2 text-foreground">{s.name}</td>
                        <td className="py-2 text-center">
                          <div className="flex justify-center gap-1">
                            {(['topshirgan', 'kechikkan', 'topshirmagan'] as const).map(st => (
                              <button key={st} onClick={() => onUpdateSubmission(homework.id, s.id, st, score, comment)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  status === st
                                    ? st === 'topshirgan' ? 'bg-success text-white' : st === 'kechikkan' ? 'bg-warning text-white' : 'bg-destructive text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}>
                                {st === 'topshirgan' ? '✓' : st === 'kechikkan' ? '⏰' : '✗'}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <input type="number" min={0} max={10} value={score}
                            onChange={e => onUpdateSubmission(homework.id, s.id, status, Number(e.target.value), comment)}
                            className="w-16 px-2 py-1 rounded border border-border bg-background text-foreground text-center text-sm" />
                        </td>
                        <td className="py-2">
                          <input placeholder="Izoh..." value={comment}
                            onChange={e => onUpdateSubmission(homework.id, s.id, status, score, e.target.value)}
                            className="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Test Card ---
function TestCard({ test, students, onUpdateScore, onDelete }: {
  test: TestRecord; students: { id: string; name: string }[];
  onUpdateScore: (testId: string, studentId: string, score: number) => void; onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const avg = test.results.length ? Math.round(test.results.reduce((s, r) => s + r.score, 0) / test.results.length) : 0;
  return (
    <div className="bg-card border border-border rounded-xl mb-3 overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">{test.title}</p>
            <p className="text-xs text-muted-foreground">Hafta: {test.weekStart} • Maks: {test.maxScore} ball</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">O'rtacha: <b className="text-foreground">{avg}</b></span>
          <button onClick={e => { e.stopPropagation(); onDelete(test.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-border px-4 pb-4">
              <table className="w-full text-sm mt-3">
                <thead><tr className="text-muted-foreground"><th className="text-left py-2">Talaba</th><th className="text-center py-2 w-32">Ball</th></tr></thead>
                <tbody>
                  {students.map(s => {
                    const score = test.results.find(r => r.studentId === s.id)?.score ?? '';
                    return (
                      <tr key={s.id} className="border-t border-border/30">
                        <td className="py-2 text-foreground">{s.name}</td>
                        <td className="py-2 text-center">
                          <input type="number" min={0} max={test.maxScore} value={score}
                            onChange={e => onUpdateScore(test.id, s.id, Number(e.target.value))} placeholder="—"
                            className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground text-center text-sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Control Card ---
function ControlCard({ control, students, onUpdateScore, onDelete }: {
  control: ControlWork; students: { id: string; name: string }[];
  onUpdateScore: (controlId: string, studentId: string, score: number) => void; onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const avg = control.results.length ? Math.round(control.results.reduce((s, r) => s + r.score, 0) / control.results.length) : 0;
  return (
    <div className="bg-card border border-border rounded-xl mb-3 overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <ClipboardCheck className="h-5 w-5 text-warning" />
          <div>
            <p className="font-medium text-foreground">{control.title}</p>
            <p className="text-xs text-muted-foreground">Oy: {control.month} • Maks: {control.maxScore} ball</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">O'rtacha: <b className="text-foreground">{avg}</b></span>
          <button onClick={e => { e.stopPropagation(); onDelete(control.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-border px-4 pb-4">
              <table className="w-full text-sm mt-3">
                <thead><tr className="text-muted-foreground"><th className="text-left py-2">Talaba</th><th className="text-center py-2 w-32">Ball</th></tr></thead>
                <tbody>
                  {students.map(s => {
                    const score = control.results.find(r => r.studentId === s.id)?.score ?? '';
                    return (
                      <tr key={s.id} className="border-t border-border/30">
                        <td className="py-2 text-foreground">{s.name}</td>
                        <td className="py-2 text-center">
                          <input type="number" min={0} max={control.maxScore} value={score}
                            onChange={e => onUpdateScore(control.id, s.id, Number(e.target.value))} placeholder="—"
                            className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground text-center text-sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LessonSchedule;
