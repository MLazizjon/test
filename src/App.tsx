import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Layout } from "@/components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Groups from "./pages/Groups";
import Attendance from "./pages/Attendance";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherProfile from "./pages/TeacherProfile";
import SettingsPage from "./pages/Settings";
import LessonSchedule from "./pages/LessonSchedule";
import Finance from "./pages/Finance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={user.role === 'admin' ? <Dashboard /> : <Groups />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/attendance/:groupId" element={<Attendance />} />
          <Route path="/teacher/:teacherId" element={<TeacherProfile />} />
          <Route path="/teacher-attendance" element={<TeacherAttendance />} />
          <Route path="/lesson-schedule" element={<LessonSchedule />} />
          <Route path="/finance" element={user.role === 'admin' ? <Finance /> : <Groups />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </DataProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
