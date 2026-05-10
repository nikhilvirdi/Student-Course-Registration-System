'use client';

import { User, Mail, Phone, MapPin, Edit3, Shield, BookOpen, Clock, Award, CheckCircle } from 'lucide-react';
import { cn, displayName } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function ProfilePage() {
  const { user } = useApp();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
          <p className="text-sm text-sidebar-fg mt-1">Manage your personal information and preferences.</p>
        </div>
        <button className="bg-card text-foreground border border-card-border px-4 py-2 rounded-lg font-medium hover:bg-sidebar-accent transition-colors flex items-center gap-2">
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
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-card bg-sidebar-accent flex items-center justify-center -mt-12 mb-4 relative z-10 overflow-hidden">
                <span className="text-3xl font-bold text-sidebar-fg">{displayName(user).substring(0, 2).toUpperCase()}</span>
                {/* <img src="/placeholder-avatar.jpg" alt={displayName(user)} className="w-full h-full object-cover" /> */}
              </div>
              <h2 className="text-xl font-bold text-foreground">{displayName(user)}</h2>
              <p className="text-sm font-medium text-primary mt-1">{user?.department?.department_name || 'B.S. Computer Science'}</p>
              <p className="text-sm text-sidebar-fg mt-1">Semester {user?.semester || '1'}</p>
              
              <div className="mt-6 flex flex-col gap-3 text-sm text-left">
                <div className="flex items-center gap-3 text-sidebar-fg">
                  <Mail className="w-4 h-4" />
                  <span className="text-foreground">{user?.email || 'alex.doe@university.edu'}</span>
                </div>
                <div className="flex items-center gap-3 text-sidebar-fg">
                  <Phone className="w-4 h-4" />
                  <span className="text-foreground">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sidebar-fg">
                  <MapPin className="w-4 h-4" />
                  <span className="text-foreground">Campus Dormitory, Room 402</span>
                </div>
                <div className="flex items-center gap-3 text-sidebar-fg">
                  <Shield className="w-4 h-4" />
                  <span className="text-foreground">Student ID: #10928374</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Academic Advisor</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-fg font-bold">
                DR
              </div>
              <div>
                <p className="font-medium text-foreground">Dr. Robert Smith</p>
                <p className="text-xs text-sidebar-fg">Computer Science Dept.</p>
                <button className="text-xs font-medium text-primary mt-1 hover:underline">Contact Advisor</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Academic Details & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-card-border rounded-xl shadow-sm">
            <div className="p-6 border-b border-card-border">
              <h3 className="text-lg font-semibold text-foreground">Academic Overview</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-sidebar-fg flex items-center gap-2"><BookOpen className="w-4 h-4" /> CGPA</p>
                <p className="text-3xl font-bold text-foreground">3.85</p>
                <p className="text-xs text-green-500 font-medium">Top 15% of class</p>
              </div>
              <div className="space-y-1 sm:border-l sm:border-card-border sm:pl-6">
                <p className="text-sm text-sidebar-fg flex items-center gap-2"><Award className="w-4 h-4" /> Credits Earned</p>
                <p className="text-3xl font-bold text-foreground">45 <span className="text-lg text-sidebar-fg font-normal">/ 120</span></p>
                <p className="text-xs text-sidebar-fg">Sophomore Standing</p>
              </div>
              <div className="space-y-1 sm:border-l sm:border-card-border sm:pl-6">
                <p className="text-sm text-sidebar-fg flex items-center gap-2"><Clock className="w-4 h-4" /> Current Term</p>
                <p className="text-3xl font-bold text-foreground">15 <span className="text-lg text-sidebar-fg font-normal">cr.</span></p>
                <p className="text-xs text-primary font-medium">Full-time Status</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl shadow-sm">
            <div className="p-6 border-b border-card-border">
              <h3 className="text-lg font-semibold text-foreground">Degree Progress</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Core Requirements</span>
                  <span className="text-sidebar-fg">18 / 40 Credits</span>
                </div>
                <div className="h-2.5 bg-sidebar-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Major Electives</span>
                  <span className="text-sidebar-fg">9 / 30 Credits</span>
                </div>
                <div className="h-2.5 bg-sidebar-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">General Education</span>
                  <span className="text-sidebar-fg">18 / 20 Credits</span>
                </div>
                <div className="h-2.5 bg-sidebar-accent rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
