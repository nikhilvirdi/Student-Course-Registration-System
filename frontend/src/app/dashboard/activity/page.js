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
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <ActivityIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-sm text-sidebar-fg">Recent actions and system updates.</p>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm p-6 w-full">
        <div className="relative border-l-2 border-sidebar-accent ml-4 space-y-10 pb-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative pl-10 group">
              <div className={cn(
                "absolute -left-4 top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-card group-hover:scale-110 transition-transform duration-200",
                activity.iconBg,
                activity.iconColor
              )}>
                <activity.icon className="w-3.5 h-3.5" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 p-4 bg-background border border-card-border hover:border-card-border/80 rounded-xl transition-colors shadow-sm group-hover:shadow-md w-full">
                <div className="flex-1">
                  <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{activity.title}</h4>
                  <p className="text-sm text-sidebar-fg/80 mt-1.5 leading-relaxed">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-fg bg-sidebar-accent px-3 py-1.5 rounded-md h-fit whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-sidebar-fg/70" />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-6 mt-2 border-t border-card-border flex justify-center">
          <button className="px-5 py-2.5 bg-sidebar-accent text-foreground text-sm font-semibold rounded-lg hover:bg-sidebar-accent/80 transition-colors">
            Load Older Activity
          </button>
        </div>
      </div>
    </div>
  );
}
