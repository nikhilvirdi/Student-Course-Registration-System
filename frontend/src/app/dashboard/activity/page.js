'use client';

import { Activity as ActivityIcon, CheckCircle2, Clock, Upload, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';

export default function ActivityPage() {
  const { activities } = useApp();

  const getIconProps = (type) => {
    switch(type) {
      case 'course': return { icon: Clock, bg: 'bg-amber-500/10', color: 'text-amber-500' };
      case 'task': return { icon: CheckCircle2, bg: 'bg-green-500/10', color: 'text-green-500' };
      case 'upload': return { icon: Upload, bg: 'bg-blue-500/10', color: 'text-blue-500' };
      case 'security': return { icon: Shield, bg: 'bg-red-500/10', color: 'text-red-500' };
      case 'system': 
      default: return { icon: ActivityIcon, bg: 'bg-sidebar-accent', color: 'text-foreground' };
    }
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader 
        icon={ActivityIcon}
        title="Activity Log"
        description="Recent actions and system updates."
      />

      <div className="bg-card border border-card-border rounded-xl shadow-sm p-6 w-full">
        {activities.length > 0 ? (
          <div className="relative border-l-2 border-sidebar-accent ml-4 space-y-10 pb-4">
            {activities.map((activity) => {
              const { icon: Icon, bg, color } = getIconProps(activity.type);
              
              return (
                <div key={activity.id} className="relative pl-10 group">
                  <div className={cn(
                    "absolute -left-4 top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-card group-hover:scale-110 transition-transform duration-200",
                    bg,
                    color
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 p-4 bg-background border border-card-border hover:border-card-border/80 rounded-xl transition-colors shadow-sm group-hover:shadow-md w-full">
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {activity.title || activity.target}
                      </h4>
                      <p className="text-sm text-sidebar-fg/80 mt-1.5 leading-relaxed">
                        {activity.description || `${activity.user} ${activity.action} ${activity.target ? `"${activity.target}"` : ''}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-fg bg-sidebar-accent px-3 py-1.5 rounded-md h-fit whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-sidebar-fg/70" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-sidebar-fg">
            <ActivityIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No recent activity found.</p>
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="pt-6 mt-2 border-t border-card-border flex justify-center">
            <button className="px-5 py-2.5 bg-sidebar-accent text-foreground text-sm font-semibold rounded-lg hover:bg-sidebar-accent/80 transition-colors">
              Load Older Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
