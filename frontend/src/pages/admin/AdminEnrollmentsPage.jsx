import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  GraduationCap, AlertCircle, FileText, Calendar, Trash2, X, UserPlus, 
  Filter, CheckCircle2, RotateCcw, Ban, ArrowUpDown, ChevronDown, 
  Layers, Users, BookOpen, AlertTriangle, RefreshCw
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import { apiFetch, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function AdminEnrollmentsPage() {
  const { token, user } = useApp();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  // Modals & Actions
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ student_id: '', course_id: '' });
  const [enrolling, setEnrolling] = useState(false);

  const [statusModal, setStatusModal] = useState(null); // { enrollment, newStatus }
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null); // enrollment
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [enrolData, studData, courseData] = await Promise.all([
        apiFetch('/admin/enrollments', { role: 'ADMIN' }),
        apiFetch('/admin/students', { role: 'ADMIN' }),
        apiFetch('/courses'),
      ]);
      setEnrollments(enrolData.data || []);
      setStudents(studData.data || []);
      setCourses(courseData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch enrollment records');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!enrollForm.student_id || !enrollForm.course_id) {
      toast({ title: 'Validation Error', description: 'Please select both a student and a course.', type: 'error' });
      return;
    }

    const selectedCourse = courses.find(c => c.course_id === enrollForm.course_id);
    if (selectedCourse && selectedCourse.available_seats <= 0) {
      toast({ title: 'Course Full', description: 'This course has no available seats remaining.', type: 'error' });
      return;
    }

    try {
      setEnrolling(true);
      const res = await apiFetch('/admin/enrollments', {
        method: 'POST',
        role: 'ADMIN',
        body: enrollForm,
      });
      toast({ 
        title: 'Enrollment Confirmed', 
        description: res.message || 'Student enrolled successfully and seat allocated.', 
        type: 'success' 
      });
      setShowEnrollModal(false);
      setEnrollForm({ student_id: '', course_id: '' });
      fetchData();
    } catch (err) {
      toast({ title: 'Enrollment Failed', description: err.message, type: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    const { enrollment, newStatus } = statusModal;

    try {
      setUpdatingStatus(true);
      const res = await apiFetch(`/admin/enrollments/${enrollment.enrollment_id}`, {
        method: 'PUT',
        role: 'ADMIN',
        body: { status: newStatus }
      });
      toast({
        title: 'Status Updated',
        description: res.message || `Enrollment status successfully changed to ${newStatus}.`,
        type: 'success'
      });
      setStatusModal(null);
      fetchData();
    } catch (err) {
      toast({ title: 'Status Update Failed', description: err.message, type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteEnrollment = async () => {
    if (!deleteConfirmModal) return;
    try {
      setDeleting(true);
      const res = await apiFetch(`/admin/enrollments/${deleteConfirmModal.enrollment_id}`, {
        method: 'DELETE',
        role: 'ADMIN',
      });
      toast({
        title: 'Enrollment Removed',
        description: res.message || 'Enrollment deleted and seat capacity adjusted.',
        type: 'success'
      });
      setDeleteConfirmModal(null);
      fetchData();
    } catch (err) {
      toast({ title: 'Action Failed', description: err.message, type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // Derive unique semesters from courses
  const semesters = useMemo(() => {
    const list = [...new Set(courses.map(c => c.semester_label).filter(Boolean))];
    return list.sort();
  }, [courses]);

  // Filter enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      // Status filter
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;

      // Course filter
      if (courseFilter !== 'ALL' && e.course?.course_id !== courseFilter) return false;

      // Semester filter
      if (semesterFilter !== 'ALL' && e.course?.semester_label !== semesterFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesStudent = 
          e.student?.name?.toLowerCase().includes(q) ||
          e.student?.email?.toLowerCase().includes(q) ||
          e.student?.department?.department_name?.toLowerCase().includes(q);
        const matchesCourse = 
          e.course?.course_name?.toLowerCase().includes(q) ||
          e.course?.course_code?.toLowerCase().includes(q) ||
          e.course?.semester_label?.toLowerCase().includes(q);
        if (!matchesStudent && !matchesCourse) return false;
      }

      return true;
    });
  }, [enrollments, statusFilter, courseFilter, semesterFilter, searchQuery]);

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold text-center">Access Denied. Admins only.</div>;
  }

  const activeCount = enrollments.filter(e => e.status === 'ACTIVE').length;
  const completedCount = enrollments.filter(e => e.status === 'COMPLETED').length;
  const droppedCount = enrollments.filter(e => e.status === 'DROPPED').length;

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCourseFilter('ALL');
    setSemesterFilter('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || courseFilter !== 'ALL' || semesterFilter !== 'ALL';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          icon={GraduationCap}
          title="Enrollment Management"
          description="View, filter, enroll, update status, and audit all student-course registrations."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-card-border bg-card hover:bg-sidebar-accent text-sidebar-fg transition-all disabled:opacity-50"
            title="Refresh Records"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Student
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: enrollments.length, color: 'text-foreground', bg: 'bg-card' },
          { label: 'Active Students', value: activeCount, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Completed Courses', value: completedCount, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Dropped Courses', value: droppedCount, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map((s, i) => (
          <div key={i} className={cn("border border-card-border rounded-xl p-4 transition-all shadow-sm", s.bg)}>
            <p className="text-xs font-semibold text-sidebar-fg uppercase tracking-wider">{s.label}</p>
            <p className={cn("text-3xl font-extrabold mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, email, course code or title..."
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filter Dropdown */}
            <div className="relative min-w-[170px]">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full appearance-none bg-background border border-card-border rounded-lg px-3 py-2 text-xs font-medium text-foreground pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Courses ({courses.length})</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_code} - {c.course_name.length > 20 ? c.course_name.substring(0, 20) + '...' : c.course_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sidebar-fg absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Semester Filter Dropdown */}
            <div className="relative min-w-[140px]">
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full appearance-none bg-background border border-card-border rounded-lg px-3 py-2 text-xs font-medium text-foreground pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Semesters</option>
                {semesters.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sidebar-fg absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-sidebar-fg hover:text-foreground px-2.5 py-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-card-border/60 overflow-x-auto">
          <span className="text-xs text-sidebar-fg font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {[
            { id: 'ALL', label: 'All', count: enrollments.length },
            { id: 'ACTIVE', label: 'Active', count: activeCount },
            { id: 'COMPLETED', label: 'Completed', count: completedCount },
            { id: 'DROPPED', label: 'Dropped', count: droppedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5",
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-sidebar-accent/40 text-sidebar-fg hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                statusFilter === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-card-border text-sidebar-fg"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-card-border flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Registered Enrollments</h3>
            <span className="text-xs bg-sidebar-accent text-sidebar-fg px-2 py-0.5 rounded font-mono">
              {filteredEnrollments.length} matching
            </span>
          </div>
          {hasActiveFilters && (
            <span className="text-xs text-sidebar-fg italic">
              Filtered from {enrollments.length} total records
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sidebar-accent/40 text-sidebar-fg text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Student Info</th>
                <th className="p-4 font-semibold">Course Details</th>
                <th className="p-4 font-semibold">Seats Status</th>
                <th className="p-4 font-semibold">Registered</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Grade</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-sidebar-fg">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary opacity-60" />
                    <p className="font-medium">Loading database enrollments...</p>
                  </td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-sidebar-fg">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="font-semibold text-foreground">No enrollments match your criteria</p>
                    <p className="text-xs mt-1">Try adjusting your search query or reset status/course filters.</p>
                  </td>
                </tr>
              ) : filteredEnrollments.map((enrol) => {
                const course = enrol.course;
                const isFull = course && course.available_seats <= 0;

                return (
                  <tr key={enrol.enrollment_id} className="hover:bg-sidebar-accent/20 transition-colors">
                    {/* Student Info */}
                    <td className="p-4">
                      <div className="font-bold text-foreground">{enrol.student?.name}</div>
                      <div className="text-xs text-sidebar-fg">{enrol.student?.email}</div>
                      <div className="text-[11px] text-sidebar-fg/80 flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 opacity-70" /> 
                        {enrol.student?.department?.department_name || 'Department N/A'}
                        {enrol.student?.semester && ` • Sem ${enrol.student.semester}`}
                      </div>
                    </td>

                    {/* Course Details */}
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{course?.course_name}</div>
                      <div className="text-xs text-sidebar-fg flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono bg-sidebar-accent/80 px-1.5 py-0.5 rounded text-[11px] font-bold text-primary">
                          {course?.course_code}
                        </span>
                        <span>• {course?.credits} Credits</span>
                        <span>• {course?.semester_label}</span>
                      </div>
                    </td>

                    {/* Course Seats */}
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-semibold font-mono border",
                          isFull 
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}>
                          {course ? `${course.available_seats} / ${course.max_seats} left` : 'N/A'}
                        </span>
                        <div className="w-20 bg-sidebar-accent rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={cn("h-full", isFull ? "bg-rose-500" : "bg-emerald-500")}
                            style={{ 
                              width: course && course.max_seats > 0 
                                ? `${Math.min(100, Math.round(((course.max_seats - course.available_seats) / course.max_seats) * 100))}%` 
                                : '0%' 
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Enrollment Date */}
                    <td className="p-4 text-sidebar-fg">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-sidebar-fg/60" />
                        {new Date(enrol.enrollment_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit",
                          enrol.status === 'ACTIVE' ? "bg-primary/10 text-primary border-primary/20" :
                          enrol.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {enrol.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                          {enrol.status === 'DROPPED' && <Ban className="w-3 h-3" />}
                          {enrol.status === 'COMPLETED' && <GraduationCap className="w-3 h-3" />}
                          {enrol.status || 'ACTIVE'}
                        </span>

                        {/* Quick Status Select Button */}
                        <div className="relative group">
                          <select
                            value={enrol.status}
                            onChange={(e) => setStatusModal({ enrollment: enrol, newStatus: e.target.value })}
                            className="text-xs bg-sidebar-accent/60 hover:bg-sidebar-accent border border-card-border rounded px-2 py-1 text-sidebar-fg hover:text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                            title="Change status"
                          >
                            <option value="ACTIVE">Set Active</option>
                            <option value="DROPPED">Set Dropped</option>
                            <option value="COMPLETED">Set Completed</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="p-4">
                      {enrol.grade ? (
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-foreground px-2 py-0.5 rounded bg-sidebar-accent text-sm">
                            {enrol.grade.grade_letter}
                          </span>
                          <span className="text-xs text-sidebar-fg">
                            {enrol.grade.marks_obtained} pts
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-sidebar-fg/70 px-2 py-0.5 bg-sidebar-accent/40 rounded border border-card-border/50">
                          Not Graded
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDeleteConfirmModal(enrol)}
                          className="p-2 text-sidebar-fg hover:text-rose-500 transition-colors bg-background hover:bg-rose-500/10 rounded-lg border border-card-border"
                          title="Delete enrollment record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-card-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Enroll Student</h2>
                  <p className="text-xs text-sidebar-fg">Add a student to an active course curriculum</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEnrollModal(false)} 
                className="p-1.5 hover:bg-sidebar-accent rounded-lg text-sidebar-fg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnroll} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sidebar-fg mb-1.5">
                  Select Student <span className="text-rose-500">*</span>
                </label>
                <select
                  value={enrollForm.student_id}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, student_id: e.target.value }))}
                  className="w-full bg-background border border-card-border rounded-xl p-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">-- Choose student --</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.name} ({s.email}) - {s.department || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sidebar-fg mb-1.5">
                  Select Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={enrollForm.course_id}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, course_id: e.target.value }))}
                  className="w-full bg-background border border-card-border rounded-xl p-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">-- Choose course --</option>
                  {courses.map(c => (
                    <option 
                      key={c.course_id} 
                      value={c.course_id}
                      disabled={c.available_seats <= 0}
                    >
                      {c.course_code} - {c.course_name} ({c.available_seats}/{c.max_seats} seats remaining) {c.available_seats <= 0 ? '— [FULL]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Info Preview */}
              {enrollForm.course_id && (() => {
                const selected = courses.find(c => c.course_id === enrollForm.course_id);
                if (!selected) return null;
                const isFull = selected.available_seats <= 0;

                return (
                  <div className={cn(
                    "p-3.5 rounded-xl border text-xs space-y-1.5",
                    isFull ? "bg-rose-500/10 border-rose-500/20 text-rose-600" : "bg-sidebar-accent/40 border-card-border text-foreground"
                  )}>
                    <div className="flex justify-between font-bold">
                      <span>{selected.course_name}</span>
                      <span>{selected.credits} Credits</span>
                    </div>
                    <div className="flex justify-between text-sidebar-fg">
                      <span>Semester: {selected.semester_label}</span>
                      <span className={cn("font-bold", isFull ? "text-rose-600" : "text-emerald-600")}>
                        {selected.available_seats} of {selected.max_seats} seats open
                      </span>
                    </div>
                    {isFull && (
                      <p className="text-rose-600 font-semibold pt-1 border-t border-rose-500/20">
                        Warning: This course has zero remaining seats. You cannot enroll more students unless capacity is increased.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-card-border bg-background hover:bg-sidebar-accent text-sidebar-fg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrolling || (enrollForm.course_id && courses.find(c => c.course_id === enrollForm.course_id)?.available_seats <= 0)}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {enrolling && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {enrolling ? 'Enrolling Student...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Confirm Status Change</h3>
                <p className="text-xs text-sidebar-fg">Modify student enrollment status and seat allocation</p>
              </div>
            </div>

            <div className="p-4 bg-sidebar-accent/30 rounded-xl border border-card-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-sidebar-fg">Student:</span>
                <span className="font-bold text-foreground">{statusModal.enrollment.student?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sidebar-fg">Course:</span>
                <span className="font-bold text-foreground">{statusModal.enrollment.course?.course_name}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-card-border">
                <span className="text-sidebar-fg">Transition:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-sidebar-accent text-sidebar-fg">{statusModal.enrollment.status}</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold">{statusModal.newStatus}</span>
                </div>
              </div>
            </div>

            {statusModal.newStatus === 'DROPPED' && statusModal.enrollment.status === 'ACTIVE' && (
              <p className="text-xs text-amber-600 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                Notice: Dropping this enrollment will free up 1 seat in <strong>{statusModal.enrollment.course?.course_code}</strong>.
              </p>
            )}

            {statusModal.newStatus === 'ACTIVE' && statusModal.enrollment.status === 'DROPPED' && (
              <p className="text-xs text-blue-600 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                Notice: Reactivating will claim 1 available seat in <strong>{statusModal.enrollment.course?.course_code}</strong>.
              </p>
            )}

            {statusModal.newStatus === 'COMPLETED' && !statusModal.enrollment.grade && (
              <p className="text-xs text-rose-600 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                Caution: Course cannot be marked COMPLETED without a recorded grade. Please submit marks under Grades first.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal(null)}
                className="px-4 py-2 rounded-lg border border-card-border text-sidebar-fg text-sm hover:bg-sidebar-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {updatingStatus && <RefreshCw className="w-4 h-4 animate-spin" />}
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Remove Enrollment Record</h3>
                <p className="text-xs text-sidebar-fg">This action will delete the student's registration</p>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-card-border text-xs space-y-1.5">
              <p><span className="text-sidebar-fg">Student:</span> <strong className="text-foreground">{deleteConfirmModal.student?.name}</strong></p>
              <p><span className="text-sidebar-fg">Course:</span> <strong className="text-foreground">{deleteConfirmModal.course?.course_name} ({deleteConfirmModal.course?.course_code})</strong></p>
              <p><span className="text-sidebar-fg">Current Status:</span> <strong className="text-foreground">{deleteConfirmModal.status}</strong></p>
            </div>

            <p className="text-xs text-sidebar-fg">
              {deleteConfirmModal.status === 'ACTIVE' 
                ? 'Removing this active enrollment will permanently restore 1 seat back to the course seat pool.' 
                : 'This enrollment record will be permanently deleted from the database.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 rounded-lg border border-card-border text-sidebar-fg text-sm hover:bg-sidebar-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEnrollment}
                disabled={deleting}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                Remove Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
