import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Filter, 
  Award, 
  X, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Building2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import FilterTabs from '@/components/ui/FilterTabs';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';

export default function CoursesPage() {
  const { courses, enrollCourse, dropCourse } = useApp();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('All Courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [syllabusCourse, setSyllabusCourse] = useState(null);

  const tabs = [
    { id: 'All Courses', label: 'All Courses' },
    { id: 'Enrolled', label: 'Enrolled' },
    { id: 'Available', label: 'Available' },
  ];

  // Extract unique departments for filtering
  const departments = ['All', ...Array.from(new Set(courses.map(c => c.department || c.tags?.[0]).filter(Boolean)))];

  const filteredCourses = courses.filter(course => {
    // Tab filter
    if (activeTab === 'Enrolled' && course.status !== 'Enrolled') return false;
    if (activeTab === 'Available' && course.status !== 'Available') return false;
    
    // Department filter
    if (selectedDepartment !== 'All' && (course.department !== selectedDepartment && course.tags?.[0] !== selectedDepartment)) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.name?.toLowerCase().includes(query) || 
        course.code?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={BookOpen}
        title="Course Catalog & Registration"
        description="Browse available university courses, check prerequisites, and manage your enrollments."
        action={
          <button 
            onClick={() => {
              setActiveTab('Available');
              setSearchQuery('');
              setSelectedDepartment('All');
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            Browse Available
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <FilterTabs 
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
        />
        
        <div className="flex items-center gap-3 w-full sm:w-auto relative">
          <SearchInput 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, instructors..."
            className="w-full sm:w-64"
          />
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={cn(
                "p-2 bg-card border rounded-lg transition-colors flex items-center gap-1.5 text-sm",
                selectedDepartment !== 'All' 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-card-border text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent"
              )}
              title="Filter by Department"
            >
              <Filter className="w-4 h-4" />
              {selectedDepartment !== 'All' && (
                <span className="text-xs font-semibold max-w-[80px] truncate">{selectedDepartment}</span>
              )}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-card-border rounded-xl shadow-lg p-2 z-20 animate-in fade-in zoom-in-95">
                <div className="text-xs font-bold text-sidebar-fg px-2 py-1 mb-1 border-b border-card-border uppercase tracking-wider">
                  Filter Department
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setShowFilterDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors truncate",
                        selectedDepartment === dept
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-card-border relative overflow-hidden">
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 rounded-full"
                    style={{ backgroundColor: course.color || 'currentColor' }}
                  />
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <StatusBadge status={course.status} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sidebar-accent text-sidebar-fg">
                      {course.department || course.tags?.[0] || 'General'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors relative z-10 line-clamp-1">
                    {course.name}
                  </h3>
                  <p className="text-sm text-sidebar-fg relative z-10 font-medium">
                    {course.code} • {course.instructor}
                  </p>
                </div>
                
                <div className="p-5 space-y-4">
                  {course.description && (
                    <p className="text-xs text-sidebar-fg line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs font-medium">
                    <div className="flex items-center gap-2 text-sidebar-fg">
                      <Award className="w-4 h-4 text-primary/70 shrink-0" />
                      <span>{course.credits} Credits</span>
                    </div>
                    <div className="flex items-center gap-2 text-sidebar-fg">
                      <Users className="w-4 h-4 text-primary/70 shrink-0" />
                      <span>{course.available_seats !== undefined ? `${course.available_seats} / ${course.max_seats} seats` : `${course.students} students`}</span>
                    </div>
                    {course.schedule ? (
                      <div className="flex items-start gap-2 text-sidebar-fg col-span-2">
                        <Calendar className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                        <div className="truncate">
                          <div>{course.schedule}</div>
                          {course.room && <div className="text-[11px] text-sidebar-fg/80">{course.room}</div>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sidebar-fg/50 col-span-2 italic">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>Schedule TBA</span>
                      </div>
                    )}
                  </div>

                  {course.prerequisites?.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase text-sidebar-fg tracking-wider block mb-1">Prerequisites</span>
                      <div className="flex flex-wrap gap-1">
                        {course.prerequisites.map((p) => (
                          <span key={p.prerequisite_id} className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                            {p.prerequisite_course?.course_code || p.prerequisite_course?.course_name || 'Prereq'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-sidebar-accent/30 border-t border-card-border flex gap-3">
                <button 
                  onClick={() => setSyllabusCourse(course)}
                  className="flex-1 py-2 bg-background border border-card-border hover:bg-sidebar-accent hover:text-foreground rounded-lg text-xs font-bold uppercase tracking-wider text-sidebar-fg transition-all active:scale-95"
                >
                  Syllabus
                </button>
                {course.status === 'Available' ? (
                  <button 
                    disabled={course.available_seats === 0}
                    onClick={async () => {
                      try {
                        await enrollCourse(course.id);
                        toast({ title: 'Success', description: `Enrolled in ${course.name}!`, type: 'success' });
                      } catch (err) {
                        toast({ title: 'Enrollment Failed', description: err.message || 'Failed to enroll in course', type: 'error' });
                      }
                    }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm",
                      course.available_seats === 0
                        ? "bg-sidebar-accent text-sidebar-fg cursor-not-allowed opacity-60"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {course.available_seats === 0 ? 'Full' : 'Enroll'}
                  </button>
                ) : (
                  <button 
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to drop ${course.name}?`)) return;
                      try {
                        await dropCourse(course.id);
                        toast({ title: 'Course Dropped', description: `Dropped ${course.name}`, type: 'info' });
                      } catch (err) {
                        toast({ title: 'Drop Failed', description: err.message || 'Failed to drop course', type: 'error' });
                      }
                    }}
                    className="flex-1 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                  >
                    Drop Course
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
              : selectedDepartment !== 'All'
              ? `No courses found in department "${selectedDepartment}".`
              : "No courses match the selected filters."}
          </p>
        </div>
      )}

      {/* Course Details / Syllabus Modal */}
      {syllabusCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-card-border mb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {syllabusCourse.code || 'COURSE'}
                </span>
                <h3 className="text-xl font-bold text-foreground mt-0.5">
                  {syllabusCourse.name}
                </h3>
              </div>
              <button
                onClick={() => setSyllabusCourse(null)}
                className="p-1 rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Key metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-sidebar-accent/30 border border-card-border rounded-xl text-xs">
                <div>
                  <span className="text-sidebar-fg block">Instructor</span>
                  <span className="font-semibold text-foreground">{syllabusCourse.instructor || 'TBA'}</span>
                </div>
                <div>
                  <span className="text-sidebar-fg block">Department</span>
                  <span className="font-semibold text-foreground">{syllabusCourse.department || syllabusCourse.tags?.[0] || 'General'}</span>
                </div>
                <div>
                  <span className="text-sidebar-fg block">Credits</span>
                  <span className="font-semibold text-foreground">{syllabusCourse.credits} Credits</span>
                </div>
                <div>
                  <span className="text-sidebar-fg block">Available Seats</span>
                  <span className="font-semibold text-foreground">
                    {syllabusCourse.available_seats !== undefined ? `${syllabusCourse.available_seats} of ${syllabusCourse.max_seats}` : 'Available'}
                  </span>
                </div>
                <div>
                  <span className="text-sidebar-fg block">Schedule</span>
                  <span className="font-semibold text-foreground">{syllabusCourse.schedule || 'TBA'}</span>
                </div>
                <div>
                  <span className="text-sidebar-fg block">Location</span>
                  <span className="font-semibold text-foreground">{syllabusCourse.room || 'Room TBA'}</span>
                </div>
              </div>

              {/* Course Description & Outline */}
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Course Description & Syllabus
                </h4>
                <div className="text-sm text-sidebar-fg bg-background/50 border border-card-border p-4 rounded-xl leading-relaxed whitespace-pre-line">
                  {syllabusCourse.description || "Comprehensive syllabus topics, lecture schedule, practical labs, and evaluation guidelines will be provided by the course instructor."}
                </div>
              </div>

              {/* Prerequisites section */}
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Prerequisite Requirements
                </h4>
                {syllabusCourse.prerequisites?.length > 0 ? (
                  <div className="space-y-2">
                    {syllabusCourse.prerequisites.map((p) => (
                      <div key={p.prerequisite_id} className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          {p.prerequisite_course?.course_code} — {p.prerequisite_course?.course_name}
                        </span>
                        <span className="text-primary font-medium">Must be completed prior</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-sidebar-fg italic bg-background/50 border border-card-border p-3 rounded-lg">
                    None. No prerequisites are required to register for this course.
                  </p>
                )}
              </div>

              {/* Actions footer */}
              <div className="pt-4 border-t border-card-border flex justify-end gap-3">
                <button
                  onClick={() => setSyllabusCourse(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-sidebar-fg hover:bg-sidebar-accent transition-colors"
                >
                  Close
                </button>
                {syllabusCourse.status === 'Available' ? (
                  <button
                    disabled={syllabusCourse.available_seats === 0}
                    onClick={async () => {
                      try {
                        await enrollCourse(syllabusCourse.id);
                        toast({ title: 'Success', description: `Enrolled in ${syllabusCourse.name}!`, type: 'success' });
                        setSyllabusCourse(null);
                      } catch (err) {
                        toast({ title: 'Enrollment Failed', description: err.message || 'Failed to enroll', type: 'error' });
                      }
                    }}
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {syllabusCourse.available_seats === 0 ? 'Course Full' : 'Enroll Now'}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to drop ${syllabusCourse.name}?`)) return;
                      try {
                        await dropCourse(syllabusCourse.id);
                        toast({ title: 'Course Dropped', description: `Dropped ${syllabusCourse.name}`, type: 'info' });
                        setSyllabusCourse(null);
                      } catch (err) {
                        toast({ title: 'Drop Failed', description: err.message || 'Failed to drop course', type: 'error' });
                      }
                    }}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Drop Course
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
