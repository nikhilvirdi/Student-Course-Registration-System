import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Activity, Clock, Target, Info, Shield, AlertCircle, BookOpen, 
  CheckCircle, FileText, Loader2, RefreshCw, Filter, User, Search,
  RotateCcw, SlidersHorizontal, ChevronDown, CheckCircle2, AlertTriangle
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import { cn, apiFetch } from '@/lib/utils';

export default function AdminActivityPage() {
  const { user, token } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [limit, setLimit] = useState(100);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('limit', limit);

      const data = await apiFetch(`/admin/logs?${params.toString()}`, { role: 'ADMIN' });
      if (data.success) {
        setLogs(data.data || []);
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
    fetchLogs();
  }, [typeFilter, roleFilter, limit]);

  // Client-side quick filter on search query for instant responsiveness while typing
  const displayedLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter(item => 
      item.user_name?.toLowerCase().includes(q) ||
      item.action?.toLowerCase().includes(q) ||
      item.target?.toLowerCase().includes(q) ||
      item.user_role?.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

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
      case 'course': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'task': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'security': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'upload': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
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

  // Counts by category from currently fetched logs
  const courseLogsCount = logs.filter(l => l.type === 'course').length;
  const taskLogsCount = logs.filter(l => l.type === 'task').length;
  const securityLogsCount = logs.filter(l => l.type === 'security').length;
  const systemLogsCount = logs.filter(l => l.type === 'system').length;

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setRoleFilter('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'ALL' || roleFilter !== 'ALL';

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center bg-card border border-card-border rounded-2xl max-w-md mx-auto my-12 space-y-4">
        <Shield className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Admin Access Required</h2>
        <p className="text-sm text-sidebar-fg">
          You are currently viewing SCRS in Student demo mode. Switch to Admin mode in the header or sidebar to view the system audit trail.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          icon={Activity}
          title="System Activity & Audit Logs"
          description="Complete audit trail of enrollment changes, course updates, grades, and administrative actions."
        />
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-card-border bg-card hover:bg-sidebar-accent text-sidebar-fg transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
          title="Refresh Audit Logs"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: logs.length, color: 'text-foreground', bg: 'bg-card' },
          { label: 'Course Events', value: courseLogsCount, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Academic / Tasks', value: taskLogsCount, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Security & System', value: securityLogsCount + systemLogsCount, color: 'text-rose-500', bg: 'bg-rose-500/5' },
        ].map((s, i) => (
          <div key={i} className={cn("border border-card-border rounded-xl p-4 transition-all shadow-sm", s.bg)}>
            <p className="text-xs font-semibold text-sidebar-fg uppercase tracking-wider">{s.label}</p>
            <p className={cn("text-3xl font-extrabold mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              placeholder="Search user, action keyword, course or target..."
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="relative min-w-[140px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full appearance-none bg-background border border-card-border rounded-lg px-3 py-2 text-xs font-medium text-foreground pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Categories</option>
                <option value="course">Course & Enrollments</option>
                <option value="task">Tasks & Deadlines</option>
                <option value="security">Security & Auth</option>
                <option value="upload">Documents & Uploads</option>
                <option value="system">System & Settings</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sidebar-fg absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Role Dropdown */}
            <div className="relative min-w-[130px]">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none bg-background border border-card-border rounded-lg px-3 py-2 text-xs font-medium text-foreground pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admins Only</option>
                <option value="STUDENT">Students Only</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sidebar-fg absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Limit Selector */}
            <div className="relative min-w-[110px]">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full appearance-none bg-background border border-card-border rounded-lg px-3 py-2 text-xs font-medium text-foreground pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={200}>Last 200</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sidebar-fg absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-sidebar-fg hover:text-foreground px-2.5 py-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors flex items-center gap-1"
                title="Reset filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-card-border/60 overflow-x-auto">
          <span className="text-xs text-sidebar-fg font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'course', label: 'Courses & Enrollments' },
            { id: 'task', label: 'Tasks' },
            { id: 'security', label: 'Security' },
            { id: 'upload', label: 'Uploads' },
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

      {/* Main Audit Trail Feed */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-card-border flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Recorded Events</h2>
            <span className="text-xs text-sidebar-fg font-mono bg-sidebar-accent px-2 py-0.5 rounded">
              {displayedLogs.length} events
            </span>
          </div>
          {hasActiveFilters && (
            <span className="text-xs text-sidebar-fg italic">
              Filtered results active
            </span>
          )}
        </div>
        
        <div className="divide-y divide-card-border">
          {loading ? (
            <div className="p-20 text-center text-sidebar-fg flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-60" />
              <p className="font-medium animate-pulse text-sm">Querying PostgreSQL audit logs...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 opacity-30" />
              <p className="font-semibold text-sm">{error}</p>
              <button 
                onClick={fetchLogs} 
                className="text-xs underline hover:text-rose-600 font-medium"
              >
                Try reloading logs
              </button>
            </div>
          ) : displayedLogs.length === 0 ? (
            <div className="p-16 text-center text-sidebar-fg">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-foreground text-sm">No activity logs found</p>
              <p className="text-xs text-sidebar-fg mt-1">
                {hasActiveFilters 
                  ? 'No audit records match the current filters. Try resetting search or category.' 
                  : 'The system has not recorded any activity under this category yet.'}
              </p>
            </div>
          ) : (
            displayedLogs.map((item) => {
              const Icon = getTypeIcon(item.type);
              const colorClass = getTypeColor(item.type);

              return (
                <div 
                  key={item.log_id} 
                  className="p-4 hover:bg-sidebar-accent/25 transition-colors flex items-start gap-4"
                >
                  {/* Category Icon Badge */}
                  <div className={cn("p-2.5 rounded-xl border mt-0.5 flex-shrink-0", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Main Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        <span className="font-bold text-foreground">
                          {item.user_name}
                        </span>
                        
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border",
                          item.user_role === 'ADMIN' 
                            ? "bg-purple-500/10 text-purple-600 border-purple-500/20" 
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        )}>
                          {item.user_role}
                        </span>

                        <span className="text-sidebar-fg text-xs">performed</span>

                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-sidebar-accent/80 font-bold text-primary">
                          {item.action}
                        </span>
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center gap-2 text-xs text-sidebar-fg flex-shrink-0">
                        <span className="font-semibold text-foreground/80 bg-sidebar-accent/50 px-2 py-0.5 rounded text-[11px]">
                          {getRelativeTime(item.created_at)}
                        </span>
                        <span className="hidden md:inline text-[11px] text-sidebar-fg/80" title={item.created_at}>
                          {formatTime(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Target & Context Details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-sidebar-fg bg-sidebar-accent/30 px-2.5 py-1 rounded-lg border border-card-border/50 max-w-full">
                        <Target className="w-3.5 h-3.5 flex-shrink-0 text-sidebar-fg/70" />
                        <span className="truncate font-medium text-foreground/90">{item.target}</span>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-sidebar-accent text-sidebar-fg uppercase font-bold tracking-wider">
                        {item.type}
                      </span>

                      {item.user_id && (
                        <span className="text-[10px] font-mono text-sidebar-fg/60">
                          id: {item.user_id.substring(0, 8)}...
                        </span>
                      )}
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
