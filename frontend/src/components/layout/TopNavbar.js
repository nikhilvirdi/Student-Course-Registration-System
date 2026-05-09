'use client';

import { Menu, Search, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopNavbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md text-foreground hover:bg-sidebar-accent lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center max-w-md w-full relative">
          <Search className="w-4 h-4 absolute left-3 text-sidebar-fg" />
          <input 
            type="text" 
            placeholder="Search courses, projects, or tasks..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
        
        <button className="p-2 rounded-full text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
        </button>

        <div className="h-8 w-px bg-border mx-1"></div>

        <button className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-primary font-medium text-sm">JD</span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-none text-foreground">John Doe</p>
            <p className="text-xs text-sidebar-fg mt-1">Student</p>
          </div>
        </button>
      </div>
    </header>
  );
}
