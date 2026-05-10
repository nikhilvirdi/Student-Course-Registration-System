import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/layout/ProtectedRoute';

export default function AppDashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
