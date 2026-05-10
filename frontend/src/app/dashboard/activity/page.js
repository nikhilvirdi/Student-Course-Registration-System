'use client';

import { useState, useEffect } from 'react';
import { Activity as ActivityIcon, CheckCircle2, Clock, Upload, Shield, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn, apiFetch } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';

export default function ActivityPage() {
  const { user, token } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch('/auth/logs', { token });
      if (data.success) {
        setLogs(data.data);
      } else {
        setError(data.message || 'Failed to fetch activity logs');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-start">
        <PageHeader 
          icon={ActivityIcon}
          title="Activity Log"
          description="Your recent actions and system updates."
        />
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="mt-4 p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all disabled:opacity-50"
          title="Refresh Logs"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm p-6 w-full">
        {loading ? (
          <div className="py-20 text-center text-sidebar-fg flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            <p className="animate-pulse font-medium">Fetching your activity trail...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-500 flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 opacity-20" />
            <p className="font-semibold">{error}</p>
            <button onClick={fetchLogs} className="text-sm underline hover:text-rose-600 transition-colors">Try again</button>
          </div>
        ) : logs.length > 0 ? (
          <div className="relative border-l-2 border-sidebar-accent ml-4 space-y-10 pb-4">
            {logs.map((log) => {
              const { icon: Icon, bg, color } = getIconProps(log.type);
              
              return (
                <div key={log.log_id} className="relative pl-10 group">
                  <div className={cn(
                    "absolute -left-4 top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-card group-hover:scale-110 transition-transform duration-200",
                    bg,
                    color
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 p-4 bg-background border border-card-border hover:border-card-border/80 rounded-xl transition-colors shadow-sm group-hover:shadow-md w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-fg uppercase tracking-wider font-bold">
                          {log.type}
                        </span>
                        <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {log.action.replace('_', ' ')}
                        </h4>
                      </div>
                      <p className="text-sm text-sidebar-fg/80 leading-relaxed">
                        {log.target}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-fg bg-sidebar-accent px-3 py-1.5 rounded-md h-fit whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-sidebar-fg/70" />
                      {formatTime(log.created_at)}
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
        
        {!loading && logs.length > 0 && (
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
