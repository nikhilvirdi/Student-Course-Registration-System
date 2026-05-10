'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Activity, 
  Bell, 
  ShieldCheck, 
  Server,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';
import { cn, displayName, apiFetch, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function AdminDashboardPage() {
  const { user } = useApp();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('scrs_token');
        
        // Fetch stats and logs in parallel
        const [statsData, logsData] = await Promise.all([
          apiFetch('/admin/stats', { token }),
          apiFetch('/admin/logs', { token }) // Using the admin logs endpoint
        ]);

        if (statsData.success) {
          setStats(statsData.data);
        }
        if (logsData.success) {
          setLogs(logsData.data.slice(0, 8)); // Get latest 8 logs
        }
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      trend: '+5% this month',
      trendUp: true,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Courses',
      value: stats?.totalCourses || 0,
      trend: 'Current Term',
      trendUp: true,
      icon: BookOpen,
      color: 'indigo'
    },
    {
      title: 'Total Enrollments',
      value: stats?.totalEnrollments || 0,
      trend: 'Across all courses',
      trendUp: true,
      icon: GraduationCap,
      color: 'purple'
    },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Management Console</h1>
          <p className="text-sidebar-fg text-sm mt-1">
            System overview for <span className="font-semibold text-foreground">Administrator {user.firstName}</span>. All nodes operational.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20 uppercase tracking-wider">
            <Server className="w-3.5 h-3.5" />
            System Status: Healthy
          </div>
          <button className="p-2 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg text-sidebar-fg transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-card border border-card-border rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                stat.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                stat.color === 'indigo' ? "bg-indigo-500/10 text-indigo-500" :
                "bg-purple-500/10 text-purple-500"
              )}>
                <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-sidebar-fg uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-3xl font-black text-foreground mt-1 tracking-tighter">
                  {loading ? <span className="animate-pulse bg-sidebar-accent h-8 w-16 rounded block ml-auto mt-1"></span> : stat.value}
                </h3>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-card-border/50">
              <span className={cn(
                "flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              )}>
                <TrendingUp className="w-3.5 h-3.5" />
                {stat.trend}
              </span>
              <Link href="#" className="text-xs font-medium text-sidebar-fg hover:text-primary flex items-center gap-1 group/link">
                Analysis <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Take 1/3 */}
        <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-card-border bg-sidebar-accent/30">
            <h2 className="text-lg font-bold text-foreground">Management Tasks</h2>
            <p className="text-sm text-sidebar-fg mt-1">Direct system interventions.</p>
          </div>
          <div className="p-6 grid grid-cols-1 gap-3 flex-1">
            {[
              { label: 'Register New Student', href: '/dashboard/admin/students', icon: Users, color: 'text-blue-500' },
              { label: 'Create New Course', href: '/dashboard/admin/courses', icon: Plus, color: 'text-green-500' },
              { label: 'Audit Enrollments', href: '/dashboard/admin/enrollments', icon: ShieldCheck, color: 'text-amber-500' },
              { label: 'System Settings', href: '/dashboard/settings', icon: Server, color: 'text-sidebar-fg' },
            ].map((action, i) => (
              <Link 
                key={i}
                href={action.href} 
                className="flex items-center gap-4 p-4 border border-card-border rounded-xl hover:border-primary/40 hover:bg-sidebar-accent/50 transition-all group"
              >
                <div className={cn("p-2 rounded-lg bg-sidebar-accent group-hover:bg-background transition-colors", action.color)}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground">{action.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-sidebar-fg/40 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Real Audit Logs - Take 2/3 */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-card-border flex items-center justify-between bg-sidebar-accent/30">
            <div>
              <h2 className="text-lg font-bold text-foreground">System Audit Stream</h2>
              <p className="text-sm text-sidebar-fg mt-1">Real-time trace of administrative and user actions.</p>
            </div>
            <Link href="/dashboard/admin/activity" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
              View Full Audit Trail
            </Link>
          </div>
          <div className="divide-y divide-card-border max-h-[450px] overflow-y-auto">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-sidebar-accent/50 transition-colors flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border",
                  log.user_role === 'ADMIN' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {log.user_name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground truncate">
                      {log.user_name} <span className="font-normal text-sidebar-fg">performed</span> {log.action}
                    </p>
                    <span className="text-[10px] font-medium text-sidebar-fg/60 uppercase">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-fg border border-card-border">
                      {log.type || 'system'}
                    </span>
                    <p className="text-xs text-sidebar-fg truncate">
                      Target: <span className="text-foreground/80">{log.target || 'System'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-sidebar-fg italic">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No recent system activity recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
