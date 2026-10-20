import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Edit3, Shield, BookOpen, Clock, Award, X, CheckCircle, AlertCircle } from 'lucide-react';
import { displayName, apiFetch } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user, courses, updateProfile } = useApp();
  const { toast } = useToast();

  const [studentProfile, setStudentProfile] = useState(null);
  const [academicOverview, setAcademicOverview] = useState({ gpa: 0, total_credits: 0 });
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, gpaRes] = await Promise.all([
        apiFetch('/students/profile').catch(() => null),
        apiFetch('/grades/gpa').catch(() => null)
      ]);

      if (profileRes?.success && profileRes.data) {
        setStudentProfile(profileRes.data);
      }
      if (gpaRes?.success && gpaRes.data) {
        setAcademicOverview(gpaRes.data);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditForm({
      name: studentProfile?.name || displayName(user) || '',
      email: studentProfile?.email || user?.email || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      });
      setIsEditModalOpen(false);
      toast({ title: 'Profile Updated', description: 'Your personal information was saved to the database', type: 'success' });
      await fetchProfileData();
    } catch (err) {
      toast({ title: 'Update Failed', description: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Dynamic calculations
  const enrolledCourses = courses.filter(c => c.status === 'Enrolled');
  const currentTermCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const earnedCredits = academicOverview.total_credits || 0;
  const currentGPA = academicOverview.gpa ? academicOverview.gpa.toFixed(2) : '0.00';
  const profileName = studentProfile?.name || displayName(user);
  const profileEmail = studentProfile?.email || user?.email || 'alex.doe@scrs.edu';
  const departmentName = studentProfile?.department?.department_name || 'Computer Science';
  const semester = studentProfile?.semester || user?.semester || 1;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
          <p className="text-sm text-sidebar-fg mt-1">Manage your personal information, department details, and academic standings.</p>
        </div>
        <button 
          onClick={handleOpenEdit}
          className="bg-card text-foreground border border-card-border px-4 py-2 rounded-lg font-medium hover:bg-sidebar-accent transition-colors flex items-center gap-2 shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden text-center">
            <div className="h-24 bg-gradient-to-r from-primary/80 to-primary"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-card bg-sidebar-accent flex items-center justify-center -mt-12 mb-4 relative z-10 overflow-hidden shadow-md">
                <span className="text-3xl font-black text-primary">
                  {profileName ? profileName.substring(0, 2).toUpperCase() : 'ST'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{profileName}</h2>
              <p className="text-sm font-semibold text-primary mt-1">{departmentName}</p>
              <p className="text-xs text-sidebar-fg mt-0.5 font-medium">Semester {semester} Student</p>
              
              <div className="mt-6 flex flex-col gap-3 text-sm text-left border-t border-card-border pt-4">
                <div className="flex items-center gap-3 text-sidebar-fg">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground truncate">{profileEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-sidebar-fg">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground text-xs truncate">
                    ID: {studentProfile?.student_id || user?.student_id || user?.id || '00000000-0000-4000-a000-000000000001'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sidebar-fg">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground text-xs">University Main Campus</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Department & Faculty</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {departmentName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{departmentName}</p>
                <p className="text-xs text-sidebar-fg">Active Department</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Academic Details & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-card-border rounded-xl shadow-sm">
            <div className="p-6 border-b border-card-border">
              <h3 className="text-lg font-semibold text-foreground">Academic Standing & Performance</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-sidebar-fg flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> CGPA</p>
                <p className="text-3xl font-black text-foreground">{currentGPA}</p>
                <p className="text-xs text-emerald-500 font-medium">10-Point Scale</p>
              </div>
              <div className="space-y-1 sm:border-l sm:border-card-border sm:pl-6">
                <p className="text-sm text-sidebar-fg flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Credits Earned</p>
                <p className="text-3xl font-black text-foreground">{earnedCredits} <span className="text-base text-sidebar-fg font-normal">cr.</span></p>
                <p className="text-xs text-sidebar-fg">Completed Courses</p>
              </div>
              <div className="space-y-1 sm:border-l sm:border-card-border sm:pl-6">
                <p className="text-sm text-sidebar-fg flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Active Term</p>
                <p className="text-3xl font-black text-foreground">{currentTermCredits} <span className="text-base text-sidebar-fg font-normal">cr.</span></p>
                <p className="text-xs text-primary font-medium">{enrolledCourses.length} Registered Courses</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl shadow-sm">
            <div className="p-6 border-b border-card-border">
              <h3 className="text-lg font-semibold text-foreground">Current Course Load</h3>
            </div>
            <div className="p-6 space-y-3">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3.5 bg-sidebar-accent/30 border border-card-border rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{c.name}</p>
                      <p className="text-xs text-sidebar-fg">{c.code} • {c.instructor}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold">
                        {c.credits} Credits
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-sidebar-fg italic py-4 text-center">
                  You are not currently enrolled in any courses for this term.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-card-border mb-5">
              <h3 className="text-lg font-bold text-foreground">Edit Student Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-sidebar-fg hover:bg-sidebar-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
