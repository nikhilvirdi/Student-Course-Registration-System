'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Book, Edit2, Trash2, Plus, AlertCircle, Calendar, MapPin } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { apiFetch, cn } from '@/lib/utils';

const EMPTY_FORM = {
  course_name:    '',
  description:    '',
  credits:        3,
  max_seats:      50,
  department_id:  '',
  faculty_id:     '',
  course_code:    '',
  schedule_days:  '',
  schedule_time:  '',
  room:           '',
  semester_label: '',
};

export default function AdminCoursesPage() {
  const { token, user } = useApp();
  const [courses, setCourses]         = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState(EMPTY_FORM);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, deptData, facData] = await Promise.all([
        apiFetch('/courses'),
        apiFetch('/departments'),
        apiFetch('/faculty'),
      ]);

      setCourses(coursesData.data || []);
      setDepartments(deptData.data || []);
      
      if (deptData.data?.length > 0 && !editingId) {
        setFormData(prev => ({ ...prev, department_id: deptData.data[0].department_id }));
      }

      setFaculties(facData.data || []);
      if (facData.data?.length > 0 && !editingId) {
        setFormData(prev => ({ ...prev, faculty_id: facData.data[0].faculty_id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...EMPTY_FORM,
      department_id: departments[0]?.department_id || '',
      faculty_id:    faculties[0]?.faculty_id    || '',
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const path = editingId ? `/courses/${editingId}` : '/courses';
      const method = editingId ? 'PUT' : 'POST';

      await apiFetch(path, {
        method,
        token,
        body: formData,
      });

      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message || `Failed to ${editingId ? 'update' : 'create'} course`);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.course_id);
    setFormData({
      course_name:    course.course_name    || '',
      description:    course.description    || '',
      credits:        course.credits        || 3,
      max_seats:      course.max_seats      || 50,
      department_id:  course.department_id  || '',
      faculty_id:     course.faculty_id     || '',
      course_code:    course.course_code    || '',
      schedule_days:  course.schedule_days  || '',
      schedule_time:  course.schedule_time  || '',
      room:           course.room           || '',
      semester_label: course.semester_label || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiFetch(`/courses/${id}`, {
        method: 'DELETE',
        token,
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    }
  };

  const field = (key) => ({
    value: formData[key],
    onChange: (e) => setFormData({ ...formData, [key]: e.target.value }),
    className: 'w-full bg-background border border-card-border rounded-lg p-2 text-foreground text-sm',
  });

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Book}
        title="Manage Courses"
        description="Create, update, and remove courses."
        action={
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'New Course'}
          </button>
        }
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-card border border-card-border p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-5">{editingId ? 'Edit Course' : 'Create New Course'}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            <p className="text-xs font-semibold text-sidebar-fg uppercase tracking-wider">Core Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Name <span className="text-destructive">*</span></label>
                <input type="text" {...field('course_name')} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course Code</label>
                <input type="text" placeholder="e.g. CS401" {...field('course_code')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department <span className="text-destructive">*</span></label>
                <select {...field('department_id')} required>
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => (
                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Faculty <span className="text-destructive">*</span></label>
                <select {...field('faculty_id')} required>
                  <option value="" disabled>Select Faculty</option>
                  {faculties.map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credits <span className="text-destructive">*</span></label>
                <input type="number" min="1" max="6" {...field('credits')} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Seats <span className="text-destructive">*</span></label>
                <input type="number" min="1" {...field('max_seats')} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description <span className="text-destructive">*</span></label>
              <textarea {...field('description')} className="w-full bg-background border border-card-border rounded-lg p-2 h-24 text-sm" required />
            </div>

            <p className="text-xs font-semibold text-sidebar-fg uppercase tracking-wider pt-2">Scheduling & Location</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Schedule Days</label>
                <input type="text" placeholder="e.g. Mon, Wed, Fri" {...field('schedule_days')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Schedule Time</label>
                <input type="text" placeholder="e.g. 10:00 AM - 11:30 AM" {...field('schedule_time')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Room / Classroom</label>
                <input type="text" placeholder="e.g. Hall A - 301" {...field('room')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Semester Label</label>
                <input type="text" placeholder="e.g. Odd Sem 2024-25" {...field('semester_label')} />
              </div>
            </div>

            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold">
              {editingId ? 'Update Course' : 'Save Course'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sidebar-accent/50 text-sidebar-fg">
              <tr>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium">Schedule</th>
                <th className="p-4 font-medium">Credits</th>
                <th className="p-4 font-medium">Seats</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-sidebar-fg">Loading...</td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-sidebar-fg">No courses found. Create one above.</td></tr>
              ) : courses.map(course => (
                <tr key={course.course_id} className="hover:bg-sidebar-accent/30">
                  <td className="p-4">
                    <div className="font-bold text-foreground">{course.course_name}</div>
                    <div className="text-xs text-sidebar-fg">{course.course_code || course.course_id.substring(0, 8)}</div>
                  </td>
                  <td className="p-4 text-sidebar-fg">{course.department?.department_name}</td>
                  <td className="p-4">
                    {course.schedule_days ? (
                      <div>
                        <div className="flex items-center gap-1 text-xs"><Calendar className="w-3 h-3" /> {course.schedule_days}</div>
                        <div className="flex items-center gap-1 text-xs text-sidebar-fg"><MapPin className="w-3 h-3" /> {course.room || '—'}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-sidebar-fg">Not set</span>
                    )}
                  </td>
                  <td className="p-4">{course.credits}</td>
                  <td className="p-4">{course.available_seats} / {course.max_seats}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-2 text-sidebar-fg hover:text-primary transition-colors bg-background rounded-lg border border-card-border"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.course_id)}
                      className="p-2 text-sidebar-fg hover:text-destructive transition-colors bg-background rounded-lg border border-card-border"
                    >
                      <Trash2 className="w-4 h-4" />
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
