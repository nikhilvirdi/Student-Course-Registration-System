'use client';

import { 
  Bell, 
  Search, 
  Menu, 
  ShieldCheck,
  Maximize,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTopNavbar({ onMenuClick }) {
  const { user, switchRole } = useApp();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 border-b border-sidebar-border bg-card sticky top-0 z-30 flex items-center px-4 lg:px-8 shadow-sm">
      <button 
        onClick={onMenuClick}
        className="p-2 hover:bg-sidebar-accent rounded-lg lg:hidden text-sidebar-fg mr-4"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Admin Title Section */}
      <div className="hidden md:flex flex-col">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          Secure Admin Node
        </h2>
        <p className="text-[10px] font-medium text-sidebar-fg uppercase tracking-widest">
          {time.toLocaleTimeString()} • {time.toLocaleDateString()}
        </p>
      </div>

      {/* Universal Admin Search */}
      <div className="flex-1 max-w-xl mx-auto px-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-fg group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search students, courses, or audit records..." 
            className="w-full bg-sidebar-accent/50 border border-transparent focus:border-indigo-500/30 focus:bg-background rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-sidebar-fg/60 bg-sidebar-accent border border-sidebar-border rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-sidebar-fg/60 bg-sidebar-accent border border-sidebar-border rounded">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Unauthenticated Dev Mode Badge & Role Switcher */}
        <button 
          onClick={() => {
            switchRole('STUDENT');
            router.push('/dashboard');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 transition-all mr-1"
          title="Switch to Student Dashboard (Unauthenticated Dev Mode)"
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="hidden sm:inline">DEV:</span>
          <span>Admin Mode</span>
          <span className="underline ml-1 font-normal opacity-80">Switch to Student →</span>
        </button>

        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-sidebar-accent/50 rounded-lg border border-sidebar-border mr-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-sidebar-fg uppercase tracking-wider">Live</span>
        </div>


        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 hover:bg-sidebar-accent rounded-xl text-sidebar-fg transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}

        <button className="p-2.5 hover:bg-sidebar-accent rounded-xl text-sidebar-fg relative group transition-all">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-card" />
        </button>

        <button className="hidden sm:flex p-2.5 hover:bg-sidebar-accent rounded-xl text-sidebar-fg transition-all">
          <Maximize className="w-5 h-5" />
        </button>

        <button className="hidden lg:flex p-2.5 hover:bg-sidebar-accent rounded-xl text-sidebar-fg transition-all">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="w-px h-8 bg-sidebar-border mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden lg:flex flex-col items-end">
            <p className="text-sm font-bold text-foreground">{user?.firstName}</p>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Authorized</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
            {user?.firstName?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
