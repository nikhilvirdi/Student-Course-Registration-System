import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Users, AlertCircle, ChevronDown, ChevronUp, Mail, BookOpen, Award } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import { apiFetch, cn } from '@/lib/utils';

export default function AdminStudentsPage() {
  const { user } = useApp();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
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
        description="View and manage all registered students, their enrollments, and academic performance."
      />

      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or department..."
          className="w-full sm:w-96"
        />
        <div className="text-sm text-sidebar-fg">
          <span className="font-bold text-foreground">{filteredStudents.length}</span> students
        </div>
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
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium text-center">Semester</th>
                <th className="p-4 font-medium text-center">Enrollments</th>
                <th className="p-4 font-medium text-center">GPA</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium"></th>
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
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{student.name}</div>
                          <div className="text-xs text-sidebar-fg flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sidebar-fg">{student.department}</td>
                    <td className="p-4 text-center font-medium text-foreground">{student.semester}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-sidebar-accent rounded-md text-xs font-medium text-sidebar-fg">
                        {student.enrollments_count} courses
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "font-bold",
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
                      <button 
                        onClick={() => setExpandedId(expandedId === student.student_id ? null : student.student_id)}
                        className="p-1.5 hover:bg-sidebar-accent rounded-lg text-sidebar-fg transition-colors"
                      >
                        {expandedId === student.student_id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                  {/* Expanded detail row */}
                  {expandedId === student.student_id && student.enrollments && (
                    <tr key={`${student.student_id}-detail`}>
                      <td colSpan="7" className="p-0">
                        <div className="bg-sidebar-accent/20 border-t border-card-border p-6">
                          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Enrollment Details
                          </h4>
                          {student.enrollments.length > 0 ? (
                            <div className="grid gap-2">
                              {student.enrollments.map((enrol) => (
                                <div key={enrol.enrollment_id} className="flex items-center justify-between bg-card border border-card-border rounded-lg p-3">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{enrol.course?.course_name}</p>
                                      <p className="text-xs text-sidebar-fg">{enrol.course?.course_code} • {enrol.course?.credits} credits</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded text-xs font-medium",
                                      enrol.status === 'ACTIVE' ? "bg-blue-500/10 text-blue-500" :
                                      enrol.status === 'COMPLETED' ? "bg-green-500/10 text-green-500" :
                                      "bg-gray-500/10 text-gray-500"
                                    )}>
                                      {enrol.status}
                                    </span>
                                    {enrol.grade && (
                                      <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                                        <Award className="w-4 h-4 text-primary" />
                                        {enrol.grade.grade_letter} ({enrol.grade.marks_obtained})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-sidebar-fg italic">No enrollments yet.</p>
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
    </div>
  );
}
