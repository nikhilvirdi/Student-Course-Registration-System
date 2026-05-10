'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Activity, Clock, User, Target, Info, Shield, AlertCircle, BookOpen, CheckCircle, FileText, Loader2, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { cn, apiFetch } from '@/lib/utils';

export default function AdminActivityPage() {
  const { user, token } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/logs', { token });
      if (data.success) {
        setLogs(data.data);
      } else {
        setError(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) {
      fetchLogs();
    }
  }, [user, token]);

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold text-center">Access Denied. Admins only.</div>;
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'task': return CheckCircle;
      case 'security': return Shield;
      case 'upload': return FileText;
      case 'system': return Info;
      default: return Activity;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'text-blue-500 bg-blue-500/10';
      case 'task': return 'text-emerald-500 bg-emerald-500/10';
      case 'security': return 'text-rose-500 bg-rose-500/10';
      case 'upload': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-primary bg-primary/10';
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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader 
          icon={Activity}
          title="System Activity Logs"
          description="Monitor real-time actions and changes across the SCRS platform."
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

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-card-border flex justify-between items-center bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">Recent Events</h2>
          <span className="text-xs text-sidebar-fg font-medium bg-sidebar-accent px-2 py-1 rounded-md">
            {logs.length} events logged
          </span>
        </div>
        
        <div className="divide-y divide-card-border">
          {loading ? (
            <div className="p-20 text-center text-sidebar-fg flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
              <p className="animate-pulse">Retrieving audit trail...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500 flex flex-col items-center gap-3">
              <AlertCircle className="w-12 h-12 opacity-20" />
              <p>{error}</p>
              <button onClick={fetchLogs} className="text-sm underline">Try again</button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-sidebar-fg">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No activity logs found. System is currently quiet.</p>
            </div>
          ) : (
            logs.map((item) => {
              const Icon = getTypeIcon(item.type);
              return (
                <div key={item.log_id} className="p-4 hover:bg-sidebar-accent/20 transition-colors flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg mt-1", getTypeColor(item.type))}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <p className="text-sm font-medium text-foreground">
                        <span className="font-bold text-primary">{item.user_name}</span> 
                        <span className="text-sidebar-fg ml-1 text-xs px-1.5 py-0.5 bg-sidebar-accent/30 rounded uppercase tracking-tighter">
                          {item.user_role}
                        </span>
                        <span className="ml-1">{item.action.toLowerCase().replace('_', ' ')}</span>
                      </p>
                      <span className="text-[10px] text-sidebar-fg flex items-center gap-1 font-medium bg-sidebar-accent/50 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> {formatTime(item.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-sidebar-fg flex items-center gap-1">
                        <Target className="w-3 h-3" /> {item.target}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-fg uppercase tracking-wider font-bold">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

