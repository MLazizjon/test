import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Settings as SettingsIcon, Building, Bell, Cog, Users, Save, MessageSquare, BellRing, CreditCard } from 'lucide-react';
import logoImg from '@/assets/logo.png';

const SettingsPage = () => {
  const { settings, updateSettings, teachers, getCurrencySymbol } = useData();
  const [local, setLocal] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState('markaz');

  useEffect(() => {
    setLocal({ ...settings });
  }, [settings]);

  const handleSave = () => updateSettings(local);
  const handleCancel = () => setLocal({ ...settings });

  const tabs = [
    { key: 'markaz', label: "Markaz ma'lumotlari", icon: Building },
    { key: 'bildirishnoma', label: 'Bildirishnomalar', icon: Bell },
    { key: 'konfiguratsiya', label: 'Konfiguratsiya', icon: Cog },
    { key: 'rollar', label: 'Foydalanuvchi rollari', icon: Users },
  ];

  const faolTeachers = teachers.filter(t => t.status === 'faol').length;

  const roles = [
    { name: 'Administrator', count: '1 ta xodim', level: "TO'LIQ RUXSAT", color: 'bg-primary/10 text-primary' },
    { name: "O'qituvchi", count: `${faolTeachers} ta xodim`, level: 'CHEKLANGAN', color: 'bg-success/10 text-success' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Tizim Sozlamalari</h1>
            <p className="page-subtitle">Markaz parametrlari va boshqaruv paneli</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCancel} className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted">Bekor qilish</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Save className="h-4 w-4" /> O'zgarishlarni saqlash
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'markaz' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Markaz ma'lumotlari</h2>
          <p className="text-sm text-muted-foreground mb-6">Asosiy markaz rekvizitlari va aloqa ma'lumotlari</p>
          <div className="flex gap-6">
            <div className="w-32 h-32 border-2 border-border rounded-xl flex items-center justify-center overflow-hidden bg-background">
              <img src={logoImg} alt="IT SAF CENTER logo" className="w-full h-full object-contain p-2" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Markaz nomi</label>
                <input value={local.centerName} onChange={e => setLocal(p => ({ ...p, centerName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">INN / STIR</label>
                <input value={local.inn} onChange={e => setLocal(p => ({ ...p, inn: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon raqami</label>
                <input value={local.phone} onChange={e => setLocal(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Email manzili</label>
                <input value={local.email} onChange={e => setLocal(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1">Yuridik manzil</label>
                <input value={local.address} onChange={e => setLocal(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bildirishnoma' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Bildirishnomalar</h2>
          <p className="text-sm text-muted-foreground mb-6">Avtomatlashtirilgan xabarlar</p>
          <div className="space-y-4">
            {[
              { key: 'smsEnabled', label: 'SMS xabarnomalar', desc: 'Avtomatik SMS yuborish', Icon: MessageSquare },
              { key: 'telegramEnabled', label: 'Telegram bot', desc: 'Bot orqali xabardor qilish', Icon: MessageSquare },
              { key: 'paymentReminder', label: "To'lov eslatmalari", desc: 'Qarzdorlik haqida eslatish', Icon: BellRing },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-primary">
                    <item.Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLocal(p => ({ ...p, [item.key]: !(p as any)[item.key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${(local as any)[item.key] ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${(local as any)[item.key] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'konfiguratsiya' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Tizim konfiguratsiyasi</h2>
          <p className="text-sm text-muted-foreground mb-6">O'quv jarayoni parametrlari</p>

          <div className="mb-4 p-3 rounded-lg bg-accent/50 text-sm text-accent-foreground">
            Joriy valyuta: <strong>{local.currency} ({getCurrencySymbol()})</strong> — bu butun tizimda qo'llaniladi.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground tracking-wider block mb-1">VALYUTA</label>
              <select value={local.currency} onChange={e => setLocal(p => ({ ...p, currency: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="UZS">UZS (O'zbek so'mi)</option>
                <option value="USD">USD (Dollar)</option>
                <option value="EUR">EUR (Yevro)</option>
                <option value="RUB">RUB (Rubl)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground tracking-wider block mb-1">DARS VAQTI (DAQ.)</label>
              <input type="number" value={local.lessonDuration} onChange={e => setLocal(p => ({ ...p, lessonDuration: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground tracking-wider block mb-1">ISH BOSHLANISHI</label>
              <input type="time" value={local.workStart} onChange={e => setLocal(p => ({ ...p, workStart: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground tracking-wider block mb-1">DAM OLISH KUNI</label>
              <select value={local.dayOff} onChange={e => setLocal(p => ({ ...p, dayOff: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                {['Yakshanba', 'Shanba', 'Dushanba'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rollar' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Foydalanuvchi rollari</h2>
            <p className="text-sm text-muted-foreground">Kirish huquqlari va ruxsatnomalar</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['ROL NOMI', 'XODIMLAR SONI', 'RUXSAT DARAJASI'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.name} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-foreground">{role.name}</td>
                  <td className="p-4 text-muted-foreground">{role.count}</td>
                  <td className="p-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.color}`}>{role.level}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
