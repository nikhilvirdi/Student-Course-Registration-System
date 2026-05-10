'use client';

import { useState } from 'react';
import { BookOpen, Clock, Users, MoreVertical, Calendar, CheckCircle, Search, Filter, Book, Award } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import FilterTabs from '@/components/ui/FilterTabs';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';

export default function CoursesPage() {
  const { courses, enrollCourse } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All Courses');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'All Courses', label: 'All Courses' },
    { id: 'Enrolled', label: 'Enrolled' },
    { id: 'Waitlisted', label: 'Waitlisted' },
    { id: 'Past', label: 'Past' },
  ];

  const filteredCourses = courses.filter(course => {
    // Tab filter
    if (activeTab !== 'All Courses' && course.status !== activeTab) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.name.toLowerCase().includes(query) || 
        course.code.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={BookOpen}
        title="My Courses"
        description="Manage your academic schedule and course progress."
        action={
          <button 
            onClick={() => {
              setActiveTab('All Courses');
              setSearchQuery('');
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            Browse Catalog
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <FilterTabs 
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
        />
        
        <div className="flex items-center gap-3">
          <SearchInput 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full sm:w-64"
          />
          <button className="p-2 bg-card border border-card-border rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-5 border-b border-card-border relative overflow-hidden">
                {/* Background Accent */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 rounded-full"
                  style={{ backgroundColor: course.color || 'currentColor' }}
                />
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <StatusBadge status={course.status} />
                  <button className="text-sidebar-fg hover:text-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors relative z-10 line-clamp-1">
                  {course.name}
                </h3>
                <p className="text-sm text-sidebar-fg relative z-10">{course.code} • {course.instructor}</p>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {course.tags?.map(tag => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 bg-sidebar-accent text-sidebar-fg rounded border border-card-border/50">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div className="flex items-center gap-2 text-sidebar-fg">
                    <Award className="w-4 h-4 text-primary/70" />
                    <span>{course.credits} Credits</span>
                  </div>
                  <div className="flex items-center gap-2 text-sidebar-fg">
                    <Users className="w-4 h-4 text-primary/70" />
                    <span>{course.students} Students</span>
                  </div>
                  {course.schedule ? (
                    <div className="flex items-start gap-2 text-sidebar-fg col-span-2">
                      <Calendar className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                      <div>
                        <div className="truncate">{course.schedule}</div>
                        {course.room && <div className="text-sidebar-fg/70">{course.room}</div>}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sidebar-fg/50 col-span-2 italic">
                      <Calendar className="w-4 h-4" />
                      <span>Schedule not set</span>
                    </div>
                  )}
                </div>

                {course.status !== 'Waitlisted' && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-bold text-sidebar-fg uppercase tracking-tighter">Progress</span>
                      <span className="font-bold text-foreground">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", course.status === 'Past' ? "bg-sidebar-fg" : "bg-primary")}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-sidebar-accent/30 border-t border-card-border flex gap-3">
                <button className="flex-1 py-2 bg-background border border-card-border hover:bg-sidebar-accent hover:text-foreground rounded-lg text-xs font-bold uppercase tracking-wider text-sidebar-fg transition-all active:scale-95">
                  Syllabus
                </button>
                {course.status === 'Available' ? (
                  <button 
                    onClick={async () => {
                      try {
                        await enrollCourse(course.id);
                        toast({ title: 'Success', description: 'Enrolled successfully!', type: 'success' });
                      } catch (err) {
                        toast({ title: 'Enrollment Failed', description: err.message || 'Failed to enroll in course', type: 'error' });
                      }
                    }}
                    className="flex-1 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                  >
                    Enroll
                  </button>
                ) : (
                  <button className="flex-1 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm">
                    Launch
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-card border border-card-border rounded-xl">
          <div className="w-16 h-16 bg-sidebar-accent rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-sidebar-fg" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No courses found</h3>
          <p className="text-sidebar-fg max-w-xs mt-1">
            {searchQuery 
              ? `We couldn't find any courses matching "${searchQuery}".` 
              : "You aren't currently enrolled in any courses for this selection."}
          </p>
        </div>
      )}
    </div>
  );
}

