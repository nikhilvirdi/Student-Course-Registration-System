'use client';

import { CheckCircle2, Clock, Calendar, MoreHorizontal, Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const tasks = [
  { id: 1, title: 'Submit DBMS Final Project', course: 'CS302', dueDate: 'Today, 11:59 PM', priority: 'High', status: 'In Progress' },
  { id: 2, title: 'Read Chapter 4 & 5', course: 'ENG101', dueDate: 'Tomorrow, 10:00 AM', priority: 'Medium', status: 'To Do' },
  { id: 3, title: 'Midterm Evaluation', course: 'CS301', dueDate: 'May 18, 2026', priority: 'High', status: 'To Do' },
  { id: 4, title: 'Algorithm Analysis Paper', course: 'CS301', dueDate: 'May 20, 2026', priority: 'Medium', status: 'In Progress' },
  { id: 5, title: 'Group Meeting Notes', course: 'CS410', dueDate: 'May 12, 2026', priority: 'Low', status: 'Completed' },
  { id: 6, title: 'Weekly Quiz 5', course: 'MTH201', dueDate: 'May 10, 2026', priority: 'High', status: 'Completed' },
];

export default function TasksPage() {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-sidebar-fg bg-sidebar-accent border-card-border';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <div className="w-5 h-5 rounded-md border-2 border-sidebar-fg/40 hover:border-primary transition-colors cursor-pointer" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks & Assignments</h1>
          <p className="text-sm text-sidebar-fg mt-1">Keep track of your coursework and deadlines.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm">
        <div className="p-5 border-b border-card-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All Tasks', 'To Do', 'In Progress', 'Completed'].map((tab, i) => (
              <button 
                key={tab}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  i === 0 
                    ? "bg-foreground text-background border-foreground" 
                    : "bg-background text-sidebar-fg border-card-border hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-fg" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-9 pr-4 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-64 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-card-border p-2">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 rounded-lg flex items-start gap-4 hover:bg-sidebar-accent/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group">
              <div className="mt-0.5">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className={cn(
                    "text-base font-semibold text-foreground mb-1",
                    task.status === 'Completed' && "line-through text-sidebar-fg"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-sidebar-fg">
                    <span className="font-medium bg-sidebar-accent px-2 py-0.5 rounded text-foreground">{task.course}</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className={cn(
                        task.dueDate.includes('Today') || task.dueDate.includes('Tomorrow') ? "text-amber-500 font-medium" : ""
                      )}>
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                  <button className="p-2 text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
