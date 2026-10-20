'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/utils';

// Deterministic Demo Profiles for Unauthenticated Development Mode
export const DEMO_STUDENT = {
  id: '00000000-0000-4000-a000-000000000001',
  student_id: '00000000-0000-4000-a000-000000000001',
  name: 'Alex Doe',
  firstName: 'Alex',
  lastName: 'Doe',
  email: 'alex.doe@scrs.edu',
  role: 'STUDENT',
  semester: 3,
  department: { department_id: '10000008-0000-4000-a000-000000000008', department_name: 'Computer Science & Engineering' },
  avatar: 'AD',
  preferences: {
    language: 'English (US)',
    notifications: { email: true, push: true, updates: true },
    privacy: { profilePublic: true, showGrades: false }
  }
};

export const DEMO_ADMIN = {
  id: 'a0000000-0000-4000-a000-000000000001',
  admin_id: 'a0000000-0000-4000-a000-000000000001',
  name: 'System Admin',
  firstName: 'System',
  lastName: 'Admin',
  email: 'admin@scrs.com',
  role: 'ADMIN',
  avatar: 'SA',
  preferences: {
    language: 'English (US)',
    notifications: { email: true, push: true, updates: true },
    privacy: { profilePublic: true, showGrades: false }
  }
};

const AppContext = createContext();

