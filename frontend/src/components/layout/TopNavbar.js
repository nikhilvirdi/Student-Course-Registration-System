'use client';

import { Menu, Search, Bell, X, Moon, Sun, LogOut, User, Settings, CheckCircle2, FileText, Layout, CheckSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function TopNavbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme();
  const { 
    user, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    searchQuery,
    setSearchQuery,
    searchResults
  } = useApp();
  
  const [mounted, setMounted] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const router = useRouter();
  const searchRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    // Mock logout
    router.push('/');
  };

  const clearSearch = () => setSearchQuery('');

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md text-foreground hover:bg-sidebar-accent lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div ref={searchRef} className="hidden md:flex items-center max-w-md w-full relative group">
          <Search className={`w-4 h-4 absolute left-3 transition-colors ${isSearchFocused ? 'text-primary' : 'text-sidebar-fg'}`} />
          <input 
            type="text" 
            placeholder="Search courses, tasks, or documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full pl-9 pr-10 py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 p-1 rounded-full hover:bg-sidebar-accent text-sidebar-fg hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50 max-h-[400px] overflow-y-auto">
              <div className="p-3 bg-sidebar-accent/30 border-b border-border">
                <p className="text-xs font-semibold text-sidebar-fg uppercase tracking-wider">Search Results</p>
              </div>
              
              {Object.values(searchResults).every(arr => arr.length === 0) ? (
                <div className="p-8 text-center">
                  <Search className="w-8 h-8 text-sidebar-accent mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-sidebar-fg">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="p-2 space-y-4">
                  {searchResults.courses.length > 0 && (
                    <div>
                      <h4 className="px-3 py-1 text-[10px] font-bold text-sidebar-fg uppercase">Courses</h4>
                      {searchResults.courses.map(course => (
                        <button 
                          key={course.id}
                          onClick={() => router.push(`/dashboard/courses`)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-sidebar-accent rounded-lg transition-colors text-left"
                        >
                          <Layout className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium">{course.name}</p>
                            <p className="text-xs text-sidebar-fg">{course.code}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div>
                      <h4 className="px-3 py-1 text-[10px] font-bold text-sidebar-fg uppercase">Tasks</h4>
                      {searchResults.tasks.map(task => (
                        <button 
                          key={task.id}
                          onClick={() => router.push(`/dashboard/tasks`)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-sidebar-accent rounded-lg transition-colors text-left"
                        >
                          <CheckSquare className="w-4 h-4 text-primary" />
                          <p className="font-medium truncate">{task.title}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.documents.length > 0 && (
                    <div>
                      <h4 className="px-3 py-1 text-[10px] font-bold text-sidebar-fg uppercase">Documents</h4>
                      {searchResults.documents.map(doc => (
                        <button 
                          key={doc.id}
                          onClick={() => router.push(`/dashboard/documents`)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-sidebar-accent rounded-lg transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                          <p className="font-medium truncate">{doc.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground transition-all active:scale-90"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
        
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            onBlur={() => setTimeout(() => setIsNotifOpen(false), 200)}
            className="p-2 rounded-full text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground transition-all relative active:scale-90"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-card">
                {unreadCount}
              </span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllNotificationsRead();
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="divide-y divide-border max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sidebar-fg italic text-sm">No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-4 hover:bg-sidebar-accent/50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      {!notif.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>}
                      <p className={`text-sm font-medium ${!notif.read ? 'text-foreground' : 'text-sidebar-fg'}`}>{notif.title}</p>
                      <p className="text-xs text-sidebar-fg mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-sidebar-fg mt-2 opacity-70">{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border text-center bg-sidebar-accent/30">
                <button onClick={() => router.push('/dashboard/notifications')} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border mx-1"></div>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
            className="flex items-center gap-2 pl-2 hover:opacity-80 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <span className="text-primary font-bold text-sm">{user.avatar}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold leading-none text-foreground">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] font-medium text-sidebar-fg mt-1 uppercase tracking-wider">{user.role}</p>
            </div>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-4 border-b border-border bg-sidebar-accent/10">
                <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-sidebar-fg truncate mt-0.5">{user.email}</p>
              </div>
              <div className="p-1.5">
                <button 
                  onClick={() => router.push('/dashboard/profile')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground rounded-lg transition-colors text-left"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground rounded-lg transition-colors text-left"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
              <div className="p-1.5 border-t border-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
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
