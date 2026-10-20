import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  BookOpen, 
  Award, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle 
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import { apiFetch, cn } from '@/lib/utils';

export default function AdminStudentsPage() {
  const { user } = useApp();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    semester: 1,
    department_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/students');
      setStudents(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiFetch('/departments');
      setDepartments(data.data || []);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      semester: 1,
      department_id: departments[0]?.department_id || '',
    });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      password: '',
      semester: student.semester || 1,
      department_id: student.department_id || departments[0]?.department_id || '',
    });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (editingStudent) {
        // Update
        const payload = {
          name: formData.name,
          email: formData.email,
          semester: parseInt(formData.semester),
          department_id: formData.department_id,
        };
        await apiFetch(`/admin/students/${editingStudent.student_id}`, {
          method: 'PUT',
          body: payload,
        });
        setSuccessMsg('Student updated successfully');
      } else {
        // Create
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password || 'student123',
          semester: parseInt(formData.semester),
          department_id: formData.department_id,
        };
        await apiFetch('/admin/students', {
          method: 'POST',
          body: payload,
        });
        setSuccessMsg('Student created successfully');
      }

      handleCloseModal();
      await fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!confirm(`Are you sure you want to delete student "${student.name}"? This will permanently delete their enrollments, grades, and records.`)) {
      return;
    }

    try {
      setError('');
      setSuccessMsg('');
      await apiFetch(`/admin/students/${student.student_id}`, {
        method: 'DELETE',
      });
      setSuccessMsg(`Student ${student.name} deleted successfully`);
      await fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to delete student');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold">Access Denied. Admins only.</div>;
  }

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Users}
        title="Manage Students"
        description="View, register, update, and manage student accounts and academic records."
        action={
          <button
            onClick={handleOpenCreateModal}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Student
          </button>
        }
      />

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or department..."
          className="w-full sm:w-96"
        />
        <div className="text-sm text-sidebar-fg">
          <span className="font-bold text-foreground">{filteredStudents.length}</span> students found
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sidebar-accent/50 text-sidebar-fg">
              <tr>
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium text-center">Semester</th>
                <th className="p-4 font-medium text-center">Enrollments</th>
                <th className="p-4 font-medium text-center">GPA</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-sidebar-fg">Loading students...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-sidebar-fg">No students found.</td></tr>
              ) : filteredStudents.map((student) => (
                <React.Fragment key={student.student_id}>
                  <tr className={cn("hover:bg-sidebar-accent/30 transition-colors", expandedId === student.student_id && "bg-sidebar-accent/20")}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {student.name ? student.name.substring(0, 2).toUpperCase() : 'ST'}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{student.name}</div>
                          <div className="text-xs text-sidebar-fg flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sidebar-fg font-medium">{student.department}</td>
                    <td className="p-4 text-center font-semibold text-foreground">Sem {student.semester}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-sidebar-accent rounded-md text-xs font-medium text-sidebar-fg">
                        {student.enrollments_count} courses
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "font-bold text-sm",
                        student.gpa >= 8.0 ? "text-emerald-500" :
                        student.gpa >= 6.0 ? "text-primary" :
                        student.gpa > 0 ? "text-amber-500" : "text-sidebar-fg"
                      )}>
                        {student.gpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                        student.status === 'Active' 
                          ? "bg-primary/10 text-primary border-primary/20" 
                          : "bg-sidebar-accent/50 text-sidebar-fg border-card-border"
                      )}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          title="Edit Student"
                          className="p-1.5 hover:bg-sidebar-accent hover:text-primary rounded-lg text-sidebar-fg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          title="Delete Student"
                          className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-sidebar-fg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setExpandedId(expandedId === student.student_id ? null : student.student_id)}
                          title="View Enrollments"
                          className="p-1.5 hover:bg-sidebar-accent rounded-lg text-sidebar-fg transition-colors"
                        >
                          {expandedId === student.student_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded detail row */}
                  {expandedId === student.student_id && student.enrollments && (
                    <tr key={`${student.student_id}-detail`}>
                      <td colSpan="7" className="p-0">
                        <div className="bg-sidebar-accent/20 border-t border-card-border p-6">
                          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Enrollment Details ({student.enrollments.length})
                          </h4>
                          {student.enrollments.length > 0 ? (
                            <div className="grid gap-2">
                              {student.enrollments.map((enrol) => (
                                <div key={enrol.enrollment_id} className="flex items-center justify-between bg-card border border-card-border rounded-lg p-3">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">{enrol.course?.course_name}</p>
                                      <p className="text-xs text-sidebar-fg">{enrol.course?.course_code} • {enrol.course?.credits} credits</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className={cn(
                                      "px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide",
                                      enrol.status === 'ACTIVE' ? "bg-blue-500/10 text-blue-500" :
                                      enrol.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" :
                                      "bg-gray-500/10 text-gray-400"
                                    )}>
                                      {enrol.status}
                                    </span>
                                    {enrol.grade && (
                                      <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                                        <Award className="w-4 h-4 text-primary" />
                                        {enrol.grade.grade_letter} ({enrol.grade.marks_obtained} marks)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-sidebar-fg italic">No enrollments yet for this student.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-lg shadow-xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-card-border mb-5">
              <h3 className="text-lg font-bold text-foreground">
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {!editingStudent && (
                <div>
                  <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="Defaults to student123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-card-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-sidebar-fg hover:bg-sidebar-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