export function AppProvider({ children }) {
  // --- Unauthenticated Development Mode State ---
  const [activeRole, setActiveRole] = useState('STUDENT');
  const [user, setUser] = useState(DEMO_STUDENT);
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    courses: [],
    tasks: [],
    documents: [],
  });

  // Switch demo mode role between STUDENT and ADMIN
  const switchRole = useCallback((newRole) => {
    const targetRole = newRole.toUpperCase();
    setActiveRole(targetRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('scrs_demo_role', targetRole);
    }
    if (targetRole === 'ADMIN') {
      setUser(DEMO_ADMIN);
    } else {
      setUser(DEMO_STUDENT);
    }
  }, []);

  // Restore saved demo role preference on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('scrs_demo_role');
      if (savedRole === 'ADMIN') {
        setActiveRole('ADMIN');
        setUser(DEMO_ADMIN);
      } else {
        setActiveRole('STUDENT');
        setUser(DEMO_STUDENT);
      }
    }
  }, []);

  // Fetch courses and enrollment states from backend
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/courses');
      if (data.success && data.data) {
        let enrolledCourseIds = new Set();
        
        if (activeRole === 'STUDENT') {
          try {
            const enrolData = await apiFetch('/enrollments/my');
            if (enrolData.success && enrolData.data) {
              enrolData.data.forEach(e => enrolledCourseIds.add(e.course_id));
            }
          } catch (err) {
            console.warn("Could not fetch student enrollments:", err.message);
          }
        }

        const colors = ['#00D1FF', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
        const mappedCourses = data.data.map((c, index) => ({
          id: c.course_id,
          code: c.course_code || c.course_id.substring(0, 8).toUpperCase(),
          name: c.course_name,
          instructor: c.faculty?.faculty_name || 'TBA',
          semester: c.semester_label || 'Current Semester',
          progress: 0,
          color: colors[index % colors.length],
          schedule: c.schedule_days && c.schedule_time
            ? `${c.schedule_days} ${c.schedule_time}`
            : null,
          schedule_days: c.schedule_days || null,
          schedule_time: c.schedule_time || null,
          room: c.room || null,
          semester_label: c.semester_label || null,
          status: enrolledCourseIds.has(c.course_id) ? 'Enrolled' : 'Available',
          students: c.max_seats - c.available_seats,
          credits: c.credits,
          tags: [c.department?.department_name || 'General'],
          nextClass: c.schedule_days && c.schedule_time
            ? `${c.schedule_days.split(',')[0].trim()} ${c.schedule_time.split('-')[0].trim()}`
            : null,
          materials: [],
          assignments: [],
          available_seats: c.available_seats,
          max_seats: c.max_seats,
          description: c.description
        }));
        setCourses(mappedCourses);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [activeRole]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch tasks, notifications, documents when in STUDENT mode
  const fetchStudentData = useCallback(async () => {
    if (activeRole !== 'STUDENT') {
      setTasks([]);
      setNotifications([]);
      setDocuments([]);
      return;
    }

    try {
      const [tasksRes, notifRes, docsRes] = await Promise.all([
        apiFetch('/tasks').catch(() => ({ success: false })),
        apiFetch('/notifications').catch(() => ({ success: false })),
        apiFetch('/documents').catch(() => ({ success: false })),
      ]);

      if (tasksRes.success && tasksRes.data) {
        setTasks(tasksRes.data.map(t => ({
          id: t.task_id,
          title: t.title,
          category: t.category,
          priority: t.priority,
          due_date: t.due_date,
          dueDate: t.due_date, // normalize for UI compatibility
          completed: t.completed,
          _backendId: t.task_id,
        })));
      }

      if (notifRes.success && notifRes.data) {
        setNotifications(notifRes.data.map(n => ({
          id: n.notification_id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          time: new Date(n.created_at).toLocaleString(),
          _backendId: n.notification_id,
        })));
      }

      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data.map(d => ({
          id: d.document_id,
          name: d.name,
          type: d.type,
          size: d.size,
          url: d.url,
          date: new Date(d.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          _backendId: d.document_id,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch student data:", err);
    }
  }, [activeRole]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // --- Actions ---

  // Auth compatibility stubs (non-blocking for backwards compatibility)
  const login = useCallback(async () => user, [user]);
  const register = useCallback(async () => user, [user]);
  const logout = useCallback(() => {
    // In unauthenticated mode, logout switches back to student view
    switchRole('STUDENT');
  }, [switchRole]);

  // User Actions
  const updateProfile = useCallback(async (updates) => {
    try {
      const data = await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: updates
      });
      setUser(prev => prev ? ({ ...prev, ...data.data }) : null);
      return data;
    } catch (err) {
      // Local fallback in dev mode if network issue
      setUser(prev => prev ? ({ ...prev, ...updates }) : null);
      return { success: true, data: updates };
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const data = await apiFetch('/auth/password', {
        method: 'PATCH',
        body: { currentPassword, newPassword }
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to update password');
    }
  }, []);

  const updatePreferences = useCallback((updates) => {
    setUser(prev => prev ? ({
      ...prev,
      preferences: { ...prev.preferences, ...updates }
    }) : null);
  }, []);

  // Course Actions
  const enrollCourse = useCallback(async (courseId) => {
    try {
      const data = await apiFetch('/enrollments/register', {
        method: 'POST',
        body: { course_id: courseId }
      });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Enrolled' } : c));
      return data;
    } catch (err) {
      throw new Error(err.message || 'Enrollment failed');
    }
  }, []);

  const dropCourse = useCallback(async (courseId) => {
    try {
      const data = await apiFetch(`/enrollments/drop/${courseId}`, {
        method: 'DELETE',
      });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Available' } : c));
      return data;
    } catch (err) {
      throw new Error(err.message || 'Drop course failed');
    }
  }, []);

  // Grade Actions
  const getMyGrades = useCallback(async () => {
    try {
      const data = await apiFetch('/grades/my');
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch grades');
    }
  }, []);

  const getMyGPA = useCallback(async () => {
    try {
      const data = await apiFetch('/grades/gpa');
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to calculate GPA');
    }
  }, []);

  const assignGrade = useCallback(async (enrollment_id, marks) => {
    try {
      const data = await apiFetch('/grades', {
        method: 'POST',
        body: { enrollment_id, marks_obtained: marks }
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to assign grade');
    }
  }, []);

  const updateGrade = useCallback(async (gradeId, marks) => {
    try {
      const data = await apiFetch(`/grades/${gradeId}`, {
        method: 'PUT',
        body: { marks_obtained: marks }
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to update grade');
    }
  }, []);

  const getStudentGrades = useCallback(async (student_id) => {
    try {
      const data = await apiFetch(`/grades/student/${student_id}`);
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch student grades');
    }
  }, []);

  // Enrollment Admin Actions
  const getAllEnrollments = useCallback(async () => {
    try {
      const data = await apiFetch('/enrollments/all');
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch enrollments');
    }
  }, []);

  const adminEnrollStudent = useCallback(async (studentId, courseId) => {
    try {
      const data = await apiFetch('/admin/enrollments', {
        method: 'POST',
        body: { student_id: studentId, course_id: courseId }
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to enroll student');
    }
  }, []);

  const adminDropEnrollment = useCallback(async (enrollmentId) => {
    try {
      const data = await apiFetch(`/admin/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to drop enrollment');
    }
  }, []);

  // Task Actions
  const addTask = useCallback(async (task) => {
    try {
      const data = await apiFetch('/tasks', {
        method: 'POST',
        body: {
          title: task.title,
          category: task.category || 'Other',
          priority: task.priority || 'Medium',
          due_date: task.due_date || task.dueDate || null,
        }
      });

      if (data.success && data.data) {
        const t = data.data;
        setTasks(prev => [{
          id: t.task_id,
          title: t.title,
          category: t.category,
          priority: t.priority,
          due_date: t.due_date,
          dueDate: t.due_date,
          completed: t.completed,
          _backendId: t.task_id,
        }, ...prev]);
      }

      return data;
    } catch (err) {
      const newTask = {
        id: Date.now(),
        completed: false,
        priority: 'Medium',
        due_date: task.due_date || task.dueDate,
        dueDate: task.due_date || task.dueDate,
        ...task
      };
      setTasks(prev => [newTask, ...prev]);
      return { success: true, data: newTask };
    }
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      const backendId = tasks.find(t => t.id === id)?._backendId || id;
      await apiFetch(`/tasks/${backendId}`, {
        method: 'PUT',
        body: updates
      });
    } catch (err) {
      console.error('Failed to update task on backend:', err);
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      const backendId = taskToDelete?._backendId || id;
      await apiFetch(`/tasks/${backendId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete task on backend:', err);
    }
  }, [tasks]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newState = !task.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newState } : t));

    try {
      const backendId = task._backendId || id;
      await apiFetch(`/tasks/${backendId}`, {
        method: 'PUT',
        body: { completed: newState }
      });
    } catch (err) {
      console.error('Failed to toggle task on backend:', err);
    }
  }, [tasks]);

  // Notification Actions
  const markNotificationRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      const backendId = notifications.find(n => n.id === id)?._backendId || id;
      await apiFetch(`/notifications/${backendId}/read`, {
        method: 'PUT'
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [notifications]);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await apiFetch('/notifications/read-all', {
        method: 'PUT'
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    const notifToDelete = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const backendId = notifToDelete?._backendId || id;
      await apiFetch(`/notifications/${backendId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  // Document Actions
  const uploadDocument = useCallback(async (doc) => {
    try {
      const data = await apiFetch('/documents', {
        method: 'POST',
        body: {
          name: doc.name,
          type: doc.type || 'Other',
          size: doc.size || '0 KB',
          url: doc.url || '',
        }
      });

      if (data.success && data.data) {
        const d = data.data;
        setDocuments(prev => [{
          id: d.document_id,
          name: d.name,
          type: d.type,
          size: d.size,
          url: d.url,
          date: new Date(d.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          _backendId: d.document_id,
        }, ...prev]);
      }

      return data;
    } catch (err) {
      const newDoc = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        ...doc
      };
      setDocuments(prev => [newDoc, ...prev]);
      return { success: true, data: newDoc };
    }
  }, []);

  const deleteDocument = useCallback(async (id) => {
    const docToDelete = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    try {
      const backendId = docToDelete?._backendId || id;
      await apiFetch(`/documents/${backendId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  }, [documents]);

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ courses: [], tasks: [], documents: [] });
      return;
    }

    const query = searchQuery.toLowerCase();
    setSearchResults({
      courses: courses.filter(c => c.name.toLowerCase().includes(query) || (c.code && c.code.toLowerCase().includes(query))),
      tasks: tasks.filter(t => t.title.toLowerCase().includes(query)),
      documents: documents.filter(d => d.name.toLowerCase().includes(query)),
    });
  }, [searchQuery, courses, tasks, documents]);

  const value = {
    user,
    token: 'dev-mode-token',
    isAuthenticated: true,
    authLoading: false,
    loading,
    activeRole,
    switchRole,
    isUnauthenticatedDevMode: true,
    courses,
    tasks,
    notifications,
    documents,
    searchQuery,
    setSearchQuery,
    searchResults,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    updatePreferences,
    enrollCourse,
    dropCourse,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    uploadDocument,
    deleteDocument,
    getMyGrades,
    getMyGPA,
    assignGrade,
    updateGrade,
    getStudentGrades,
    getAllEnrollments,
    adminEnrollStudent,
    adminDropEnrollment,
    fetchCourses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
