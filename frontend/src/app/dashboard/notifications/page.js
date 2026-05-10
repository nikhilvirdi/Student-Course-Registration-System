'use client';

import { Bell, MoreHorizontal, Check, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const notifications = [
  {
    id: 1,
    title: 'Registration Window Opening Soon',
    message: 'The Fall 2026 course registration window opens in 3 days. Please prepare your course cart.',
    time: '2 hours ago',
    type: 'info',
    read: false,
  },
  {
    id: 2,
    title: 'Overdue Assignment',
    message: 'You have a pending assignment for CS301 that is past due. Please submit it ASAP.',
    time: 'Yesterday, 14:20',
    type: 'warning',
    read: false,
  },
  {
    id: 3,
    title: 'New Message from Dr. Sarah Johnson',
    message: '"I have uploaded the review sheet for the upcoming midterm exam. Let me know if you have questions."',
    time: 'Yesterday, 09:15',
    type: 'message',
    read: true,
  },
  {
    id: 4,
    title: 'System Maintenance',
    message: 'The SCRS portal will undergo scheduled maintenance on Sunday from 2 AM to 4 AM EST.',
    time: 'May 06, 2026',
    type: 'info',
    read: true,
  },
  {
    id: 5,
    title: 'Waitlist Status Updated',
    message: 'Good news! You have been moved from the waitlist to enrolled for MTH201.',
    time: 'May 05, 2026',
    type: 'success',
    read: true,
  }
];

export default function NotificationsPage() {
  const getIcon = (type) => {
    switch(type) {
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <Check className="w-5 h-5 text-green-500" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-sidebar-fg" />;
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case 'info': return 'bg-blue-500/10';
      case 'warning': return 'bg-amber-500/10';
      case 'success': return 'bg-green-500/10';
      case 'message': return 'bg-purple-500/10';
      default: return 'bg-sidebar-accent';
    }
  };

  const getBorderColor = (type) => {
    switch(type) {
      case 'info': return 'border-l-blue-500';
      case 'warning': return 'border-l-amber-500';
      case 'success': return 'border-l-green-500';
      case 'message': return 'border-l-purple-500';
      default: return 'border-l-sidebar-border';
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-sidebar-fg">Stay updated with your courses and system alerts.</p>
          </div>
        </div>
        <button className="text-sm font-semibold text-foreground bg-sidebar-accent hover:bg-sidebar-accent/80 px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden w-full">
        <div className="divide-y divide-card-border">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={cn(
                "p-5 pl-6 flex gap-4 transition-colors hover:bg-sidebar-accent/30 relative border-l-4",
                getBorderColor(notification.type),
                !notification.read ? "bg-sidebar-accent/10" : ""
              )}
            >
              {!notification.read && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
              )}
              
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", getIconBg(notification.type))}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
                  <h4 className={cn("text-base font-bold", !notification.read ? "text-foreground" : "text-foreground/80")}>
                    {notification.title}
                  </h4>
                  <span className="text-xs font-semibold text-sidebar-fg bg-background px-2.5 py-1 rounded-md border border-card-border">{notification.time}</span>
                </div>
                <p className={cn("text-sm leading-relaxed", !notification.read ? "text-sidebar-fg/90" : "text-sidebar-fg/70")}>
                  {notification.message}
                </p>
                
                {!notification.read && (
                  <div className="mt-4 flex items-center gap-4">
                    <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-md">
                      View Details
                    </button>
                    <button className="text-xs font-semibold text-sidebar-fg hover:text-foreground transition-colors hover:bg-sidebar-accent px-3 py-1.5 rounded-md">
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
              
              <button className="text-sidebar-fg hover:text-foreground transition-colors p-2 h-fit rounded-lg hover:bg-sidebar-accent opacity-0 group-hover:opacity-100 focus:opacity-100">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
