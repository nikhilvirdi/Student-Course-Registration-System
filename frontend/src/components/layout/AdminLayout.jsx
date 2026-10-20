import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import AdminSidebar from './AdminSidebar';
import AdminTopNavbar from './AdminTopNavbar';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, switchRole } = useApp();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      switchRole('ADMIN');
    }
  }, [user?.role, switchRole]);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <div className="max-w-[1600px] mx-auto w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
