import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, switchRole } = useApp();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      switchRole('STUDENT');
    }
  }, [user?.role, switchRole]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
