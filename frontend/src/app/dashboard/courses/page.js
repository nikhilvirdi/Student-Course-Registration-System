'use client';

import { BookOpen, Clock, Users, MoreVertical, Calendar, CheckCircle, Search, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const courses = [
  {
    id: 'CS301',
    name: 'Data Structures & Algorithms',
    instructor: 'Dr. Sarah Johnson',
    status: 'Enrolled',
    progress: 45,
    students: 120,
    nextClass: 'Mon, 10:00 AM',
    credits: 4,
    tags: ['Core', 'Programming']
  },
  {
    id: 'CS302',
    name: 'Database Management Systems',
    instructor: 'Prof. Michael Chen',
    status: 'Enrolled',
    progress: 60,
    students: 85,
    nextClass: 'Tue, 11:30 AM',
    credits: 3,
    tags: ['Core', 'Theory']
  },
  {
    id: 'MTH201',
    name: 'Discrete Mathematics',
    instructor: 'Dr. Emily White',
    status: 'Waitlisted',
    progress: 0,
    students: 150,
    nextClass: 'Wed, 09:00 AM',
    credits: 3,
    tags: ['Math', 'Required']
  },
  {
    id: 'ENG101',
    name: 'Technical Writing',
    instructor: 'Prof. David Davis',
    status: 'Enrolled',
    progress: 85,
    students: 40,
    nextClass: 'Thu, 02:00 PM',
    credits: 2,
    tags: ['Elective', 'Soft Skills']
  },
  {
    id: 'CS405',
    name: 'Artificial Intelligence',
    instructor: 'Dr. Robert Turing',
    status: 'Past',
    progress: 100,
    students: 60,
    nextClass: '-',
    credits: 4,
    tags: ['Advanced', 'Core']
  },
  {
    id: 'CS410',
    name: 'Software Engineering',
    instructor: 'Prof. Ada Lovelace',
    status: 'Enrolled',
    progress: 20,
    students: 95,
    nextClass: 'Fri, 01:00 PM',
    credits: 3,
    tags: ['Project', 'Core']
  }
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-sm text-sidebar-fg mt-1">Manage your academic schedule and course progress.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Browse Catalog
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['All Courses', 'Enrolled', 'Waitlisted', 'Past'].map((tab, i) => (
            <button 
              key={tab}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                i === 0 
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-card text-sidebar-fg border-card-border hover:bg-sidebar-accent hover:text-foreground"
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
              placeholder="Search courses..." 
              className="pl-9 pr-4 py-2 bg-card border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-64 transition-all"
            />
          </div>
          <button className="p-2 bg-card border border-card-border rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden hover:border-primary/50 transition-colors group">
            <div className="p-5 border-b border-card-border">
              <div className="flex justify-between items-start mb-3">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border",
                  course.status === 'Enrolled' && "bg-primary/10 text-primary border-primary/20",
                  course.status === 'Waitlisted' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                  course.status === 'Past' && "bg-sidebar-accent text-sidebar-fg border-card-border"
                )}>
                  {course.status}
                </span>
                <button className="text-sidebar-fg hover:text-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{course.name}</h3>
              <p className="text-sm text-sidebar-fg">{course.id} • {course.instructor}</p>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {course.tags.map(tag => (
                  <span key={tag} className="text-[11px] font-medium px-2 py-0.5 bg-sidebar-accent text-sidebar-fg rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-sidebar-fg">
                  <Clock className="w-4 h-4" />
                  <span>{course.credits} Credits</span>
                </div>
                <div className="flex items-center gap-2 text-sidebar-fg">
                  <Users className="w-4 h-4" />
                  <span>{course.students} Students</span>
                </div>
                <div className="flex items-center gap-2 text-sidebar-fg col-span-2">
                  <Calendar className="w-4 h-4" />
                  <span className="truncate">Next: {course.nextClass}</span>
                </div>
              </div>

              {course.status !== 'Waitlisted' && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-sidebar-fg">Course Progress</span>
                    <span className="font-medium text-foreground">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", course.status === 'Past' ? "bg-sidebar-fg" : "bg-primary")}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-sidebar-accent/50 border-t border-card-border flex gap-3">
              <button className="flex-1 py-2 bg-background border border-card-border hover:bg-sidebar-accent rounded-lg text-sm font-medium text-foreground transition-colors">
                View Syllabus
              </button>
              <button className="flex-1 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-sm font-medium transition-colors">
                Go to Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
