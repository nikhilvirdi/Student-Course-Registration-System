'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, GraduationCap, Award, TrendingUp, Activity } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { apiFetch, cn, formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminAnalyticsPage() {
  const { token, user } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchAnalytics();
    }
  }, [token, user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/analytics', { token });
      if (res.success) setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold text-center">Access Denied. Admins only.</div>;
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sidebar-fg p-12">Loading analytics...</div>;
  }

  const stats = [
    { title: 'Total Students', value: analytics?.totalStudents || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Courses', value: analytics?.totalCourses || 0, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Active Enrollments', value: analytics?.activeEnrollments || 0, icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Average CGPA', value: analytics?.avgGPA?.toFixed(2) || '0.00', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Academic Analytics"
        description="System-wide academic performance metrics and enrollment trends."
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border border-card-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2.5 rounded-xl", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
            </div>
            <p className="text-xs font-medium text-sidebar-fg uppercase tracking-wider">{s.title}</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Breakdown */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-card-border bg-sidebar-accent/30">
            <h2 className="text-lg font-bold text-foreground">Enrollment Breakdown</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Active', value: analytics?.activeEnrollments || 0, color: 'bg-blue-500', total: (analytics?.activeEnrollments || 0) + (analytics?.completedEnrollments || 0) + (analytics?.droppedEnrollments || 0) },
              { label: 'Completed', value: analytics?.completedEnrollments || 0, color: 'bg-green-500', total: (analytics?.activeEnrollments || 0) + (analytics?.completedEnrollments || 0) + (analytics?.droppedEnrollments || 0) },
              { label: 'Dropped', value: analytics?.droppedEnrollments || 0, color: 'bg-red-500', total: (analytics?.activeEnrollments || 0) + (analytics?.completedEnrollments || 0) + (analytics?.droppedEnrollments || 0) },
            ].map((item, i) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-sm font-bold text-foreground">{item.value} <span className="text-sidebar-fg font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-sidebar-accent rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Occupancy */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-card-border bg-sidebar-accent/30">
            <h2 className="text-lg font-bold text-foreground">Course Occupancy</h2>
          </div>
          <div className="divide-y divide-card-border max-h-[350px] overflow-y-auto">
            {analytics?.courseOccupancy?.length > 0 ? analytics.courseOccupancy.map((c) => (
              <div key={c.course_id} className="p-4 hover:bg-sidebar-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.course_name}</p>
                    <p className="text-xs text-sidebar-fg">{c.course_code}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground">{c.enrolled}/{c.max_seats}</span>
                </div>
                <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      c.occupancyPercent > 80 ? "bg-red-500" :
                      c.occupancyPercent > 50 ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${c.occupancyPercent}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-sidebar-fg">No course data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-card-border bg-sidebar-accent/30">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Enrollment Activity
          </h2>
        </div>
        <div className="divide-y divide-card-border">
          {analytics?.recentEnrollments?.length > 0 ? analytics.recentEnrollments.map((e, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-sidebar-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {e.student?.name?.[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{e.student?.name} enrolled in <span className="text-primary">{e.course?.course_name}</span></p>
                  <p className="text-xs text-sidebar-fg">{e.course?.course_code}</p>
                </div>
              </div>
              <span className="text-xs text-sidebar-fg">{formatDate(e.enrollment_date)}</span>
            </div>
          )) : (
            <div className="p-8 text-center text-sidebar-fg">No recent enrollment activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}
