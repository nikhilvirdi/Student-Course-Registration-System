'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Activity, 
  Bell, 
  Folder, 
  Settings, 
  User,
  Users, 
  LogOut,
  Menu,
  CheckSquare,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getNavItems = (role) => {
  if (role === 'ADMIN') {
    return [
      { name: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Manage Students', href: '/dashboard/admin/students', icon: Users },
      { name: 'Manage Courses', href: '/dashboard/admin/courses', icon: BookOpen },
      { name: 'Enrollment Records', href: '/dashboard/admin/enrollments', icon: GraduationCap },
      { name: 'Grade Management', href: '/dashboard/admin/grades', icon: Award },
      { name: 'System Activity', href: '/dashboard/admin/activity', icon: Activity },
    ];
  }

  // Student specific navigation
  return [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Grades', href: '/dashboard/grades', icon: Award },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Activity', href: '/dashboard/activity', icon: Activity },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Documents', href: '/dashboard/documents', icon: Folder },
  ];
};

const bottomNavItems = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, setIsOpen }) {
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo area */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-foreground font-bold text-xl tracking-tight">SCRS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="text-xs font-semibold text-sidebar-fg/60 uppercase tracking-wider mb-2 px-3">
            Main Menu
          </div>
          {getNavItems(user.role).map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' || pathname === '/dashboard/'
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
              
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-sidebar-accent text-foreground font-semibold shadow-sm" 
                    : "text-sidebar-fg hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-sidebar-fg")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-sidebar-accent text-foreground font-semibold shadow-sm" 
                    : "text-sidebar-fg hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-sidebar-fg")} />
                {item.name}
              </Link>
            );
          })}

          {/* User Profile Section */}
          <div className="mt-4 pt-4 border-t border-sidebar-border/50">
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent/50 transition-all mb-2 group">
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs group-hover:scale-105 transition-transform">
                {user.avatar || (user.firstName[0] + user.lastName[0])}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-sidebar-fg/70 truncate">{user.role}</p>
              </div>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors group"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
