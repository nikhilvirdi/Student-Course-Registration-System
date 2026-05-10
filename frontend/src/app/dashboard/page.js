'use client';

import { BookOpen, Users, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const stats = [
  {
    title: 'Total Credits Earned',
    value: '45',
    trend: '+12%',
    trendUp: true,
    progress: 45,
    icon: BookOpen,
  },
  {
    title: 'Active Courses',
    value: '4',
    trend: 'Current Semester',
    trendUp: true,
    progress: 100,
    icon: Users,
  },
  {
    title: 'Pending Assignments',
    value: '7',
    trend: '-2',
    trendUp: false,
    progress: 30,
    icon: Clock,
  },
];

const currentCourses = [
  { id: 'CS301', name: 'Data Structures & Algorithms', status: 'Enrolled', nextClass: 'Mon, 10:00 AM', credits: 4, priority: 'High' },
  { id: 'CS302', name: 'Database Management Systems', status: 'Enrolled', nextClass: 'Tue, 11:30 AM', credits: 3, priority: 'Medium' },
  { id: 'MTH201', name: 'Discrete Mathematics', status: 'Waitlisted', nextClass: 'Wed, 09:00 AM', credits: 3, priority: 'Low' },
  { id: 'ENG101', name: 'Technical Writing', status: 'Enrolled', nextClass: 'Thu, 02:00 PM', credits: 2, priority: 'Medium' },
];

const upcomingTasks = [
  { id: 1, title: 'Submit DBMS Final Project', course: 'CS302', date: 'May 15, 2026', author: 'Prof. Smith', completed: false },
  { id: 2, title: 'Midterm Evaluation', course: 'CS301', date: 'May 18, 2026', author: 'Dr. Johnson', completed: false },
  { id: 3, title: 'Read Chapter 4 & 5', course: 'ENG101', date: 'May 12, 2026', author: 'Prof. Davis', completed: true },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
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
                style={{ width: `${stat.progress}%` }}
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
              <button className="text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 px-4 py-2 rounded-lg transition-colors">
                View Catalog
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-sidebar-fg bg-sidebar-accent/50 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Course Code</th>
                    <th className="px-4 py-3">Course Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Credits</th>
                    <th className="px-4 py-3">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {currentCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-sidebar-accent/50 transition-all duration-200 group cursor-pointer relative hover:z-10">
                      <td className="px-4 py-3 font-medium text-foreground group-hover:text-primary transition-colors">{course.id}</td>
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
                      <td className="px-4 py-3 text-sidebar-fg">{course.credits} Cr.</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-sidebar-fg group-hover:text-foreground transition-colors">
                          {course.priority === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          {course.priority === 'Medium' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {course.priority === 'Low' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          {course.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                <p className="text-sm text-sidebar-fg mt-1">Deadlines and assignments.</p>
              </div>
              <button className="p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-fg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="group p-4 border border-card-border rounded-lg hover:border-primary/30 hover:bg-sidebar-accent/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 flex gap-3 cursor-pointer">
                  <button className="mt-0.5 text-sidebar-fg hover:text-primary transition-colors flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-sidebar-fg/40 group-hover:border-primary" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "text-sm font-medium text-foreground truncate",
                      task.completed && "line-through text-sidebar-fg"
                    )}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-sidebar-fg mt-1 flex items-center gap-2">
                      <span className="font-medium">{task.course}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.date}</span>
                    </p>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-2.5 mt-2 border border-dashed border-card-border rounded-lg text-sm font-medium text-sidebar-fg hover:text-foreground hover:border-sidebar-fg transition-colors flex items-center justify-center gap-2">
                + View all tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
