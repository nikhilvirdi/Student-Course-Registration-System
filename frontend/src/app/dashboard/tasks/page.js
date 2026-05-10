'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle,
  Trash2,
  CheckCircle,
  Circle,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import FilterTabs from '@/components/ui/FilterTabs';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';

export default function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', category: 'Assignment', priority: 'Medium', dueDate: '' });

  const tabs = [
    { id: 'All Tasks', label: 'All Tasks' },
    { id: 'To Do', label: 'To Do' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' }
  ];

  const filteredTasks = tasks.filter(task => {
    // Tab filter
    if (activeTab === 'To Do' && (task.completed || task.status === 'In Progress')) return false;
    if (activeTab === 'In Progress' && (task.completed || task.status !== 'In Progress')) return false;
    if (activeTab === 'Completed' && !task.completed) return false;
    
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast({ title: 'Error', description: 'Task title is required', type: 'error' });
      return;
    }
    addTask({
      ...newTask,
      status: 'To Do',
      completed: false
    });
    setNewTask({ title: '', category: 'Assignment', priority: 'Medium', dueDate: '' });
    setIsAddingTask(false);
    toast({ title: 'Success', description: 'Task added successfully', type: 'success' });
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        icon={CheckCircle2}
        title="Tasks & Assignments"
        description="Keep track of your coursework and deadlines."
        action={
          <button 
            onClick={() => setIsAddingTask(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        }
      />

      {/* Add Task Form (Inline) */}
      {isAddingTask && (
        <div className="bg-card border border-primary/30 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Create New Task</h2>
            <button onClick={() => setIsAddingTask(false)} className="text-sidebar-fg hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-sidebar-fg uppercase tracking-wider mb-1.5">Task Title</label>
              <input 
                type="text" 
                placeholder="e.g., Submit DBMS Final Project"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sidebar-fg uppercase tracking-wider mb-1.5">Category</label>
              <select 
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all appearance-none"
              >
                {['Assignment', 'Project', 'Study', 'Exam', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-sidebar-fg uppercase tracking-wider mb-1.5">Priority</label>
              <select 
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all appearance-none"
              >
                {['High', 'Medium', 'Low'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-sidebar-fg uppercase tracking-wider mb-1.5">Due Date</label>
              <input 
                type="text" 
                placeholder="e.g., Today, Tomorrow, or May 15"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
              <button 
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-sidebar-fg hover:bg-sidebar-accent transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all active:scale-95"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        {/* Filters & Search */}
        <div className="p-5 border-b border-card-border flex flex-col sm:flex-row justify-between gap-4 bg-card/50">
          <FilterTabs 
            tabs={tabs}
            active={activeTab}
            onChange={setActiveTab}
          />
          
          <div className="flex items-center gap-3">
            <SearchInput 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full sm:w-64"
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="divide-y divide-card-border">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "p-4 flex items-start gap-4 hover:bg-sidebar-accent/20 transition-all duration-200 group",
                  task.completed && "opacity-75"
                )}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-sidebar-fg hover:text-primary transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <div className="w-6 h-6 rounded-lg border-2 border-sidebar-fg/30 hover:border-primary transition-all group-hover:scale-110" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className={cn(
                      "text-base font-semibold text-foreground mb-1 truncate",
                      task.completed && "line-through text-sidebar-fg"
                    )}>
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-sidebar-fg">
                      <span className="font-medium bg-sidebar-accent px-2 py-0.5 rounded text-foreground text-xs uppercase tracking-tight">
                        {task.category || task.course}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className={cn(
                          (task.dueDate?.includes('Today') || task.dueDate?.includes('Tomorrow')) && !task.completed 
                            ? "text-amber-500 font-medium" 
                            : ""
                        )}>
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <StatusBadge status={task.priority} />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          deleteTask(task.id);
                          toast({ title: 'Success', description: 'Task deleted', type: 'success' });
                        }}
                        className="p-2 text-sidebar-fg hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-sidebar-accent rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-sidebar-fg" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
              <p className="text-sidebar-fg max-w-xs mt-1">
                {searchQuery 
                  ? `No tasks matching "${searchQuery}" were found.` 
                  : "You're all caught up! Enjoy your free time or create a new task."}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setIsAddingTask(true)}
                  className="mt-6 text-primary font-medium hover:underline flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create your first task
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

