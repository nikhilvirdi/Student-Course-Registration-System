'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { GraduationCap, AlertCircle, FileText, Calendar } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils';

export default function AdminEnrollmentsPage() {
  const { token, user } = useApp();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/admin/enrollments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data.data || []);
        } else {
          const data = await res.json();
          setError(data.message || 'Failed to fetch enrollments');
        }
      } catch (err) {
        setError('Network error: Failed to fetch enrollments');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchEnrollments();
  }, [token]);

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={GraduationCap}
        title="Enrollment Records"
        description="View all student course enrollments and grading status."
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
                <th className="p-4 font-medium">Student Info</th>
                <th className="p-4 font-medium">Course Details</th>
                <th className="p-4 font-medium">Enrollment Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-sidebar-fg">Loading enrollments...</td></tr>
              ) : enrollments.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-sidebar-fg">No enrollments found.</td></tr>
              ) : enrollments.map((enrol) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
