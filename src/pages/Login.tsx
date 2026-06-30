import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import logoImg from '@/assets/logo.png';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (!login(username, password)) {
        setError("Login yoki parol noto'g'ri");
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4 shadow-sm">
            <img src={logoImg} alt="IT SAF CENTER" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">IT SAF CENTER</h1>
          <p className="text-muted-foreground text-sm mt-1">O'quv markazi boshqaruv tizimi</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Login</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              className="input-base"
              placeholder="admin yoki telefon raqam"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Parol</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="input-base pr-10"
                placeholder="••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-2.5 disabled:opacity-70"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <><LogIn className="h-4 w-4" /> Kirish</>
            )}
          </button>
        </form>
        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Test akkauntlar</p>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Admin: <span className="font-mono text-foreground bg-background px-1.5 py-0.5 rounded">admin / admin123</span></p>
            <p className="text-xs text-muted-foreground">Ustoz: <span className="font-mono text-foreground bg-background px-1.5 py-0.5 rounded">998901234567 / 998901234567</span></p>
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">O'qituvchi login = telefon raqamidagi raqamlar</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
