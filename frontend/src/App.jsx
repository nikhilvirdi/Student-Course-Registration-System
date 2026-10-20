import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ui/Toast';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Student Pages
import StudentDashboardPage from '@/pages/student/DashboardPage';
import StudentCoursesPage from '@/pages/student/CoursesPage';
import StudentGradesPage from '@/pages/student/GradesPage';
import StudentTasksPage from '@/pages/student/TasksPage';
import StudentActivityPage from '@/pages/student/ActivityPage';
import StudentNotificationsPage from '@/pages/student/NotificationsPage';
import StudentDocumentsPage from '@/pages/student/DocumentsPage';
import StudentProfilePage from '@/pages/student/ProfilePage';
import StudentSettingsPage from '@/pages/student/SettingsPage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminStudentsPage from '@/pages/admin/AdminStudentsPage';
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage';
import AdminEnrollmentsPage from '@/pages/admin/AdminEnrollmentsPage';
import AdminGradesPage from '@/pages/admin/AdminGradesPage';
import AdminActivityPage from '@/pages/admin/AdminActivityPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminDocumentsPage from '@/pages/admin/AdminDocumentsPage';
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Student Routes with DashboardLayout */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<StudentDashboardPage />} />
                <Route path="courses" element={<StudentCoursesPage />} />
                <Route path="grades" element={<StudentGradesPage />} />
                <Route path="tasks" element={<StudentTasksPage />} />
                <Route path="activity" element={<StudentActivityPage />} />
                <Route path="notifications" element={<StudentNotificationsPage />} />
                <Route path="documents" element={<StudentDocumentsPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="settings" element={<StudentSettingsPage />} />
              </Route>

              {/* Admin Routes with AdminLayout */}
              <Route path="/dashboard/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="enrollments" element={<AdminEnrollmentsPage />} />
                <Route path="grades" element={<AdminGradesPage />} />
                <Route path="activity" element={<AdminActivityPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="documents" element={<AdminDocumentsPage />} />
                <Route path="notifications" element={<AdminNotificationsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Auth routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
