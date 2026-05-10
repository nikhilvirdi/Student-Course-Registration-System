'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Activity, 
  Settings, 
  Users, 
  LogOut,
  ShieldCheck,
  Plus,
  Award,
  ChevronRight,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

const adminNavItems = [
  { name: 'Console Home', href: '/dashboard', icon: LayoutDashboard },
  { 
    group: 'Management',
    items: [
      { name: 'Students', href: '/dashboard/admin/students', icon: Users },
      { name: 'Courses', href: '/dashboard/admin/courses', icon: BookOpen },
      { name: 'Enrollments', href: '/dashboard/admin/enrollments', icon: GraduationCap },
      { name: 'Grades', href: '/dashboard/admin/grades', icon: Award },
    ]
  },
  { 
    group: 'Operations',
    items: [
      { name: 'Audit Logs', href: '/dashboard/admin/activity', icon: Activity },
      { name: 'System Stats', href: '/dashboard/admin/stats', icon: Database },
    ]
  }
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0f172a] text-slate-300 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo area */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tighter leading-none">SCRS</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {adminNavItems.map((group, idx) => (
            <div key={idx} className="space-y-2">
              {group.group && (
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">
                  {group.group}
                </div>
              )}
              
              <div className="space-y-1">
                {(group.items || [group]).map((item) => {
                  const isActive = item.href === '/dashboard' 
                    ? pathname === '/dashboard' || pathname === '/dashboard/'
                    : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group relative",
                        isActive 
                          ? "bg-indigo-600/10 text-white shadow-sm" 
                          : "hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                      )}
                      <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                      {item.name}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-6 border-t border-slate-800/50 bg-slate-900/50">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800/50 transition-all mb-4 group">
            <Settings className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
            Settings
          </Link>

          {/* User Profile Section */}
          <div className="flex items-center gap-3 px-2 py-3 rounded-2xl bg-slate-800/30 border border-slate-700/30 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-indigo-400 font-semibold truncate uppercase tracking-wider">Super Admin</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-400/20"
          >
            <LogOut className="w-5 h-5" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
}
