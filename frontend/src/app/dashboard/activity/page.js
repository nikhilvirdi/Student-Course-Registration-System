'use client';

import { Activity as ActivityIcon, CheckCircle2, Clock, Upload, FileText, UserPlus, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const activities = [
  {
    id: 1,
    type: 'submission',
    title: 'Submitted Assignment',
    description: 'You submitted "DBMS Final Project" for CS302.',
    time: '2 hours ago',
    icon: Upload,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    id: 2,
    type: 'enrollment',
    title: 'Course Enrollment Confirmed',
    description: 'Your enrollment for ENG101 Technical Writing is confirmed.',
    time: 'Yesterday at 10:30 AM',
    icon: CheckCircle2,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500'
  },
  {
    id: 3,
    type: 'document',
    title: 'Document Uploaded',
    description: 'You uploaded "Transcript_2025.pdf" to your profile.',
    time: 'Yesterday at 09:15 AM',
    icon: FileText,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500'
  },
  {
    id: 4,
    type: 'course',
    title: 'Waitlist Update',
    description: 'You are now #2 on the waitlist for MTH201.',
    time: 'May 06, 2026',
    icon: Clock,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500'
  },
  {
    id: 5,
    type: 'system',
    title: 'Profile Updated',
    description: 'You successfully updated your contact information.',
    time: 'May 05, 2026',
    icon: UserPlus,
    iconBg: 'bg-sidebar-accent',
    iconColor: 'text-foreground'
  },
  {
    id: 6,
    type: 'course',
    title: 'New Course Material',
    description: 'Prof. Smith added "Chapter 4 Notes" to CS301.',
    time: 'May 04, 2026',
    icon: BookOpen,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500'
  }
];

export default function ActivityPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <ActivityIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-sm text-sidebar-fg">Recent actions and system updates.</p>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm p-6">
        <div className="relative border-l border-card-border ml-4 space-y-8 pb-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative pl-8">
              <div className={cn(
                "absolute -left-4 top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-card",
                activity.iconBg,
                activity.iconColor
              )}>
                <activity.icon className="w-3.5 h-3.5" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-foreground">{activity.title}</h4>
                  <p className="text-sm text-sidebar-fg mt-1">{activity.description}</p>
                </div>
                <span className="text-xs font-medium text-sidebar-fg whitespace-nowrap bg-sidebar-accent px-2.5 py-1 rounded-md">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 mt-4 border-t border-card-border text-center">
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Load Older Activity
          </button>
        </div>
      </div>
    </div>
  );
}
