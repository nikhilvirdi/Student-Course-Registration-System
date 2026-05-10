'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopNavbar from './AdminTopNavbar';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
