import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { userAccounts as initialUserAccounts } from '@/data/initialData';

interface User {
  username: string;
  role: 'admin' | 'teacher';
  teacherId: string | null;
  name: string;
}

interface TeacherAuthInput {
  id: string;
  name: string;
  phone: string;
}

interface UserAccount {
  username: string;
  password: string;
  role: 'admin' | 'teacher';
  teacherId: string | null;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createTeacherAccount: (teacher: TeacherAuthInput) => { username: string; password: string };
  syncTeacherAccount: (teacher: TeacherAuthInput) => { username: string; password: string };
  deleteTeacherAccount: (teacherId: string) => void;
}

const USER_KEY = 'edu_crm_user';
const ACCOUNTS_KEY = 'edu_crm_accounts';
const AuthContext = createContext<AuthContextType | null>(null);

function loadOrDefault<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits || phone.trim();
}

function getTeacherCredentials(phone: string) {
  const normalized = normalizePhone(phone);
  return {
    username: normalized,
    password: normalized,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadOrDefault(USER_KEY, null));
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadOrDefault(ACCOUNTS_KEY, initialUserAccounts));

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const login = (username: string, password: string) => {
    const normalizedUsername = username.trim();
    const account = accounts.find(a => a.username === normalizedUsername && a.password === password);
    if (account) {
      setUser({ username: account.username, role: account.role, teacherId: account.teacherId, name: account.name });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const createTeacherAccount = (teacher: TeacherAuthInput) => {
    const credentials = getTeacherCredentials(teacher.phone);
    const newAccount: UserAccount = {
      username: credentials.username,
      password: credentials.password,
      role: 'teacher',
      teacherId: teacher.id,
      name: teacher.name,
    };

    setAccounts(prev => [...prev.filter(account => account.teacherId !== teacher.id), newAccount]);
    return credentials;
  };

  const syncTeacherAccount = (teacher: TeacherAuthInput) => {
    const credentials = getTeacherCredentials(teacher.phone);

    setAccounts(prev => {
      const nextAccount: UserAccount = {
        username: credentials.username,
        password: credentials.password,
        role: 'teacher',
        teacherId: teacher.id,
        name: teacher.name,
      };

      const hasExisting = prev.some(account => account.teacherId === teacher.id);
      const updated = hasExisting
        ? prev.map(account => account.teacherId === teacher.id ? nextAccount : account)
        : [...prev, nextAccount];

      return updated;
    });

    setUser(prev => prev && prev.teacherId === teacher.id
      ? { ...prev, username: credentials.username, name: teacher.name }
      : prev);

    return credentials;
  };

  const deleteTeacherAccount = (teacherId: string) => {
    setAccounts(prev => prev.filter(account => account.teacherId !== teacherId));
    setUser(prev => prev?.teacherId === teacherId ? null : prev);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, createTeacherAccount, syncTeacherAccount, deleteTeacherAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};