'use client';

import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user } = useApp();
  const router = useRouter();

  // Redirect if not admin, but also show a clean unauthorized state during transition
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-sidebar-fg max-w-md mx-auto mb-8">
          You do not have the required administrative privileges to view this area. 
          If you believe this is an error, please contact IT support.
        </p>
        <Link 
          href="/dashboard"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
