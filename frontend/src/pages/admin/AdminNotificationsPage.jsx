import { useState, useEffect } from 'react';
import { Bell, User, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { apiFetch, cn, formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';

export default function AdminNotificationsPage() {
  const { token, user } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchNotifications();
    }
  }, [token, user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/notifications', { token });
      if (res.success) setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold text-center">Access Denied. Admins only.</div>;
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.message?.toLowerCase().includes(q) ||
      n.student?.name?.toLowerCase().includes(q)
    );
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="System Notifications"
        description="View all platform notifications across students."
      />

      {/* Filter bar */}
      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full sm:w-64"
          />
          <div className="flex items-center gap-1 bg-sidebar-accent rounded-lg p-1">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                  filter === f ? "bg-primary text-primary-foreground" : "text-sidebar-fg hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-sidebar-fg">
          <span className="font-bold text-foreground">{unreadCount}</span> unread
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-card-border">
          {loading ? (
            <div className="p-12 text-center text-sidebar-fg">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-sidebar-fg mx-auto mb-4 opacity-20" />
              <p className="text-sidebar-fg">No notifications found.</p>
            </div>
          ) : filteredNotifications.map((notif) => {
            const Icon = getTypeIcon(notif.type);
            return (
              <div key={notif.notification_id} className={cn(
                "p-4 hover:bg-sidebar-accent/30 transition-colors flex items-start gap-4",
                !notif.read && "bg-primary/5"
              )}>
                <div className={cn("p-2 rounded-lg mt-0.5", getTypeColor(notif.type))}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-foreground">{notif.title}</p>
                    <span className="text-[10px] text-sidebar-fg flex-shrink-0">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-sidebar-fg line-clamp-2">{notif.message}</p>
                  {notif.student && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-sidebar-fg">
                      <User className="w-3 h-3" />
                      {notif.student.name}
                    </div>
                  )}
                </div>
                {!notif.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
