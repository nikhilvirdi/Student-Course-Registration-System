'use client';

import { Bell, Shield, Key, Eye, Moon, Monitor, Smartphone, Globe, Save, CheckCircle2, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile, updatePassword, updatePreferences } = useApp();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  // Local form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || (user?.name ? user.name.split(' ')[0] : ''),
    lastName: user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : ''),
    email: user?.email || '',
    language: user?.preferences?.language || 'English (US)'
  });

  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifData, setNotifData] = useState(user?.preferences?.notifications || { email: true, push: true, updates: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFormData({
      firstName: user?.firstName || (user?.name ? user.name.split(' ')[0] : ''),
      lastName: user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : ''),
      email: user?.email || '',
      language: user?.preferences?.language || 'English (US)'
    });
    setNotifData(user?.preferences?.notifications || { email: true, push: true, updates: true });
  }, [user]);

  const handleSaveAccount = async () => {
    try {
      await updateProfile({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
      });
      updatePreferences({ language: formData.language });
      
      toast({
        title: "Settings Saved",
        description: "Your account information has been updated successfully.",
        type: "success"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        type: "error"
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!passData.current || !passData.new || !passData.confirm) {
      toast({ title: "Error", description: "All password fields are required", type: "error" });
      return;
    }
    if (passData.new !== passData.confirm) {
      toast({ title: "Error", description: "New passwords do not match", type: "error" });
      return;
    }
    try {
      await updatePassword(passData.current, passData.new);
      toast({ title: "Password Updated", description: "Your password has been changed successfully.", type: "success" });
      setPassData({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast({ title: "Error", description: err.message, type: "error" });
    }
  };

  const handleSaveNotifications = () => {
    updatePreferences({ notifications: notifData });
    toast({
      title: "Preferences Updated",
      description: "Your notification settings have been saved.",
      type: "success"
    });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader 
        icon={Settings}
        title="Settings"
        description="Manage your account preferences and application settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          {[
            { id: 'account', label: 'Account', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: Eye },
            { id: 'security', label: 'Security', icon: Key },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-sidebar-fg hover:bg-sidebar-accent/50 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          
          {activeTab === 'account' && (
            <div className="bg-card border border-card-border rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-card-border">
                <h2 className="text-lg font-semibold text-foreground">Account Details</h2>
                <p className="text-sm text-sidebar-fg mt-1">Update your personal information and language preference.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Language</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-fg" />
                    <select 
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-all cursor-pointer"
                    >
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-card-border bg-sidebar-accent/30 flex justify-end">
                <button 
                  onClick={handleSaveAccount}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-card border border-card-border rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-card-border">
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                <p className="text-sm text-sidebar-fg mt-1">Manage how and when you receive updates.</p>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Receive updates about your courses via email.' },
                  { id: 'push', label: 'Push Notifications', desc: 'Get real-time alerts on your browser.' },
                  { id: 'updates', label: 'System Updates', desc: 'Notifications about platform features and maintenance.' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-medium text-foreground">{item.label}</h3>
                      <p className="text-xs text-sidebar-fg">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotifData({...notifData, [item.id]: !notifData[item.id]})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifData[item.id] ? 'bg-primary' : 'bg-sidebar-accent'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifData[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-card-border bg-sidebar-accent/30 flex justify-end">
                <button 
                  onClick={handleSaveNotifications}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-card border border-card-border rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-card-border">
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                <p className="text-sm text-sidebar-fg mt-1">Customize the look and feel of your dashboard.</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Theme Preference</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((t) => (
                      <button 
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all ${
                          theme === t.id 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-card-border hover:border-primary/50 bg-background/50'
                        }`}
                      >
                        <t.icon className={`w-6 h-6 ${theme === t.id ? 'text-primary' : 'text-sidebar-fg'}`} />
                        <span className={`text-sm font-medium ${theme === t.id ? 'text-primary' : 'text-foreground'}`}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card border border-card-border rounded-xl shadow-sm">
                <div className="p-6 border-b border-card-border">
                  <h2 className="text-lg font-semibold text-foreground">Security Settings</h2>
                  <p className="text-sm text-sidebar-fg mt-1">Manage your password and security preferences.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passData.current}
                      onChange={e => setPassData({...passData, current: e.target.value})}
                      className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={passData.new}
                        onChange={e => setPassData({...passData, new: e.target.value})}
                        className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirm Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={passData.confirm}
                        onChange={e => setPassData({...passData, confirm: e.target.value})}
                        className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-card-border bg-sidebar-accent/30 flex justify-end">
                  <button 
                    onClick={handleUpdatePassword}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Key className="w-4 h-4" />
                    Update Password
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
                    <button className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all active:scale-95">
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Missing icon import
const Sun = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>
);
