'use client';

import { Menu, Search, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopNavbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md text-foreground hover:bg-sidebar-accent lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center max-w-md w-full relative group">
          <Search className="w-4 h-4 absolute left-3 text-sidebar-fg group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search courses, projects, or tasks..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
        
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            onBlur={() => setTimeout(() => setIsNotifOpen(false), 200)}
            className="p-2 rounded-full text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Mark all as read</span>
              </div>
              <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                <div className="p-4 hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-foreground">Assignment Graded</p>
                  <p className="text-xs text-sidebar-fg mt-1">CS301 Midterm evaluation is now available.</p>
                  <p className="text-[10px] text-sidebar-fg mt-2">10 mins ago</p>
                </div>
                <div className="p-4 hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-foreground">New Course Material</p>
                  <p className="text-xs text-sidebar-fg mt-1">Dr. Smith uploaded Lecture 5 slides.</p>
                  <p className="text-[10px] text-sidebar-fg mt-2">2 hours ago</p>
                </div>
              </div>
              <div className="p-3 border-t border-border text-center bg-sidebar-accent/30">
                <a href="/dashboard/notifications" className="text-xs font-medium text-primary hover:text-primary/80">View all notifications</a>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border mx-1"></div>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
            className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-primary font-medium text-sm">AD</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none text-foreground">Alex Doe</p>
              <p className="text-xs text-sidebar-fg mt-1">Student</p>
            </div>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">Alex Doe</p>
                <p className="text-xs text-sidebar-fg truncate">alex.doe@university.edu</p>
              </div>
              <div className="p-1">
                <a href="/dashboard/profile" className="block px-3 py-2 text-sm text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground rounded-md transition-colors">Profile</a>
                <a href="/dashboard/settings" className="block px-3 py-2 text-sm text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground rounded-md transition-colors">Settings</a>
              </div>
              <div className="p-1 border-t border-border">
                <button className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
