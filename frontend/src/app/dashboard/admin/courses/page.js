'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Book, Edit2, Trash2, Plus, AlertCircle } from 'lucide-react';

export default function AdminCoursesPage() {
  const { token, user } = useApp();
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    course_name: '',
    description: '',
    credits: 3,
    max_seats: 50,
    department_id: '',
    faculty_id: ''
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, deptRes, facRes] = await Promise.all([
        fetch('http://localhost:5000/api/courses'),
        fetch('http://localhost:5000/api/departments'),
        fetch('http://localhost:5000/api/faculty')
      ]);
      
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.data || []);
      }
      
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data);
        if (data.length > 0 && !formData.department_id && !editingId) {
          setFormData(prev => ({ ...prev, department_id: data[0].department_id }));
        }
      }
      
      if (facRes.ok) {
        const data = await facRes.json();
        setFaculties(data);
        if (data.length > 0 && !formData.faculty_id && !editingId) {
          setFormData(prev => ({ ...prev, faculty_id: data[0].faculty_id }));
        }
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `http://localhost:5000/api/courses/${editingId}` 
        : 'http://localhost:5000/api/courses';
      const method = editingId ? 'PUT' : 'POST';
        
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({
          course_name: '',
          description: '',
          credits: 3,
          max_seats: 50,
          department_id: departments[0]?.department_id || '',
          faculty_id: faculties[0]?.faculty_id || ''
        });
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || `Failed to ${editingId ? 'update' : 'create'} course`);
      }
    } catch (err) {
      setError(`Failed to ${editingId ? 'update' : 'create'} course`);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.course_id);
    setFormData({
      course_name: course.course_name,
      description: course.description,
      credits: course.credits,
      max_seats: course.max_seats,
      department_id: course.department_id,
      faculty_id: course.faculty_id
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete course');
      }
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Courses</h1>
          <p className="text-sm text-sidebar-fg">Create, update, and remove courses.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setFormData({
                course_name: '',
                description: '',
                credits: 3,
                max_seats: 50,
                department_id: departments[0]?.department_id || '',
                faculty_id: faculties[0]?.faculty_id || ''
              });
            } else {
              setShowForm(true);
            }
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New Course'}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-card border border-card-border p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Course' : 'Create New Course'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Name</label>
                <input 
                  type="text" 
                  value={formData.course_name}
                  onChange={e => setFormData({...formData, course_name: e.target.value})}
                  className="w-full bg-background border border-card-border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select 
                  value={formData.department_id}
                  onChange={e => setFormData({...formData, department_id: e.target.value})}
                  className="w-full bg-background border border-card-border rounded-lg p-2"
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => (
                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Faculty</label>
                <select 
                  value={formData.faculty_id}
                  onChange={e => setFormData({...formData, faculty_id: e.target.value})}
                  className="w-full bg-background border border-card-border rounded-lg p-2"
                  required
                >
                  <option value="" disabled>Select Faculty</option>
                  {faculties.map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credits</label>
                <input 
                  type="number" 
                  value={formData.credits}
                  onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})}
                  className="w-full bg-background border border-card-border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Seats</label>
                <input 
                  type="number" 
                  value={formData.max_seats}
                  onChange={e => setFormData({...formData, max_seats: parseInt(e.target.value)})}
                  className="w-full bg-background border border-card-border rounded-lg p-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-background border border-card-border rounded-lg p-2 h-24"
                required
              />
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold">
              {editingId ? 'Update Course' : 'Save Course'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-sidebar-accent/50 text-sidebar-fg">
            <tr>
              <th className="p-4 font-medium">Course</th>
              <th className="p-4 font-medium">Department</th>
              <th className="p-4 font-medium">Credits</th>
              <th className="p-4 font-medium">Seats</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
            ) : courses.map(course => (
              <tr key={course.course_id} className="hover:bg-sidebar-accent/30">
                <td className="p-4">
                  <div className="font-bold text-foreground">{course.course_name}</div>
                  <div className="text-xs text-sidebar-fg">{course.course_id.substring(0, 8)}</div>
                </td>
                <td className="p-4">{course.department?.department_name}</td>
                <td className="p-4">{course.credits}</td>
                <td className="p-4">{course.available_seats} / {course.max_seats}</td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => handleEdit(course)}
                    className="p-2 text-sidebar-fg hover:text-primary transition-colors bg-background rounded-lg border border-card-border"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(course.course_id)} className="p-2 text-sidebar-fg hover:text-destructive transition-colors bg-background rounded-lg border border-card-border">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
