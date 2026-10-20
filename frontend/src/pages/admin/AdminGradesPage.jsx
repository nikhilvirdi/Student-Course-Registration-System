import { useState, useEffect, useMemo } from 'react';
import { 
  Award, User, CheckCircle, Search, Edit2, Trash2, X, Plus, 
  RefreshCw, AlertCircle, Filter, Clock, BookOpen, GraduationCap, 
  TrendingUp, Percent, Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn, apiFetch, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';

// 10-Point Grading Scale Helper for Frontend Live Preview
export function getGradeDetails(rawMarks) {
  const marks = parseFloat(rawMarks);
  if (isNaN(marks) || marks < 0 || marks > 100) {
    return { letter: '—', points: 0, remarks: 'Enter valid marks (0–100)', color: 'text-sidebar-fg', bg: 'bg-sidebar-accent' };
  }
  if (marks >= 90) return { letter: 'O', points: 10.0, remarks: 'Outstanding Performance', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  if (marks >= 80) return { letter: 'A+', points: 9.0, remarks: 'Excellent Performance', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  if (marks >= 70) return { letter: 'A', points: 8.0, remarks: 'Very Good Performance', color: 'text-green-500', bg: 'bg-green-500/10' };
  if (marks >= 60) return { letter: 'B+', points: 7.0, remarks: 'Good Performance', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  if (marks >= 50) return { letter: 'B', points: 6.0, remarks: 'Above Average', color: 'text-cyan-500', bg: 'bg-cyan-500/10' };
  if (marks >= 40) return { letter: 'C', points: 5.0, remarks: 'Pass / Marginal', color: 'text-amber-600', bg: 'bg-amber-600/10' };
  return { letter: 'F', points: 0.0, remarks: 'Fail / Needs Improvement', color: 'text-rose-500', bg: 'bg-rose-500/10' };
}

export default function AdminGradesPage() {
  const { user } = useApp();
  const { toast } = useToast();
  
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, GRADED, PENDING, DROPPED
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  // Assign Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modalMarks, setModalMarks] = useState('');

  // Delete/Reset confirmation state
  const [resetGradeItem, setResetGradeItem] = useState(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiFetch('/admin/enrollments');
      if (res.success) {
        setEnrollments(res.data || []);
      }
    } catch (error) {
      toast({ 
        title: 'Error Loading Grades', 
        description: error.message || 'Failed to fetch enrollment records.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Distinct courses for dropdown filter
  const uniqueCourses = useMemo(() => {
    const map = new Map();
    enrollments.forEach(e => {
      if (e.course?.course_id && !map.has(e.course.course_id)) {
        map.set(e.course.course_id, {
          id: e.course.course_id,
          name: e.course.course_name,
          code: e.course.course_code
        });
      }
    });
    return Array.from(map.values());
  }, [enrollments]);

  // Distinct students for the Assign Modal
  const uniqueStudents = useMemo(() => {
    const map = new Map();
    enrollments.forEach(e => {
      if (e.student?.student_id && !map.has(e.student.student_id)) {
        map.set(e.student.student_id, {
          id: e.student.student_id,
          name: e.student.name,
          email: e.student.email,
          semester: e.student.semester,
        });
      }
    });
    return Array.from(map.values());
  }, [enrollments]);

  // Enrollments available for selected student in modal
  const studentEnrollments = useMemo(() => {
    if (!selectedStudentId) return [];
    return enrollments.filter(e => e.student_id === selectedStudentId && e.status !== 'DROPPED');
  }, [enrollments, selectedStudentId]);

  // Selected course details in modal for GPA preview
  const selectedCourseDetails = useMemo(() => {
    if (!selectedCourseId) return null;
    const match = enrollments.find(e => e.student_id === selectedStudentId && e.course_id === selectedCourseId);
    return match?.course || null;
  }, [enrollments, selectedStudentId, selectedCourseId]);

  // Calculations for Stats Bar
  const stats = useMemo(() => {
    const total = enrollments.length;
    const gradedList = enrollments.filter(e => e.status === 'COMPLETED' && e.grade);
    const pendingList = enrollments.filter(e => e.status === 'ACTIVE');
    
    let totalMarks = 0;
    let passingCount = 0;

    gradedList.forEach(e => {
      const marks = e.grade.marks_obtained;
      totalMarks += marks;
      if (marks >= 40) passingCount++;
    });

    const avgMarks = gradedList.length > 0 ? (totalMarks / gradedList.length).toFixed(1) : '—';
    const passRate = gradedList.length > 0 ? ((passingCount / gradedList.length) * 100).toFixed(0) : '—';

    return {
      total,
      gradedCount: gradedList.length,
      pendingCount: pendingList.length,
      avgMarks,
      passRate: passRate !== '—' ? `${passRate}%` : '—',
    };
  }, [enrollments]);

  // Filtered list
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStudent = e.student?.name?.toLowerCase().includes(q) ||
          e.student?.email?.toLowerCase().includes(q) ||
          e.student?.student_id?.toLowerCase().includes(q);
        const matchesCourse = e.course?.course_name?.toLowerCase().includes(q) ||
          e.course?.course_code?.toLowerCase().includes(q);
        if (!matchesStudent && !matchesCourse) return false;
      }

      // 2. Status Filter
      if (statusFilter === 'GRADED' && e.status !== 'COMPLETED') return false;
      if (statusFilter === 'PENDING' && e.status !== 'ACTIVE') return false;
      if (statusFilter === 'DROPPED' && e.status !== 'DROPPED') return false;

      // 3. Course Filter
      if (courseFilter !== 'ALL' && e.course_id !== courseFilter) return false;

      // 4. Semester Filter
      if (semesterFilter !== 'ALL') {
        const sem = String(e.student?.semester || '');
        if (sem !== semesterFilter) return false;
      }

      // 5. Grade Filter
      if (gradeFilter !== 'ALL') {
        if (!e.grade || e.grade.grade_letter !== gradeFilter) return false;
      }

      return true;
    });
  }, [enrollments, searchQuery, statusFilter, courseFilter, semesterFilter, gradeFilter]);

  // Handle Assign Grade
  const handleAssignGrade = async (enrollmentId, marks) => {
    const num = parseFloat(marks);
    if (isNaN(num) || num < 0 || num > 100) {
      toast({ 
        title: 'Validation Error', 
        description: 'Marks must be a valid number between 0 and 100.', 
        type: 'error' 
      });
      return;
    }
    
    try {
      setSubmitting(enrollmentId);
      const res = await apiFetch('/grades', {
        method: 'POST',
        body: { 
          enrollment_id: enrollmentId, 
          marks_obtained: num 
        }
      });

      if (res.success) {
        toast({ 
          title: 'Grade Recorded', 
          description: `Assigned ${num} marks (${res.data.grade_letter}) successfully.`, 
          type: 'success' 
        });
        // Update local state atomically
        setEnrollments(prev => prev.map(e => 
          e.enrollment_id === enrollmentId 
            ? { ...e, status: 'COMPLETED', grade: res.data }
            : e
        ));
      }
    } catch (error) {
      toast({ title: 'Grade Assignment Failed', description: error.message, type: 'error' });
    } finally {
      setSubmitting(null);
    }
  };

  // Handle Update Grade
  const handleUpdateGrade = async (gradeId, marks) => {
    const num = parseFloat(marks);
    if (isNaN(num) || num < 0 || num > 100) {
      toast({ 
        title: 'Validation Error', 
        description: 'Marks must be a valid number between 0 and 100.', 
        type: 'error' 
      });
      return;
    }

    try {
      setSubmitting(gradeId);
      const res = await apiFetch(`/grades/${gradeId}`, {
        method: 'PUT',
        body: { marks_obtained: num }
      });

      if (res.success) {
        toast({ 
          title: 'Grade Updated', 
          description: `Updated to ${num} marks (${res.data.grade_letter}).`, 
          type: 'success' 
        });
        setEnrollments(prev => prev.map(e => 
          e.grade?.grade_id === gradeId 
            ? { ...e, grade: res.data, status: 'COMPLETED' }
            : e
        ));
      }
    } catch (error) {
      toast({ title: 'Update Failed', description: error.message, type: 'error' });
    } finally {
      setSubmitting(null);
    }
  };

  // Handle Reset / Delete Grade
  const handleConfirmResetGrade = async () => {
    if (!resetGradeItem?.grade?.grade_id) return;
    const gradeId = resetGradeItem.grade.grade_id;

    try {
      setSubmitting(gradeId);
      const res = await apiFetch(`/grades/${gradeId}`, {
        method: 'DELETE'
      });

      if (res.success) {
        toast({ 
          title: 'Grade Reset', 
          description: 'The grade has been cleared and the enrollment reverted to Pending.', 
          type: 'success' 
        });
        setEnrollments(prev => prev.map(e => 
          e.enrollment_id === resetGradeItem.enrollment_id 
            ? { ...e, grade: null, status: 'ACTIVE' }
            : e
        ));
        setResetGradeItem(null);
      }
    } catch (error) {
      toast({ title: 'Reset Failed', description: error.message, type: 'error' });
    } finally {
      setSubmitting(null);
    }
  };

  // Handle Modal Submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) {
      toast({ title: 'Missing Selection', description: 'Please choose both a student and a course.', type: 'error' });
      return;
    }

    const num = parseFloat(modalMarks);
    if (isNaN(num) || num < 0 || num > 100) {
      toast({ title: 'Invalid Marks', description: 'Marks must be between 0 and 100.', type: 'error' });
      return;
    }

    const targetEnrollment = enrollments.find(e => e.student_id === selectedStudentId && e.course_id === selectedCourseId);
    if (!targetEnrollment) {
      toast({ title: 'Enrollment Not Found', description: 'Student is not enrolled in the selected course.', type: 'error' });
      return;
    }

    try {
      setSubmitting('modal');
      const res = await apiFetch('/grades', {
        method: 'POST',
        body: {
          enrollment_id: targetEnrollment.enrollment_id,
          marks_obtained: num
        }
      });

      if (res.success) {
        toast({
          title: 'Grade Saved',
          description: `Assigned ${num} marks (${res.data.grade_letter}) to ${targetEnrollment.student?.name}.`,
          type: 'success'
        });
        setEnrollments(prev => prev.map(e => 
          e.enrollment_id === targetEnrollment.enrollment_id 
            ? { ...e, status: 'COMPLETED', grade: res.data }
            : e
        ));
        setIsModalOpen(false);
        setSelectedStudentId('');
        setSelectedCourseId('');
        setModalMarks('');
      }
    } catch (error) {
      toast({ title: 'Failed to Save Grade', description: error.message, type: 'error' });
    } finally {
      setSubmitting(null);
    }
  };

  const handleOpenAssignModal = () => {
    if (uniqueStudents.length > 0) {
      const firstStud = uniqueStudents[0];
      setSelectedStudentId(firstStud.id);
      const studEnrols = enrollments.filter(e => e.student_id === firstStud.id && e.status !== 'DROPPED');
      setSelectedCourseId(studEnrols[0]?.course_id || '');
    } else {
      setSelectedStudentId('');
      setSelectedCourseId('');
    }
    setModalMarks('');
    setIsModalOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCourseFilter('ALL');
    setGradeFilter('ALL');
    setSemesterFilter('ALL');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'ALL' || courseFilter !== 'ALL' || gradeFilter !== 'ALL' || semesterFilter !== 'ALL';

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold bg-card border border-card-border rounded-xl">
        Access Denied. You must be signed in with Admin privileges to manage grades.
      </div>
    );
  }

  const modalGradePreview = getGradeDetails(modalMarks);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          icon={Award}
          title="Academic Grades & Performance"
          description="Record student marks, compute letter grades & GPA points, and manage course completion records across all departments."
        />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => fetchEnrollments(true)}
            disabled={loading || refreshing}
            className="p-2.5 rounded-xl border border-card-border bg-card hover:bg-sidebar-accent text-sidebar-fg hover:text-foreground transition-all disabled:opacity-50 shadow-sm"
            title="Refresh database records"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin text-primary")} />
          </button>
          <button
            onClick={handleOpenAssignModal}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Assign Grade
          </button>
        </div>
      </div>

      {/* Analytics & Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-sidebar-fg">Total Enrollments</div>
            <div className="text-2xl font-bold text-foreground mt-0.5">{stats.total}</div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-lg text-green-500 flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-sidebar-fg">Graded Courses</div>
            <div className="text-2xl font-bold text-foreground mt-0.5">{stats.gradedCount}</div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-500 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-sidebar-fg">Pending Grading</div>
            <div className="text-2xl font-bold text-foreground mt-0.5">{stats.pendingCount}</div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-500 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-sidebar-fg">Average Marks</div>
            <div className="text-2xl font-bold text-foreground mt-0.5">{stats.avgMarks}</div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-card border border-card-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500 flex-shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-sidebar-fg">Pass Rate (≥40)</div>
            <div className="text-2xl font-bold text-foreground mt-0.5">{stats.passRate}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          <SearchInput 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ID, email, or course..."
            className="w-full lg:w-96"
          />

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Pills */}
            <div className="flex items-center bg-sidebar-accent/50 p-1 rounded-xl border border-card-border text-xs font-medium">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'GRADED', label: 'Graded' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'DROPPED', label: 'Dropped' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all",
                    statusFilter === tab.id 
                      ? "bg-card text-foreground font-semibold shadow-sm" 
                      : "text-sidebar-fg hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Course Dropdown Filter */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-1.5 bg-background border border-card-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Courses ({uniqueCourses.length})</option>
              {uniqueCourses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.code}: ` : ''}{c.name}
                </option>
              ))}
            </select>

            {/* Grade Letter Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-1.5 bg-background border border-card-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Grades</option>
              <option value="O">O (10.0)</option>
              <option value="A+">A+ (9.0)</option>
              <option value="A">A (8.0)</option>
              <option value="B+">B+ (7.0)</option>
              <option value="B">B (6.0)</option>
              <option value="C">C (5.0)</option>
              <option value="F">F (0.0)</option>
            </select>

            {/* Semester Filter */}
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="px-3 py-1.5 bg-background border border-card-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-sidebar-fg pt-1 border-t border-card-border">
          <span>
            Showing <strong className="text-foreground">{filteredEnrollments.length}</strong> of {enrollments.length} records
          </span>
          {hasActiveFilters && (
            <span className="text-amber-500 font-medium">Filters active</span>
          )}
        </div>
      </div>

      {/* Enrollments & Grades Table */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-sidebar-fg">Loading academic enrollment and grading records...</p>
          </div>
        ) : filteredEnrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-sidebar-fg uppercase bg-sidebar-accent/50 border-b border-card-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course & Credits</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Marks & Grade Points</th>
                  <th className="px-6 py-4 font-semibold text-center">Graded Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filteredEnrollments.map((e) => (
                  <GradeTableRow 
                    key={e.enrollment_id} 
                    enrollment={e} 
                    onAssign={handleAssignGrade}
                    onUpdate={handleUpdateGrade}
                    onResetRequest={(item) => setResetGradeItem(item)}
                    isSubmitting={submitting === e.enrollment_id || submitting === e.grade?.grade_id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-sidebar-accent rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-sidebar-fg opacity-40" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No records found</h3>
            <p className="text-sm text-sidebar-fg mt-1 max-w-sm">
              {hasActiveFilters 
                ? "No grades match your current search and filter criteria. Try adjusting your filters." 
                : "No student course enrollments have been recorded in the database yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal: Assign / Record Grade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-card-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-card-border flex items-center justify-between bg-sidebar-accent/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Record Student Grade</h3>
                  <p className="text-xs text-sidebar-fg mt-0.5">Select a student enrollment and enter the obtained score.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-5 overflow-y-auto">
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  1. Select Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedStudentId(newId);
                    const enrols = enrollments.filter(enr => enr.student_id === newId && enr.status !== 'DROPPED');
                    setSelectedCourseId(enrols[0]?.course_id || '');
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                >
                  {uniqueStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email}) {s.semester ? `• Sem ${s.semester}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selector */}
              <div>
                <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  2. Select Enrolled Course
                </label>
                {studentEnrollments.length > 0 ? (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      const enr = studentEnrollments.find(item => item.course_id === e.target.value);
                      if (enr?.grade) {
                        setModalMarks(enr.grade.marks_obtained?.toString() || '');
                      } else {
                        setModalMarks('');
                      }
                    }}
                    required
                    className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                  >
                    {studentEnrollments.map(e => (
                      <option key={e.course_id} value={e.course_id}>
                        {e.course?.course_code ? `${e.course.course_code}: ` : ''}{e.course?.course_name} ({e.course?.credits || 3} Credits) {e.grade ? `[Current: ${e.grade.marks_obtained} (${e.grade.grade_letter})]` : '[Pending]'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-sidebar-accent/50 border border-card-border rounded-xl text-xs text-sidebar-fg italic">
                    This student does not have any active course enrollments.
                  </div>
                )}
              </div>

              {/* Marks Input */}
              <div>
                <label className="block text-xs font-bold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  3. Enter Marks (0 to 100)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={modalMarks}
                    onChange={(e) => setModalMarks(e.target.value)}
                    placeholder="e.g. 85.5"
                    required
                    className="w-full px-3.5 py-2.5 bg-background border border-card-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                  />
                  <div className="absolute right-3.5 top-2.5 text-xs font-medium text-sidebar-fg">
                    / 100
                  </div>
                </div>
              </div>

              {/* Real-Time Live Grade Preview Card */}
              {modalMarks !== '' && (
                <div className="p-4 bg-sidebar-accent/40 border border-card-border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sidebar-fg uppercase tracking-wider">Calculated Grade</span>
                    <span className={cn("px-2.5 py-0.5 rounded-lg text-xs font-black", modalGradePreview.bg, modalGradePreview.color)}>
                      Grade {modalGradePreview.letter}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-card-border/50">
                    <div className="p-2 bg-card rounded-lg border border-card-border">
                      <div className="text-[10px] text-sidebar-fg font-medium">Grade Points</div>
                      <div className="text-base font-bold text-foreground mt-0.5">{modalGradePreview.points.toFixed(1)}</div>
                    </div>
                    <div className="p-2 bg-card rounded-lg border border-card-border">
                      <div className="text-[10px] text-sidebar-fg font-medium">Course Credits</div>
                      <div className="text-base font-bold text-foreground mt-0.5">{selectedCourseDetails?.credits || 3} Cr</div>
                    </div>
                    <div className="p-2 bg-card rounded-lg border border-card-border">
                      <div className="text-[10px] text-sidebar-fg font-medium">Quality Points</div>
                      <div className="text-base font-bold text-primary mt-0.5">
                        {(modalGradePreview.points * (selectedCourseDetails?.credits || 3)).toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-sidebar-fg text-center italic">
                    {modalGradePreview.remarks}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-card-border rounded-xl text-sm font-medium text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting === 'modal' || studentEnrollments.length === 0}
                  className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
                >
                  {submitting === 'modal' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Grade
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Grade */}
      {resetGradeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-card-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 bg-rose-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Reset Student Grade?</h3>
            </div>

            <p className="text-sm text-sidebar-fg">
              Are you sure you want to delete the assigned grade for{' '}
              <strong className="text-foreground">{resetGradeItem.student?.name}</strong> in{' '}
              <strong className="text-foreground">{resetGradeItem.course?.course_name}</strong>?
            </p>
            <p className="text-xs text-sidebar-fg bg-sidebar-accent/50 p-3 rounded-xl border border-card-border">
              The student's enrollment status will revert from <strong className="text-green-500">COMPLETED</strong> back to <strong className="text-amber-500">ACTIVE (Pending)</strong> and their GPA will update automatically.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetGradeItem(null)}
                className="px-4 py-2 border border-card-border rounded-xl text-sm font-medium text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetGrade}
                disabled={submitting === resetGradeItem.grade?.grade_id}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                {submitting === resetGradeItem.grade?.grade_id ? 'Resetting...' : 'Yes, Reset Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Table Row Component
function GradeTableRow({ enrollment, onAssign, onUpdate, onResetRequest, isSubmitting }) {
  const [inlineMarks, setInlineMarks] = useState('');
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editMarks, setEditMarks] = useState('');

  const grade = enrollment.grade;
  const isCompleted = enrollment.status === 'COMPLETED' || Boolean(grade);
  const isDropped = enrollment.status === 'DROPPED';

  const startEdit = () => {
    setEditMarks(grade?.marks_obtained?.toString() || '');
    setIsInlineEditing(true);
  };

  const cancelEdit = () => {
    setIsInlineEditing(false);
    setEditMarks('');
  };

  const handleSaveInline = () => {
    if (grade) {
      onUpdate(grade.grade_id, editMarks);
    } else {
      onAssign(enrollment.enrollment_id, editMarks);
    }
    cancelEdit();
  };

  // Grade color badges
  const getBadgeStyle = (letter) => {
    switch (letter) {
      case 'O': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'A+': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'A': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'B+': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'B': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'C': return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
      default: return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
  };

  return (
    <tr className="border-b border-card-border hover:bg-sidebar-accent/20 transition-colors">
      {/* Student Details */}
      <td className="px-6 py-4">
        <div className="font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{enrollment.student?.name || 'Unknown Student'}</span>
        </div>
        <div className="text-xs text-sidebar-fg mt-0.5">{enrollment.student?.email}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-sidebar-accent rounded text-sidebar-fg border border-card-border">
            ID: {enrollment.student?.student_id?.slice(0, 8)}...
          </span>
          {enrollment.student?.semester && (
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded">
              Sem {enrollment.student.semester}
            </span>
          )}
          {enrollment.student?.department?.department_name && (
            <span className="text-[10px] text-sidebar-fg truncate max-w-[150px]">
              {enrollment.student.department.department_name}
            </span>
          )}
        </div>
      </td>

      {/* Course Details */}
      <td className="px-6 py-4">
        <div className="font-semibold text-foreground">
          {enrollment.course?.course_name || 'Course Name'}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {enrollment.course?.course_code && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-sidebar-accent rounded-md text-foreground border border-card-border">
              {enrollment.course.course_code}
            </span>
          )}
          <span className="text-xs text-sidebar-fg">
            {enrollment.course?.credits || 3} Credits
          </span>
          {enrollment.course?.semester_label && (
            <span className="text-xs text-sidebar-fg font-medium">
              • {enrollment.course.semester_label}
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 text-center">
        {isDropped ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-sidebar-fg border border-card-border">
            Dropped
          </span>
        ) : isCompleted ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Graded
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        )}
      </td>

      {/* Marks / Grade Column */}
      <td className="px-6 py-4 text-center">
        {isInlineEditing ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={editMarks}
              onChange={(e) => setEditMarks(e.target.value)}
              placeholder="0–100"
              className="w-20 px-2 py-1 bg-background border border-primary rounded-lg text-sm font-semibold focus:outline-none text-center shadow-inner"
              autoFocus
            />
            <span className="text-xs text-sidebar-fg">/ 100</span>
          </div>
        ) : isCompleted && grade ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-foreground">
                {grade.marks_obtained}
              </span>
              <span className="text-xs text-sidebar-fg font-medium">/ 100</span>
              <span className={cn("px-2 py-0.5 rounded-md text-xs font-black border", getBadgeStyle(grade.grade_letter))}>
                {grade.grade_letter}
              </span>
            </div>
            <div className="text-[11px] text-sidebar-fg font-medium">
              Grade Point: <strong className="text-foreground">{grade.grade_points?.toFixed(1) || '0.0'}</strong>
            </div>
          </div>
        ) : isDropped ? (
          <span className="text-xs text-sidebar-fg italic">—</span>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={inlineMarks}
              onChange={(e) => setInlineMarks(e.target.value)}
              placeholder="0–100"
              className="w-20 px-2 py-1 bg-background border border-card-border rounded-lg text-sm text-center focus:outline-none focus:border-primary font-medium"
            />
            <span className="text-xs text-sidebar-fg">/ 100</span>
          </div>
        )}
      </td>

      {/* Graded Date */}
      <td className="px-6 py-4 text-center text-xs text-sidebar-fg">
        {grade?.graded_at ? (
          formatDate(grade.graded_at)
        ) : (
          <span className="italic opacity-60">Not graded</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        {isInlineEditing ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={handleSaveInline}
              disabled={isSubmitting || !editMarks}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? '...' : 'Save'}
            </button>
            <button
              onClick={cancelEdit}
              className="p-1 hover:bg-sidebar-accent rounded-lg text-sidebar-fg transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : isCompleted && grade ? (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={startEdit}
              className="p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-fg hover:text-primary transition-colors"
              title="Edit grade"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onResetRequest(enrollment)}
              className="p-2 hover:bg-rose-500/10 rounded-lg text-sidebar-fg hover:text-rose-500 transition-colors"
              title="Reset / delete grade"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : isDropped ? (
          <span className="text-xs text-sidebar-fg italic">—</span>
        ) : (
          <button
            onClick={() => onAssign(enrollment.enrollment_id, inlineMarks)}
            disabled={isSubmitting || !inlineMarks}
            className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting ? 'Saving...' : 'Assign'}
          </button>
        )}
      </td>
    </tr>
  );
}
