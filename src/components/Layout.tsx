import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-3 sm:px-4 sticky top-0 z-30 backdrop-blur-sm bg-card/95">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right">
                <span className="text-sm font-medium text-foreground block leading-tight">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrator' : "O'qituvchi"}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            {children}
          </main>
          <footer className="text-center py-3 text-xs text-muted-foreground border-t border-border">
            © 2024 IT SAF CENTER. Barcha huquqlar himoyalangan.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
