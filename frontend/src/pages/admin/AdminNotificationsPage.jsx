import { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  X, 
  Send,
  AlertCircle 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { apiFetch, cn, formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';

export default function AdminNotificationsPage() {
  const { token, user } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    department_id: '',
  });

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchNotifications();
      fetchDepartments();
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

  const fetchDepartments = async () => {
    try {
      const res = await apiFetch('/departments');
      if (res.success) setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        department_id: formData.department_id || null,
      };

      const res = await apiFetch('/admin/notifications', {
        method: 'POST',
        token,
        body: payload,
      });

      setSuccessMsg(res.message || 'Announcement broadcasted successfully');
      setShowModal(false);
      setFormData({ title: '', message: '', type: 'info', department_id: '' });
      await fetchNotifications();
    } catch (err) {
      setError(err.message || 'Failed to send announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      setError('');
      setSuccessMsg('');
      await apiFetch(`/admin/notifications/${id}`, {
        method: 'DELETE',
        token,
      });
      setSuccessMsg('Notification deleted');
      await fetchNotifications();
    } catch (err) {
      setError(err.message || 'Failed to delete notification');
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
        title="System Announcements & Notifications"
        description="Broadcast campus-wide announcements and view all notifications sent to students."
        action={
          <button
            onClick={() => {
              setError('');
              setSuccessMsg('');
              setShowModal(true);
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        }
      />

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
          <span className="font-bold text-foreground">{unreadCount}</span> unread / <span className="font-bold text-foreground">{notifications.length}</span> total
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
                "p-4 hover:bg-sidebar-accent/30 transition-colors flex items-start gap-4 group",
                !notif.read && "bg-primary/5"
              )}>
                <div className={cn("p-2 rounded-lg mt-0.5 shrink-0", getTypeColor(notif.type))}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-foreground">{notif.title}</p>
                    <span className="text-[10px] text-sidebar-fg flex-shrink-0">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-sidebar-fg leading-relaxed">{notif.message}</p>
                  {notif.student && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-sidebar-fg">
                      <User className="w-3 h-3 text-primary" />
                      <span>Recipient: <strong className="text-foreground">{notif.student.name}</strong> ({notif.student.email})</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!notif.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                  <button
                    onClick={() => handleDelete(notif.notification_id)}
                    className="p-1.5 text-sidebar-fg hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-lg shadow-xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-card-border mb-5">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Broadcast Announcement
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  Announcement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Registration Deadline Extended"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  Message Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the announcement details to be delivered to students..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                    Notification Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="success">Success (Green)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">All Students (Campus-wide)</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name} Dept Only
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-sidebar-fg hover:bg-sidebar-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
