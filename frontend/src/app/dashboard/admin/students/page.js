'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Users, AlertCircle, ChevronDown, ChevronUp, Mail, GraduationCap } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils';

export default function AdminStudentsPage() {
  const { token, user } = useApp();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/admin/students', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setStudents(data.data || []);
        } else {
          const data = await res.json();
          setError(data.message || 'Failed to fetch students');
        }
      } catch (err) {
        setError('Network error: Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchStudents();
  }, [token]);

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Users}
        title="Manage Students"
        description="View and manage all registered students, their enrollments, and academic performance."
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-2">
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
              ) : students.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-sidebar-fg">No students found.</td></tr>
              ) : students.map((student) => (
                <tr key={student.student_id} className={cn("hover:bg-sidebar-accent/30 transition-colors", expandedId === student.student_id && "bg-sidebar-accent/20")}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
