'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShieldCheck } from 'lucide-react';

/**
 * RegisterPage: In unauthenticated development mode, registration is bypassed
 * and users are automatically directed to the active dashboard.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { user } = useApp();

  useEffect(() => {
    const dest = user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard';
    router.replace(dest);
  }, [user, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-center max-w-md bg-card border border-card-border p-8 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Unauthenticated Dev Mode Active</h2>
        <p className="text-sm text-sidebar-fg">
          Registration is deactivated for development. Redirecting to active dashboard...
        </p>
      </div>
    </div>
  );
}
