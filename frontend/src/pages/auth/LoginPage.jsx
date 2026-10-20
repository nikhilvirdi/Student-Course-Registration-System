import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useApp();

  useEffect(() => {
    const dest = user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard';
    navigate(dest, { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-center max-w-md bg-card border border-card-border p-8 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Unauthenticated Dev Mode Active</h2>
        <p className="text-sm text-sidebar-fg">
          Authentication is deactivated for development. Redirecting to active dashboard...
        </p>
      </div>
    </div>
  );
}
