'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { GraduationCap, AlertCircle, FileText, Calendar, Plus, Trash2, X, UserPlus } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ student_id: '', course_id: '' });
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchData();
    }
  }, [token, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrolData, studData, courseData] = await Promise.all([
        apiFetch('/admin/enrollments', { token }),
        apiFetch('/admin/students', { token }),
        apiFetch('/courses'),
      ]);
      setEnrollments(enrolData.data || []);
      setStudents(studData.data || []);
      setCourses(courseData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!enrollForm.student_id || !enrollForm.course_id) return;
    try {
      setEnrolling(true);
      await apiFetch('/admin/enrollments', {
        method: 'POST',
        token,
        body: enrollForm,
      });
      toast({ title: 'Success', description: 'Student enrolled successfully.', type: 'success' });
      setShowEnrollModal(false);
      setEnrollForm({ student_id: '', course_id: '' });
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, type: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  const handleDrop = async (enrollmentId) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;
    try {
      await apiFetch(`/admin/enrollments/${enrollmentId}`, {
        method: 'DELETE',
        token,
      });
      toast({ title: 'Success', description: 'Enrollment removed successfully.', type: 'success' });
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, type: 'error' });
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold">Access Denied. Admins only.</div>;
  }

  const activeCount = enrollments.filter(e => e.status === 'ACTIVE').length;
  const completedCount = enrollments.filter(e => e.status === 'COMPLETED').length;

  const filteredEnrollments = enrollments.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.student?.name?.toLowerCase().includes(q) ||
      e.course?.course_name?.toLowerCase().includes(q) ||
      e.course?.course_code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={GraduationCap}
        title="Enrollment Records"
        description="Manage student-course enrollments. Enroll, de-enroll, and audit records."
        action={
          <button
            onClick={() => setShowEnrollModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Student
          </button>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: enrollments.length, color: 'text-foreground' },
          { label: 'Active', value: activeCount, color: 'text-blue-500' },
          { label: 'Completed', value: completedCount, color: 'text-green-500' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-card-border rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-sidebar-fg uppercase tracking-wider">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student or course..."
          className="w-full sm:w-96"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sidebar-accent/50 text-sidebar-fg">
              <tr>
                <th className="p-4 font-medium">Student Info</th>
                <th className="p-4 font-medium">Course Details</th>
                <th className="p-4 font-medium">Enrollment Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Grade</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-sidebar-fg">Loading enrollments...</td></tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-sidebar-fg">No enrollments found.</td></tr>
              ) : filteredEnrollments.map((enrol) => (
                <tr key={enrol.enrollment_id} className="hover:bg-sidebar-accent/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-foreground">{enrol.student?.name}</div>
                    <div className="text-xs text-sidebar-fg flex items-center gap-1 mt-0.5">
                      <FileText className="w-3 h-3" /> {enrol.student?.department?.department_name}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{enrol.course?.course_name}</div>
                    <div className="text-xs text-sidebar-fg mt-0.5">{enrol.course?.course_code} • {enrol.course?.semester_label}</div>
                  </td>
                  <td className="p-4 text-sidebar-fg">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(enrol.enrollment_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border",
                      enrol.status === 'ACTIVE' ? "bg-primary/10 text-primary border-primary/20" :
                      enrol.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      "bg-sidebar-accent/50 text-sidebar-fg border-card-border"
                    )}>
                      {enrol.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-4">
                    {enrol.grade ? (
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-foreground">{enrol.grade.grade_letter}</span>
                        <span className="text-xs text-sidebar-fg">{enrol.grade.marks_obtained} marks</span>
                      </div>
                    ) : (
                      <span className="text-xs text-sidebar-fg px-2 py-1 bg-sidebar-accent/50 rounded-md">Not Graded</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {enrol.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleDrop(enrol.enrollment_id)}
                        className="p-2 text-sidebar-fg hover:text-red-500 transition-colors bg-background rounded-lg border border-card-border"
                        title="Remove enrollment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-card-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Enroll Student in Course</h2>
              <button onClick={() => setShowEnrollModal(false)} className="p-1 hover:bg-sidebar-accent rounded-lg text-sidebar-fg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEnroll} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Student</label>
                <select
                  value={enrollForm.student_id}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, student_id: e.target.value }))}
                  className="w-full bg-background border border-card-border rounded-lg p-2.5 text-foreground text-sm"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Course</label>
                <select
                  value={enrollForm.course_id}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, course_id: e.target.value }))}
                  className="w-full bg-background border border-card-border rounded-lg p-2.5 text-foreground text-sm"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name} ({c.available_seats}/{c.max_seats} seats)
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={enrolling}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
