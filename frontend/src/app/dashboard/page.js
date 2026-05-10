'use client';

import { BookOpen, Users, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { displayName } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { courses, tasks, activities, user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.push('/dashboard/admin');
    }
  }, [user, router]);

  if (user?.role === 'ADMIN') {
    return null;
  }

  // Calculate stats from dynamic data
  const enrolledCourses = courses.filter(c => c.status === 'Enrolled');
  const pendingTasks = tasks.filter(t => !t.completed);
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 0), 0);

  const stats = [
    {
      title: 'Total Credits',
      value: totalCredits,
      trend: '+12% from last term',
      trendUp: true,
      progress: (totalCredits / 20) * 100, // Assuming 20 credits is full load
      icon: BookOpen,
    },
    {
      title: 'Active Courses',
      value: enrolledCourses.length,
      trend: 'Current Semester',
      trendUp: true,
      progress: 100,
      icon: Users,
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks.length,
      trend: pendingTasks.length > 5 ? 'High workload' : 'Manageable',
      trendUp: pendingTasks.length < 5,
      progress: Math.max(0, 100 - (pendingTasks.length * 10)),
      icon: Clock,
    },
  ];

  // Get next 5 courses
  const displayCourses = enrolledCourses.slice(0, 5);
  // Get next 3 pending tasks
  const displayTasks = pendingTasks.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {displayName(user)}!</h1>
          <p className="text-sidebar-fg text-sm mt-1">Here's what's happening with your studies today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-sidebar-fg">Current Term:</span>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Spring 2026</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-card-border rounded-xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-sidebar-fg">{stat.title}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{stat.value}</h3>
              </div>
              <div className="p-2 bg-sidebar-accent rounded-lg text-sidebar-fg">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={cn(
                "flex items-center gap-1 font-medium",
                stat.trendUp ? "text-primary" : "text-amber-500"
              )}>
                {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.trend}
              </span>
            </div>
            <div className="mt-4 h-2 bg-sidebar-accent rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", stat.trendUp ? "bg-primary" : "bg-amber-500")}
                style={{ width: `${Math.min(100, stat.progress)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-card-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Current Courses</h2>
                <p className="text-sm text-sidebar-fg mt-1">Manage your active enrollments and schedule.</p>
              </div>
              <Link href="/dashboard/courses" className="text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 px-4 py-2 rounded-lg transition-colors">
                View All
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-sidebar-fg bg-sidebar-accent/50 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Course Code</th>
                    <th className="px-4 py-3">Course Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Credits</th>
                    <th className="px-4 py-3">Next Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {displayCourses.length > 0 ? displayCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-sidebar-accent/50 transition-all duration-200 group cursor-pointer relative hover:z-10">
                      <td className="px-4 py-3 font-medium text-foreground group-hover:text-primary transition-colors">{course.code || course.id}</td>
                      <td className="px-4 py-3 text-foreground">{course.name}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border",
                          course.status === 'Enrolled' 
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sidebar-fg">{course.credits || 3} Cr.</td>
                      <td className="px-4 py-3 text-sidebar-fg group-hover:text-foreground transition-colors">
                        {course.nextClass || 'TBA'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-sidebar-fg italic">
                        No active courses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Content Area (1/3) */}
        <div className="space-y-6">
          <div className="bg-card border border-card-border rounded-xl shadow-sm">
            <div className="p-5 border-b border-card-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Upcoming Tasks</h2>
                <p className="text-sm text-sidebar-fg mt-1">Pending deadlines.</p>
              </div>
              <Link href="/dashboard/tasks" className="p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-fg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="p-5 space-y-4">
              {displayTasks.length > 0 ? displayTasks.map((task) => (
                <div key={task.id} className="group p-4 border border-card-border rounded-lg hover:border-primary/30 hover:bg-sidebar-accent/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 flex gap-3 cursor-pointer">
                  <div className="mt-0.5 text-sidebar-fg hover:text-primary transition-colors flex-shrink-0">
                    <div className="w-5 h-5 rounded-md border-2 border-sidebar-fg/40 group-hover:border-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </h4>
                    <p className="text-xs text-sidebar-fg mt-1 flex items-center gap-2">
                      <span className="font-medium text-primary">{task.course || 'General'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.date || 'Soon'}</span>
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-sidebar-fg italic text-sm">
                  All caught up! No pending tasks.
                </div>
              )}
              
              <Link 
                href="/dashboard/tasks"
                className="w-full py-2.5 mt-2 border border-dashed border-card-border rounded-lg text-sm font-medium text-sidebar-fg hover:text-foreground hover:border-sidebar-fg transition-colors flex items-center justify-center gap-2"
              >
                + View all tasks
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

