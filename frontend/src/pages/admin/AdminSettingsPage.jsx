import { Settings, User, Shield, Moon, Sun, Palette, Globe } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminSettingsPage() {
  const { user } = useApp();
  const { theme, setTheme } = useTheme();

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold text-center">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings}
        title="Admin Settings"
        description="Manage your admin profile and system preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-card-border bg-sidebar-accent/30 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Admin Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-sidebar-fg">{user?.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold">
                  <Shield className="w-3 h-3" />
                  Super Admin
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-card-border space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-sidebar-fg">Role</span>
                <span className="text-sm font-medium text-foreground">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-sidebar-fg">Session Status</span>
                <span className="text-sm font-medium text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-card-border bg-sidebar-accent/30 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Appearance</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-sidebar-fg">Select your preferred theme for the admin console.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  theme === 'light' 
                    ? "border-primary bg-primary/5" 
                    : "border-card-border hover:border-sidebar-fg/30"
                )}
              >
                <Sun className={cn("w-6 h-6", theme === 'light' ? "text-primary" : "text-sidebar-fg")} />
                <span className={cn("text-sm font-medium", theme === 'light' ? "text-primary" : "text-sidebar-fg")}>Light Mode</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  theme === 'dark' 
                    ? "border-primary bg-primary/5" 
                    : "border-card-border hover:border-sidebar-fg/30"
                )}
              >
                <Moon className={cn("w-6 h-6", theme === 'dark' ? "text-primary" : "text-sidebar-fg")} />
                <span className={cn("text-sm font-medium", theme === 'dark' ? "text-primary" : "text-sidebar-fg")}>Dark Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-card-border bg-sidebar-accent/30 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">System Preferences</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Notification Preferences</h3>
                {[
                  { label: 'Email notifications for new enrollments', defaultOn: true },
                  { label: 'Alert on low seat availability', defaultOn: true },
                  { label: 'Daily analytics digest', defaultOn: false },
                ].map((pref, i) => (
                  <label key={i} className="flex items-center justify-between p-3 bg-sidebar-accent/30 rounded-lg cursor-pointer hover:bg-sidebar-accent/50 transition-colors">
                    <span className="text-sm text-foreground">{pref.label}</span>
                    <input type="checkbox" defaultChecked={pref.defaultOn} className="w-4 h-4 rounded accent-primary" />
                  </label>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Display Options</h3>
                {[
                  { label: 'Show student avatars in tables', defaultOn: true },
                  { label: 'Compact table rows', defaultOn: false },
                  { label: 'Show real-time clock in navbar', defaultOn: true },
                ].map((pref, i) => (
                  <label key={i} className="flex items-center justify-between p-3 bg-sidebar-accent/30 rounded-lg cursor-pointer hover:bg-sidebar-accent/50 transition-colors">
                    <span className="text-sm text-foreground">{pref.label}</span>
                    <input type="checkbox" defaultChecked={pref.defaultOn} className="w-4 h-4 rounded accent-primary" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
