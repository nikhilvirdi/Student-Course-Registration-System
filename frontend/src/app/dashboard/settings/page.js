'use client';

import { Bell, Shield, Key, Eye, Moon, Monitor, Smartphone, Globe, Save } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-sidebar-fg mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-sidebar-accent text-foreground transition-colors">
            <Shield className="w-4 h-4" />
            Account
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-sidebar-fg hover:bg-sidebar-accent/50 hover:text-foreground transition-colors">
            <Bell className="w-4 h-4" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-sidebar-fg hover:bg-sidebar-accent/50 hover:text-foreground transition-colors">
            <Eye className="w-4 h-4" />
            Appearance
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-sidebar-fg hover:bg-sidebar-accent/50 hover:text-foreground transition-colors">
            <Key className="w-4 h-4" />
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Appearance Section */}
          <div className="bg-card border border-card-border rounded-xl shadow-sm">
            <div className="p-6 border-b border-card-border">
              <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-sidebar-fg mt-1">Customize the look and feel of your dashboard.</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Theme Preference</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${mounted && theme === 'light' ? 'border-primary bg-primary/5' : 'border-card-border hover:border-primary/50'}`}
                  >
                    <Monitor className="w-6 h-6 text-sidebar-fg" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${mounted && theme === 'dark' ? 'border-primary bg-primary/5' : 'border-card-border hover:border-primary/50'}`}
                  >
                    <Moon className="w-6 h-6 text-sidebar-fg" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${mounted && theme === 'system' ? 'border-primary bg-primary/5' : 'border-card-border hover:border-primary/50'}`}
                  >
                    <Monitor className="w-6 h-6 text-sidebar-fg" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="bg-card border border-card-border rounded-xl shadow-sm">
            <div className="p-6 border-b border-card-border">
              <h2 className="text-lg font-semibold text-foreground">Account Details</h2>
              <p className="text-sm text-sidebar-fg mt-1">Update your personal information.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <input type="text" defaultValue="Alex" className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input type="email" defaultValue="alex.doe@university.edu" className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Language</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-fg" />
                  <select className="w-full pl-9 pr-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-card-border bg-sidebar-accent/30 flex justify-end">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border border-red-500/20 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-red-500/20 bg-red-500/5">
              <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
              <p className="text-sm text-red-500/80 mt-1">Irreversible and destructive actions.</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Deactivate Account</h3>
                  <p className="text-xs text-sidebar-fg mt-1">Temporarily disable your account and hide your profile.</p>
                </div>
                <button className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-colors">
                  Deactivate
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
