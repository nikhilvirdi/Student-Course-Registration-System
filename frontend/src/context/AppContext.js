'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/utils';

const AppContext = createContext();

export function AppProvider({ children }) {
  // --- State ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    courses: [],
    tasks: [],
    documents: [],
  });

  // --- Persistence (Local Storage for auth + activities) ---
  useEffect(() => {
    const savedToken = localStorage.getItem('scrs_token');
    const savedUser = localStorage.getItem('scrs_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    const savedActivities = localStorage.getItem('scrs_activities');
    if (savedActivities) setActivities(JSON.parse(savedActivities));
    
    // Fetch real courses from backend
    const fetchCourses = async () => {
      try {
        const data = await apiFetch('/courses');
        if (data.success && data.data) {
          let enrolledCourseIds = new Set();
          
          if (savedToken) {
            try {
              const enrolData = await apiFetch('/enrollments/my', { token: savedToken });
              if (enrolData.success && enrolData.data) {
                enrolData.data.forEach(e => enrolledCourseIds.add(e.course_id));
              }
            } catch (err) {
              console.error("Failed to fetch enrollments:", err);
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
    };
    
    fetchCourses();
  }, []);

  // Fetch tasks, notifications, documents from backend when token is available
  useEffect(() => {
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const [tasksRes, notifRes, docsRes] = await Promise.all([
          apiFetch('/tasks', { token }).catch(() => ({ success: false })),
          apiFetch('/notifications', { token }).catch(() => ({ success: false })),
          apiFetch('/documents', { token }).catch(() => ({ success: false })),
        ]);

        if (tasksRes.success && tasksRes.data) {
          setTasks(tasksRes.data.map(t => ({
            id: t.task_id,
            title: t.title,
            category: t.category,
            priority: t.priority,
            due_date: t.due_date,
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
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('scrs_user', JSON.stringify(user));
    else localStorage.removeItem('scrs_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('scrs_token', token);
    else localStorage.removeItem('scrs_token');
  }, [token]);

  useEffect(() => {
    localStorage.setItem('scrs_activities', JSON.stringify(activities));
  }, [activities]);

  const API_BASE_URL = 'http://localhost:5000/api';

  // --- Actions ---

  // Activity Actions (must be defined first — used by updateProfile, updatePassword, enrollCourse, etc.)
  const addActivity = useCallback((activity) => {
    const newActivity = {
      id: Date.now(),
      time: 'Just now',
      ...activity
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  // Auth Actions
  const login = useCallback(async (email, password) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      
      const { user: userData, token: jwtToken } = data.data;
      
      // Ensure we merge some mock preferences if the backend doesn't provide them yet
      const [firstName, ...lastNameParts] = userData.name ? userData.name.split(' ') : ['User', ''];
      const lastName = lastNameParts.join(' ');
      
      const fullUser = {
        ...userData,
        firstName,
        lastName,
        avatar: userData.name ? userData.name.substring(0, 2).toUpperCase() : 'U',
        preferences: {
          language: 'English (US)',
          notifications: { email: true, push: true, updates: true },
          privacy: { profilePublic: true, showGrades: false }
        }
      };

      setUser(fullUser);
      setToken(jwtToken);
      setIsAuthenticated(true);
      return fullUser;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      // Pass the full userData to the backend, which now handles name construction and roles
      await apiFetch('/auth/register', {
        method: 'POST',
        body: userData
      });
      
      // Automatically log in after registration
      return await login(userData.email, userData.password);
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setTasks([]);
    setNotifications([]);
    setDocuments([]);
    setActivities([]);
  }, []);

  // User Actions
  const updateProfile = useCallback(async (updates) => {
    try {
      const data = await apiFetch('/auth/profile', {
        method: 'PATCH',
        token,
        body: updates
      });
      
      setUser(prev => prev ? ({ ...prev, ...data.data }) : null);
      addActivity({
        user: 'You',
        action: 'updated your profile',
        target: 'Settings',
        type: 'system'
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [token, addActivity]);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const data = await apiFetch('/auth/password', {
        method: 'PATCH',
        token,
        body: { currentPassword, newPassword }
      });
      
      addActivity({
        user: 'You',
        action: 'changed your password',
        target: 'Security',
        type: 'security'
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [token, addActivity]);

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
        token,
        body: { course_id: courseId }
      });
      
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Enrolled' } : c));
      
      addActivity({
        user: 'You',
        action: 'enrolled in a course',
        target: courses.find(c => c.id === courseId)?.name || 'Course',
        type: 'course'
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [token, courses, addActivity]);

  // Grade Actions
  const getMyGrades = useCallback(async () => {
    try {
      const data = await apiFetch('/grades/my', { token });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [token]);

  const getMyGPA = useCallback(async () => {
    try {
      const data = await apiFetch('/grades/gpa', { token });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [token]);

  const assignGrade = useCallback(async (enrollment_id, marks) => {
    try {
      const data = await apiFetch('/grades', {
        method: 'POST',
        token,
        body: { enrollment_id, marks }
      });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [token]);
  
  const getStudentGrades = useCallback(async (student_id) => {
    try {
      const data = await apiFetch(`/grades/student/${student_id}`, { token });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [token]);

  // Enrollment Admin Actions
  const getAllEnrollments = useCallback(async () => {
    try {
      const data = await apiFetch('/enrollments/all', { token });
      return data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  }, [token]);

  // =====================================
  // Task Actions — NOW BACKED BY REAL API
  // =====================================
  const addTask = useCallback(async (task) => {
    try {
      const data = await apiFetch('/tasks', {
        method: 'POST',
        token,
        body: {
          title: task.title,
          category: task.category || 'Other',
          priority: task.priority || 'Medium',
          due_date: task.due_date || null,
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
          completed: t.completed,
          _backendId: t.task_id,
        }, ...prev]);
      }

      addActivity({
        user: 'You',
        action: 'created a new task',
        target: task.title,
        type: 'task'
      });
      return data;
    } catch (err) {
      // Fallback to local if backend fails
      const newTask = {
        id: Date.now(),
        completed: false,
        priority: 'Medium',
        ...task
      };
      setTasks(prev => [newTask, ...prev]);
      throw err;
    }
  }, [token, addActivity]);

  const updateTask = useCallback(async (id, updates) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      const backendId = tasks.find(t => t.id === id)?._backendId || id;
      await apiFetch(`/tasks/${backendId}`, {
        method: 'PUT',
        token,
        body: updates
      });
    } catch (err) {
      console.error('Failed to update task on backend:', err);
    }
  }, [token, tasks]);

  const deleteTask = useCallback(async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      const backendId = taskToDelete?._backendId || id;
      await apiFetch(`/tasks/${backendId}`, {
        method: 'DELETE',
        token
      });
    } catch (err) {
      console.error('Failed to delete task on backend:', err);
    }
  }, [token, tasks]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newState = !task.completed;
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (newState) {
          addActivity({
            user: 'You',
            action: 'completed the task',
            target: t.title,
            type: 'task'
          });
        }
        return { ...t, completed: newState };
      }
      return t;
    }));

    try {
      const backendId = task._backendId || id;
      await apiFetch(`/tasks/${backendId}`, {
        method: 'PUT',
        token,
        body: { completed: newState }
      });
    } catch (err) {
      console.error('Failed to toggle task on backend:', err);
    }
  }, [token, tasks, addActivity]);

  // =============================================
  // Notification Actions — NOW BACKED BY REAL API
  // =============================================
  const markNotificationRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      const backendId = notifications.find(n => n.id === id)?._backendId || id;
      await apiFetch(`/notifications/${backendId}/read`, {
        method: 'PUT',
        token
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [token, notifications]);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await apiFetch('/notifications/read-all', {
        method: 'PUT',
        token
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [token]);

  const deleteNotification = useCallback(async (id) => {
    const notifToDelete = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const backendId = notifToDelete?._backendId || id;
      await apiFetch(`/notifications/${backendId}`, {
        method: 'DELETE',
        token
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [token, notifications]);

  // ==========================================
  // Document Actions — NOW BACKED BY REAL API
  // ==========================================
  const uploadDocument = useCallback(async (doc) => {
    try {
      const data = await apiFetch('/documents', {
        method: 'POST',
        token,
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

      addActivity({
        user: 'You',
        action: 'uploaded a document',
        target: doc.name,
        type: 'upload'
      });
      return data;
    } catch (err) {
      // Fallback to local
      const newDoc = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        ...doc
      };
      setDocuments(prev => [newDoc, ...prev]);
      throw err;
    }
  }, [token, addActivity]);

  const deleteDocument = useCallback(async (id) => {
    const docToDelete = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    try {
      const backendId = docToDelete?._backendId || id;
      await apiFetch(`/documents/${backendId}`, {
        method: 'DELETE',
        token
      });
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  }, [token, documents]);

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
    token,
    isAuthenticated,
    loading,
    courses,
    tasks,
    notifications,
    documents,
    activities,
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
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    uploadDocument,
    deleteDocument,
    addActivity,
    getMyGrades,
    getMyGPA,
    assignGrade,
    getStudentGrades,
    getAllEnrollments,
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
