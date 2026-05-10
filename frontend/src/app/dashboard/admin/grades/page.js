'use client';

import { useState, useEffect } from 'react';
import { Award, BookOpen, User, CheckCircle, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn, apiFetch } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';

export default function AdminGradesPage() {
  const { token, user } = useApp();
  const { toast } = useToast();
  
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(null);

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold text-center">Access Denied. Admins only.</div>;
  }

  useEffect(() => {
    fetchEnrollments();
  }, [token]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/enrollments');
      if (res.success) {
        setEnrollments(res.data);
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to load enrollments.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignGrade = async (enrollmentId, marks) => {
    if (marks < 0 || marks > 100 || isNaN(marks)) {
      toast({ title: 'Invalid Marks', description: 'Marks must be between 0 and 100.', type: 'error' });
      return;
    }
    
    try {
      setSubmitting(enrollmentId);
      const res = await apiFetch('/grades', {
        method: 'POST',
        token,
        body: { 
          enrollment_id: enrollmentId, 
          marks_obtained: parseFloat(marks) 
        }
      });

      if (res.success) {
        toast({ title: 'Success', description: 'Grade assigned successfully.', type: 'success' });
        // Update local state to reflect the new grade and COMPLETED status
        setEnrollments(prev => prev.map(e => 
          e.enrollment_id === enrollmentId 
            ? { ...e, status: 'COMPLETED', grade: res.data }
            : e
        ));
      }
    } catch (error) {
      toast({ title: 'Assignment Failed', description: error.message, type: 'error' });
    } finally {
      setSubmitting(null);
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      e.student?.name?.toLowerCase().includes(query) ||
      e.course?.course_name?.toLowerCase().includes(query) ||
      e.course?.course_code?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Award}
        title="Manage Grades"
        description="Assign marks and compute grades for student enrollments."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border border-card-border p-4 rounded-xl shadow-sm">
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student or course..."
          className="w-full sm:w-96"
        />
        <div className="text-sm text-sidebar-fg">
          Showing <span className="font-bold text-foreground">{filteredEnrollments.length}</span> enrollments
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-sidebar-fg">Loading enrollments...</div>
        ) : filteredEnrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-sidebar-fg uppercase bg-sidebar-accent/50 border-b border-card-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Marks / Grade</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((e) => (
                  <GradeRow 
                    key={e.enrollment_id} 
                    enrollment={e} 
                    onAssign={handleAssignGrade}
                    submitting={submitting === e.enrollment_id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Search className="w-12 h-12 text-sidebar-fg mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No enrollments found</h3>
            <p className="text-sidebar-fg mt-1">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GradeRow({ enrollment, onAssign, submitting }) {
  const [inputMarks, setInputMarks] = useState('');
  
  const isCompleted = enrollment.status === 'COMPLETED' || enrollment.grade;
  const grade = enrollment.grade;

  return (
    <tr className="border-b border-card-border hover:bg-sidebar-accent/30 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          {enrollment.student?.name}
        </div>
        <div className="text-xs text-sidebar-fg mt-1">{enrollment.student?.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="font-medium text-foreground">{enrollment.course?.course_name}</div>
        <div className="text-xs text-sidebar-fg">{enrollment.course?.course_code}</div>
      </td>
      <td className="px-6 py-4">
        <span className={cn(
          "px-2.5 py-1 rounded-md text-xs font-bold",
          enrollment.status === 'ACTIVE' ? "bg-blue-500/10 text-blue-500" :
          enrollment.status === 'COMPLETED' ? "bg-green-500/10 text-green-500" :
          "bg-gray-500/10 text-gray-500"
        )}>
          {enrollment.status}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {isCompleted && grade ? (
          <div className="flex items-center justify-center gap-3">
            <span className="font-medium text-foreground">{grade.marks_obtained}</span>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-bold",
              grade.grade_letter === 'A' ? "bg-green-500/10 text-green-500" :
              grade.grade_letter === 'B' ? "bg-blue-500/10 text-blue-500" :
              grade.grade_letter === 'C' ? "bg-yellow-500/10 text-yellow-500" :
              grade.grade_letter === 'D' ? "bg-orange-500/10 text-orange-500" :
              "bg-red-500/10 text-red-500"
            )}>
              {grade.grade_letter}
            </span>
          </div>
        ) : (
          <input
            type="number"
            min="0"
            max="100"
            value={inputMarks}
            onChange={(e) => setInputMarks(e.target.value)}
            placeholder="0-100"
            className="w-20 px-2 py-1 bg-background border border-card-border rounded-md text-sm focus:outline-none focus:border-primary text-center"
            disabled={enrollment.status === 'DROPPED'}
          />
        )}
      </td>
      <td className="px-6 py-4 text-right">
        {isCompleted ? (
          <span className="inline-flex items-center justify-end gap-1 text-xs font-medium text-sidebar-fg w-full">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Graded
          </span>
        ) : enrollment.status === 'DROPPED' ? (
          <span className="text-xs text-sidebar-fg italic">Dropped</span>
        ) : (
          <button
            onClick={() => onAssign(enrollment.enrollment_id, inputMarks)}
            disabled={submitting || !inputMarks}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : 'Assign'}
          </button>
        )}
      </td>
    </tr>
  );
}
