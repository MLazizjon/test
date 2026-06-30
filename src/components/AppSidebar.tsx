import { LayoutDashboard, Users, GraduationCap, Layers, ClipboardList, Settings, LogOut, CalendarDays, Wallet } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import logoImg from '@/assets/logo.png';

const adminItems = [
  { title: 'Boshqaruv Paneli', url: '/', icon: LayoutDashboard },
  { title: 'Talabalar Bazasi', url: '/students', icon: Users },
  { title: "O'qituvchilar", url: '/teachers', icon: GraduationCap },
  { title: 'Guruhlar', url: '/groups', icon: Layers },
  { title: 'Ustozlar Davomati', url: '/teacher-attendance', icon: ClipboardList },
  { title: 'Darslar Jadvali', url: '/lesson-schedule', icon: CalendarDays },
  { title: 'Moliya', url: '/finance', icon: Wallet },
  { title: 'Sozlamalar', url: '/settings', icon: Settings },
];

const teacherItems = [
  { title: 'Guruhlar', url: '/groups', icon: Layers },
  { title: 'Darslar Jadvali', url: '/lesson-schedule', icon: CalendarDays },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { settings } = useData();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const items = user?.role === 'admin' ? adminItems : teacherItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="h-8 w-8 object-contain" />
            <div>
              <h1 className="text-sm font-bold text-foreground">{settings.centerName}</h1>
              <p className="text-xs text-muted-foreground">O'quv markazi boshqaruvi</p>
            </div>
          </div>
        )}
        {collapsed && <img src={logoImg} alt="Logo" className="h-8 w-8 object-contain mx-auto" />}
      </div>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/'} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-border">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Chiqish</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
