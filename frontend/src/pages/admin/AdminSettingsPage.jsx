import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Shield, Moon, Sun, Monitor, Palette, Globe, 
  Save, RotateCcw, Check, Lock, Bell, BookOpen, Database, 
  AlertCircle, CheckCircle2, RefreshCw, Sliders, Calendar, KeyRound
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { cn, apiFetch, formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminSettingsPage() {
  const { user, updateProfile, updatePassword } = useApp();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'academic', 'notifications', 'security'

  // Admin Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || 'System Admin',
    email: user?.email || 'admin@scrs.com',
  });

  // Password Change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Academic & System Settings state
  const [academicSettings, setAcademicSettings] = useState({
    term: 'Spring 2026',
    registrationOpen: true,
    defaultCourseSeats: 50,
    maxCreditsPerStudent: 24,
    minPassingMarks: 40,
  });

  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNewEnrollments: true,
    alertLowSeats: true,
    autoNotifyGrades: true,
    dailyDigest: false,
  });

  // Display Options
  const [displayOptions, setDisplayOptions] = useState({
    showStudentAvatars: true,
    compactTableRows: false,
    showRealtimeClock: true,
  });

  // System metadata loaded from DB
  const [systemMeta, setSystemMeta] = useState({
    databaseEngine: 'PostgreSQL 16 via Prisma ORM',
    connectionStatus: 'Connected',
    totalCourses: 0,
    totalDepartments: 0,
    totalStudents: 0,
    totalAuditLogs: 0,
  });

  // Confirmation dialog state for reset
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/settings');
      if (res.success && res.data) {
        const d = res.data;
        if (d.profile) {
          setProfileData({
            name: d.profile.name || 'System Admin',
            email: d.profile.email || 'admin@scrs.com',
          });
        }
        if (d.academic) setAcademicSettings(d.academic);
        if (d.notifications) setNotificationPrefs(d.notifications);
        if (d.display) setDisplayOptions(d.display);
        if (d.systemMeta) setSystemMeta(d.systemMeta);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast({
        title: 'Error Loading Settings',
        description: err.message || 'Could not load settings from server.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Save All Settings
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    if (!profileData.name.trim() || !profileData.email.trim()) {
      toast({ title: 'Validation Error', description: 'Name and email are required.', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const res = await apiFetch('/admin/settings', {
        method: 'PUT',
        body: {
          profile: profileData,
          academic: academicSettings,
          notifications: notificationPrefs,
          display: displayOptions,
        }
      });

      if (res.success) {
        toast({
          title: 'Settings Saved',
          description: 'All admin profile and system configurations have been updated.',
          type: 'success'
        });

        // Update local user in AppContext if name/email changed
        if (updateProfile) {
          try {
            await updateProfile({ name: profileData.name, email: profileData.email });
          } catch (e) {
            // Already updated in settings PUT endpoint
          }
        }
      }
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: err.message || 'An error occurred while saving settings.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: 'Validation Error', description: 'All password fields are required.', type: 'error' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast({ title: 'Password Too Short', description: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Mismatch', description: 'New password and confirmation do not match.', type: 'error' });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await apiFetch('/auth/password', {
        method: 'PATCH',
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      });

      if (res.success) {
        toast({
          title: 'Password Updated',
          description: 'Your administrator password has been updated securely.',
          type: 'success'
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast({
        title: 'Password Update Failed',
        description: err.message || 'Current password was incorrect.',
        type: 'error'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle Reset to Defaults
  const handleConfirmReset = async () => {
    try {
      setResetting(true);
      const res = await apiFetch('/admin/settings/reset', {
        method: 'POST',
      });

      if (res.success && res.data) {
        setAcademicSettings(res.data.academic);
        setNotificationPrefs(res.data.notifications);
        setDisplayOptions(res.data.display);
        setShowResetConfirm(false);
        toast({
          title: 'Settings Reset',
          description: 'System configurations have been restored to default values.',
          type: 'success'
        });
      }
    } catch (err) {
      toast({
        title: 'Reset Failed',
        description: err.message || 'Could not reset system settings.',
        type: 'error'
      });
    } finally {
      setResetting(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold bg-card border border-card-border rounded-xl">
        Access Denied. You must be signed in with Admin privileges to view this page.
      </div>
    );
  }

  const initials = (profileData.name || 'Admin')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          icon={Settings}
          title="Admin & System Settings"
          description="Manage your administrator profile, academic session parameters, notifications, and visual preferences."
        />

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={loading || saving}
            className="px-3.5 py-2 rounded-xl border border-card-border bg-card hover:bg-sidebar-accent text-sidebar-fg hover:text-foreground text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            title="Reset system settings to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={loading || saving}
            className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-card border border-card-border rounded-xl shadow-sm overflow-x-auto text-xs font-semibold">
        {[
          { id: 'general', label: 'Profile & General', icon: User },
          { id: 'academic', label: 'Academic & Registration', icon: BookOpen },
          { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'system', label: 'Database & System Health', icon: Database },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center text-center gap-3 bg-card border border-card-border rounded-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-sidebar-fg">Loading admin settings from database...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: General & Profile */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Card */}
              <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-5 border-b border-card-border bg-sidebar-accent/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <h2 className="text-base font-bold text-foreground">Administrator Profile</h2>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold border border-indigo-500/20">
                      <Shield className="w-3 h-3" />
                      Super Admin
                    </span>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{profileData.name}</h3>
                        <p className="text-xs text-sidebar-fg mt-0.5">{profileData.email}</p>
                        <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Authenticated Session
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-3 border-t border-card-border">
                      <div>
                        <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                          placeholder="e.g. System Admin"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                          placeholder="admin@scrs.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-sidebar-accent/30 border-t border-card-border flex justify-end">
                  <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Profile
                  </button>
                </div>
              </div>

              {/* Theme & Visual Appearance */}
              <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-5 border-b border-card-border bg-sidebar-accent/30 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-bold text-foreground">Theme & Interface Appearance</h2>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <p className="text-xs text-sidebar-fg mb-3">Choose the color theme for the administrative console:</p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setTheme('light')}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                            theme === 'light'
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-card-border hover:border-sidebar-fg/40 bg-sidebar-accent/20"
                          )}
                        >
                          <Sun className={cn("w-5 h-5", theme === 'light' ? "text-primary" : "text-sidebar-fg")} />
                          <span className={cn("text-xs font-bold", theme === 'light' ? "text-primary" : "text-sidebar-fg")}>
                            Light
                          </span>
                        </button>

                        <button
                          onClick={() => setTheme('dark')}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                            theme === 'dark'
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-card-border hover:border-sidebar-fg/40 bg-sidebar-accent/20"
                          )}
                        >
                          <Moon className={cn("w-5 h-5", theme === 'dark' ? "text-primary" : "text-sidebar-fg")} />
                          <span className={cn("text-xs font-bold", theme === 'dark' ? "text-primary" : "text-sidebar-fg")}>
                            Dark
                          </span>
                        </button>

                        <button
                          onClick={() => setTheme('system')}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                            theme === 'system'
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-card-border hover:border-sidebar-fg/40 bg-sidebar-accent/20"
                          )}
                        >
                          <Monitor className={cn("w-5 h-5", theme === 'system' ? "text-primary" : "text-sidebar-fg")} />
                          <span className={cn("text-xs font-bold", theme === 'system' ? "text-primary" : "text-sidebar-fg")}>
                            System
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-card-border">
                      <h4 className="text-xs font-bold text-sidebar-fg uppercase tracking-wider">Display Options</h4>

                      <label className="flex items-center justify-between p-3 bg-sidebar-accent/30 rounded-xl cursor-pointer hover:bg-sidebar-accent/50 transition-colors border border-card-border">
                        <div>
                          <div className="text-sm font-semibold text-foreground">Student Avatars</div>
                          <div className="text-xs text-sidebar-fg">Display initials and profile icons in student lists</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={displayOptions.showStudentAvatars}
                          onChange={(e) => setDisplayOptions({ ...displayOptions, showStudentAvatars: e.target.checked })}
                          className="w-4 h-4 rounded accent-primary cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-sidebar-accent/30 rounded-xl cursor-pointer hover:bg-sidebar-accent/50 transition-colors border border-card-border">
                        <div>
                          <div className="text-sm font-semibold text-foreground">Compact Data Tables</div>
                          <div className="text-xs text-sidebar-fg">Decrease row padding to fit more records on screen</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={displayOptions.compactTableRows}
                          onChange={(e) => setDisplayOptions({ ...displayOptions, compactTableRows: e.target.checked })}
                          className="w-4 h-4 rounded accent-primary cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-sidebar-accent/30 border-t border-card-border flex justify-end">
                  <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Display
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Academic & Registration Settings */}
          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-card-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-5 border-b border-card-border bg-sidebar-accent/30 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-bold text-foreground">Course Registration & Academic Parameters</h2>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Registration Window Switch */}
                    <div className="flex items-center justify-between p-4 bg-sidebar-accent/30 border border-card-border rounded-xl">
                      <div>
                        <div className="text-sm font-bold text-foreground">Course Registration Window</div>
                        <div className="text-xs text-sidebar-fg mt-0.5">
                          {academicSettings.registrationOpen 
                            ? "Registration is currently OPEN. Students can enroll and drop courses." 
                            : "Registration is LOCKED. Course enrollment operations are suspended."}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAcademicSettings({ ...academicSettings, registrationOpen: !academicSettings.registrationOpen })}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm",
                          academicSettings.registrationOpen 
                            ? "bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20" 
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
                        )}
                      >
                        {academicSettings.registrationOpen ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Active (Open)
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            Locked (Closed)
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                          Active Academic Term / Semester
                        </label>
                        <input
                          type="text"
                          value={academicSettings.term}
                          onChange={(e) => setAcademicSettings({ ...academicSettings, term: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                          placeholder="e.g. Spring 2026"
                        />
                        <p className="text-[11px] text-sidebar-fg mt-1">Displayed as current academic label across courses.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                          Default Course Seat Capacity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={academicSettings.defaultCourseSeats}
                          onChange={(e) => setAcademicSettings({ ...academicSettings, defaultCourseSeats: parseInt(e.target.value) || 50 })}
                          className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                        />
                        <p className="text-[11px] text-sidebar-fg mt-1">Default maximum capacity when creating new courses.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                          Maximum Credits Per Student
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={academicSettings.maxCreditsPerStudent}
                          onChange={(e) => setAcademicSettings({ ...academicSettings, maxCreditsPerStudent: parseInt(e.target.value) || 24 })}
                          className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                        />
                        <p className="text-[11px] text-sidebar-fg mt-1">Recommended academic credit limit per term.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                          Minimum Passing Score
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={academicSettings.minPassingMarks}
                            onChange={(e) => setAcademicSettings({ ...academicSettings, minPassingMarks: parseFloat(e.target.value) || 40 })}
                            className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                          />
                          <div className="absolute right-3.5 top-2.5 text-xs text-sidebar-fg font-bold">
                            Marks (Grade C)
                          </div>
                        </div>
                        <p className="text-[11px] text-sidebar-fg mt-1">Marks below this score receive an 'F' grade (0.0 GP).</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-sidebar-accent/30 border-t border-card-border flex justify-end">
                  <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Academic Settings
                  </button>
                </div>
              </div>

              {/* Database Overview Card */}
              <div className="bg-card border border-card-border rounded-xl shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-card-border">
                  <Database className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Database Metrics</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-sidebar-fg">Active Courses</span>
                    <strong className="text-foreground font-mono">{systemMeta.totalCourses}</strong>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-sidebar-fg">Academic Departments</span>
                    <strong className="text-foreground font-mono">{systemMeta.totalDepartments}</strong>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-sidebar-fg">Enrolled Students</span>
                    <strong className="text-foreground font-mono">{systemMeta.totalStudents}</strong>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-sidebar-fg">System Audit Events</span>
                    <strong className="text-foreground font-mono">{systemMeta.totalAuditLogs}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-card-border">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-medium">
                    All academic parameters are evaluated directly in PostgreSQL queries and Prisma transactions.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Notifications & Alerts */}
          {activeTab === 'notifications' && (
            <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-card-border bg-sidebar-accent/30 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Notification Dispatch & Automated Alerts</h2>
                </div>

                <div className="p-6">
                  <p className="text-xs text-sidebar-fg mb-4">
                    Configure which automated triggers generate campus announcements or system alerts:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-4 bg-sidebar-accent/30 rounded-xl cursor-pointer hover:bg-sidebar-accent/50 transition-colors border border-card-border">
                      <div className="pr-4">
                        <div className="text-sm font-semibold text-foreground">New Enrollment Alerts</div>
                        <div className="text-xs text-sidebar-fg mt-0.5">Notify admin when a student successfully registers for a class</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.emailNewEnrollments}
                        onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailNewEnrollments: e.target.checked })}
                        className="w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-sidebar-accent/30 rounded-xl cursor-pointer hover:bg-sidebar-accent/50 transition-colors border border-card-border">
                      <div className="pr-4">
                        <div className="text-sm font-semibold text-foreground">Low Seat Capacity Warnings</div>
                        <div className="text-xs text-sidebar-fg mt-0.5">Receive alert when a course has fewer than 5 seats remaining</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.alertLowSeats}
                        onChange={(e) => setNotificationPrefs({ ...notificationPrefs, alertLowSeats: e.target.checked })}
                        className="w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-sidebar-accent/30 rounded-xl cursor-pointer hover:bg-sidebar-accent/50 transition-colors border border-card-border">
                      <div className="pr-4">
                        <div className="text-sm font-semibold text-foreground">Auto-Notify on Grade Publication</div>
                        <div className="text-xs text-sidebar-fg mt-0.5">Automatically send a student notification when their grade is posted</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.autoNotifyGrades}
                        onChange={(e) => setNotificationPrefs({ ...notificationPrefs, autoNotifyGrades: e.target.checked })}
                        className="w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-sidebar-accent/30 rounded-xl cursor-pointer hover:bg-sidebar-accent/50 transition-colors border border-card-border">
                      <div className="pr-4">
                        <div className="text-sm font-semibold text-foreground">Daily Activity Digest</div>
                        <div className="text-xs text-sidebar-fg mt-0.5">Aggregate 24-hour student registrations and task submissions</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.dailyDigest}
                        onChange={(e) => setNotificationPrefs({ ...notificationPrefs, dailyDigest: e.target.checked })}
                        className="w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-sidebar-accent/30 border-t border-card-border flex justify-end">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Notifications
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Security & Password */}
          {activeTab === 'security' && (
            <div className="max-w-2xl bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-card-border bg-sidebar-accent/30 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">Change Administrator Password</h2>
              </div>

              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <p className="text-xs text-sidebar-fg">
                  Enter your current administrator credentials to set a new password. The password will be hashed with bcrypt in the PostgreSQL database.
                </p>

                <div>
                  <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                    placeholder="••••••••••••"
                    required
                  />
                  <p className="text-[11px] text-sidebar-fg mt-1">Default demo admin password is <code className="bg-sidebar-accent px-1.5 py-0.5 rounded font-mono">adminpassword</code>.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-card-border flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: System Health */}
          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-card-border rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-card-border">
                  <Database className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Relational Database Diagnostics</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-sidebar-fg">Database Engine</span>
                    <span className="font-semibold text-foreground">{systemMeta.databaseEngine}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sidebar-fg">Database Name</span>
                    <span className="font-mono text-foreground font-semibold">scrs_db</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sidebar-fg">Connection Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Active & Healthy
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sidebar-fg">Prisma Client</span>
                    <span className="font-mono text-emerald-500 font-bold">Initialized</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sidebar-fg">Active Session Role</span>
                    <span className="font-bold text-primary">ADMIN (Demo Identity)</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-card-border rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-card-border">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">System Audit Log Summary</h3>
                </div>

                <p className="text-xs text-sidebar-fg">
                  All administrative mutations—including student registrations, grade postings, and setting updates—are recorded in the PostgreSQL <code className="bg-sidebar-accent px-1.5 py-0.5 rounded font-mono">AuditLog</code> table.
                </p>

                <div className="p-4 bg-sidebar-accent/30 rounded-xl border border-card-border flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-sidebar-fg uppercase tracking-wider">Total Recorded Events</div>
                    <div className="text-2xl font-black text-foreground mt-0.5">{systemMeta.totalAuditLogs}</div>
                  </div>
                  <a
                    href="/dashboard/admin/activity"
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
                  >
                    View Audit Stream →
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal: Reset to Defaults */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-card-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 bg-amber-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Reset System Settings?</h3>
            </div>

            <p className="text-sm text-sidebar-fg">
              Are you sure you want to restore all system preferences, notification rules, and academic settings to default values?
            </p>
            <p className="text-xs text-sidebar-fg bg-sidebar-accent/50 p-3 rounded-xl border border-card-border">
              Your admin profile name, email, and password will NOT be affected.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-card-border rounded-xl text-sm font-medium text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                {resetting ? 'Resetting...' : 'Yes, Restore Defaults'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
