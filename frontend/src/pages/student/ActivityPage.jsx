import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity as ActivityIcon, CheckCircle2, Clock, Upload, Shield, 
  Loader2, AlertCircle, RefreshCw, Filter, BookOpen, Info, Target, RotateCcw
} from 'lucide-react';
import { cn, apiFetch } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import { useApp } from '@/context/AppContext';

export default function ActivityPage() {
  const { user } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [limit, setLimit] = useState(25);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async (currentLimit = limit, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('limit', currentLimit);

      const data = await apiFetch(`/auth/logs?${params.toString()}`);
      if (data.success) {
        const records = data.data || [];
        setLogs(records);
        // If returned records is less than requested limit, no more logs to load
        setHasMore(records.length >= currentLimit);
      } else {
        setError(data.message || 'Failed to fetch activity logs');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLogs(limit, false);
  }, [typeFilter, limit]);

  const handleLoadOlder = () => {
    const newLimit = limit + 25;
    setLimit(newLimit);
    fetchLogs(newLimit, true);
  };

  const getIconProps = (type) => {
    switch(type) {
      case 'course': return { icon: BookOpen, bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
      case 'task': return { icon: CheckCircle2, bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 'upload': return { icon: Upload, bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      case 'security': return { icon: Shield, bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      case 'system': 
      default: return { icon: Info, bg: 'bg-primary/10 text-primary border-primary/20' };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Immediate client-side search filtering while typing
  const displayedLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter(item => 
      item.action?.toLowerCase().includes(q) ||
      item.target?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  // Counts
  const courseCount = logs.filter(l => l.type === 'course').length;
  const taskCount = logs.filter(l => l.type === 'task').length;
  const docCount = logs.filter(l => l.type === 'upload').length;

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          icon={ActivityIcon}
          title="Student Activity Timeline"
          description="Your verified audit trail of course registrations, assignments, document submissions, and profile updates."
        />
        <button 
          onClick={() => fetchLogs(limit, false)}
          disabled={loading}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-card-border bg-card hover:bg-sidebar-accent text-sidebar-fg transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
          title="Refresh Activity"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Your Events', value: logs.length, color: 'text-foreground', bg: 'bg-card' },
          { label: 'Course Actions', value: courseCount, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Task Activities', value: taskCount, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Files & Uploads', value: docCount, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map((s, i) => (
          <div key={i} className={cn("border border-card-border rounded-xl p-4 transition-all shadow-sm", s.bg)}>
            <p className="text-xs font-semibold text-sidebar-fg uppercase tracking-wider">{s.label}</p>
            <p className={cn("text-3xl font-extrabold mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Category Filter */}
      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs(limit, false)}
              placeholder="Search actions or course targets..."
              className="w-full"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-sidebar-fg hover:text-foreground px-2.5 py-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors flex items-center gap-1 self-end sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" /> Clear Search
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-card-border/60 overflow-x-auto">
          <span className="text-xs text-sidebar-fg font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'course', label: 'Courses' },
            { id: 'task', label: 'Tasks' },
            { id: 'upload', label: 'Documents' },
            { id: 'security', label: 'Security' },
            { id: 'system', label: 'System' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                typeFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-sidebar-accent/40 text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm p-6 w-full">
        {loading ? (
          <div className="py-20 text-center text-sidebar-fg flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-60" />
            <p className="font-medium animate-pulse text-sm">Fetching verified activity records...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-500 flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 opacity-30" />
            <p className="font-semibold text-sm">{error}</p>
            <button 
              onClick={() => fetchLogs(limit, false)} 
              className="text-xs underline hover:text-rose-600 font-medium"
            >
              Try reloading
            </button>
          </div>
        ) : displayedLogs.length > 0 ? (
          <div className="relative border-l-2 border-sidebar-accent/70 ml-4 space-y-8 pb-4">
            {displayedLogs.map((log) => {
              const { icon: Icon, bg } = getIconProps(log.type);
              
              return (
                <div key={log.log_id} className="relative pl-8 group">
                  {/* Timeline Node Icon */}
                  <div className={cn(
                    "absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-card group-hover:scale-110 transition-transform shadow-sm",
                    bg
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  
                  {/* Timeline Item Content */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 p-4 bg-background/60 border border-card-border hover:border-primary/40 rounded-xl transition-all shadow-sm group-hover:shadow-md w-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sidebar-accent text-sidebar-fg uppercase tracking-wider font-bold">
                          {log.type}
                        </span>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors font-mono">
                          {log.action}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-sidebar-fg mt-1">
                        <Target className="w-3 h-3 flex-shrink-0 text-sidebar-fg/60" />
                        <span className="font-medium text-foreground/80">{log.target}</span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex flex-col md:items-end gap-0.5 text-xs text-sidebar-fg whitespace-nowrap flex-shrink-0">
                      <span className="font-bold text-foreground bg-sidebar-accent/50 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sidebar-fg/70" />
                        {getRelativeTime(log.created_at)}
                      </span>
                      <span className="text-[10px] text-sidebar-fg/70">
                        {formatTime(log.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-sidebar-fg">
            <ActivityIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-foreground text-sm">No activity recorded</p>
            <p className="text-xs text-sidebar-fg mt-1">
              Actions you take (registering courses, completing tasks, updating profile) will appear here in real time.
            </p>
          </div>
        )}
        
        {/* Load More Button */}
        {!loading && displayedLogs.length > 0 && hasMore && (
          <div className="pt-6 mt-4 border-t border-card-border flex justify-center">
            <button 
              onClick={handleLoadOlder}
              disabled={loadingMore}
              className="px-5 py-2.5 bg-sidebar-accent/80 hover:bg-sidebar-accent text-foreground text-xs font-bold rounded-xl transition-all border border-card-border flex items-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Loading older activity...</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-sidebar-fg" />
                  <span>Load Older Activity</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
