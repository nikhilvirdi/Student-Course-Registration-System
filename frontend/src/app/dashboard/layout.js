'use client';

import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminLayout from '../../components/layout/AdminLayout';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import { useApp } from '@/context/AppContext';

export default function AppDashboardLayout({ children }) {
  const { user } = useApp();

  return (
    <ProtectedRoute>
      {user?.role === 'ADMIN' ? (
        <AdminLayout>{children}</AdminLayout>
      ) : (
        <DashboardLayout>{children}</DashboardLayout>
      )}
    </ProtectedRoute>
  );
}
