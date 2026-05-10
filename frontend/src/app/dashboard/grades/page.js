'use client';

import { useState, useEffect } from 'react';
import { Award, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';

export default function StudentGradesPage() {
  const { getMyGrades, getMyGPA } = useApp();
  const { toast } = useToast();
  
  const [grades, setGrades] = useState([]);
  const [gpaData, setGpaData] = useState({ gpa: '0.00', totalCredits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gradesRes, gpaRes] = await Promise.all([
          getMyGrades(),
          getMyGPA()
        ]);
        
        if (gradesRes.success) {
          setGrades(gradesRes.data);
        }
        if (gpaRes.success) {
          setGpaData(gpaRes.data);
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load grades.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [getMyGrades, getMyGPA, toast]);

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sidebar-fg">Loading academic records...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Award}
        title="Academic Records"
        description="View your grades, completed courses, and overall GPA."
      />

      {/* GPA Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex items-center justify-between hover:border-primary/50 transition-colors">
          <div>
            <h2 className="text-sm font-semibold text-sidebar-fg uppercase tracking-wider mb-1">Cumulative GPA</h2>
            <div className="text-4xl font-bold text-foreground">
              {gpaData.gpa} <span className="text-lg text-sidebar-fg font-medium">/ 4.0</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Award className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex items-center justify-between hover:border-primary/50 transition-colors">
          <div>
            <h2 className="text-sm font-semibold text-sidebar-fg uppercase tracking-wider mb-1">Total Credits Earned</h2>
            <div className="text-4xl font-bold text-foreground">
              {gpaData.totalCredits}
            </div>
          </div>
          <div className="w-16 h-16 bg-sidebar-accent rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-sidebar-fg" />
          </div>
        </div>
      </div>

      {/* Grades List */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-card-border">
          <h3 className="text-lg font-bold text-foreground">Course Grades</h3>
        </div>
        
        {grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-sidebar-fg uppercase bg-sidebar-accent/50 border-b border-card-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Semester</th>
                  <th className="px-6 py-4 font-semibold">Credits</th>
                  <th className="px-6 py-4 font-semibold text-center">Marks</th>
                  <th className="px-6 py-4 font-semibold text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((item) => (
                  <tr key={item.grade_id} className="border-b border-card-border hover:bg-sidebar-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{item.enrollment?.course?.course_name}</div>
                      <div className="text-xs text-sidebar-fg">{item.enrollment?.course?.course_code}</div>
                    </td>
                    <td className="px-6 py-4 text-sidebar-fg">
                      {item.enrollment?.course?.semester_label || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sidebar-fg">
                      {item.enrollment?.course?.credits}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-foreground">
                      {item.marks_obtained}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-bold",
                        item.grade_letter?.startsWith('A') ? "bg-green-500/10 text-green-500" :
                        item.grade_letter?.startsWith('B') ? "bg-blue-500/10 text-blue-500" :
                        item.grade_letter?.startsWith('C') ? "bg-yellow-500/10 text-yellow-500" :
                        item.grade_letter?.startsWith('D') ? "bg-orange-500/10 text-orange-500" :
                        "bg-red-500/10 text-red-500"
                      )}>
                        {item.grade_letter}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-sidebar-fg mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Grades Available</h3>
            <p className="text-sidebar-fg mt-1">You do not have any graded courses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
