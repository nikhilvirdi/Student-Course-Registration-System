'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_COURSES, INITIAL_TASKS, INITIAL_NOTIFICATIONS, INITIAL_DOCUMENTS, INITIAL_ACTIVITY } from '@/lib/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // --- State ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITY);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    courses: [],
    tasks: [],
    documents: [],
  });

  // --- Persistence (Local Storage) ---
  useEffect(() => {
    const savedToken = localStorage.getItem('scrs_token');
    const savedUser = localStorage.getItem('scrs_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    const savedTasks = localStorage.getItem('scrs_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedNotifications = localStorage.getItem('scrs_notifications');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    const savedDocuments = localStorage.getItem('scrs_documents');
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments));

    const savedActivities = localStorage.getItem('scrs_activities');
    if (savedActivities) setActivities(JSON.parse(savedActivities));
    
    // Fetch real courses from backend
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/courses');
        const data = await res.json();
        if (data.success && data.data) {
          let enrolledCourseIds = new Set();
          
          if (savedToken) {
            try {
              const enrolRes = await fetch('http://localhost:5000/api/enrollments/my', {
                headers: { 'Authorization': `Bearer ${savedToken}` }
              });
              const enrolData = await enrolRes.json();
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
            code: c.course_id.substring(0, 8).toUpperCase(), // fallback code
            name: c.course_name,
            instructor: c.faculty?.faculty_name || 'TBA',
            semester: 'Current', // placeholder
            progress: 0,
            color: colors[index % colors.length],
            schedule: 'TBA',
            room: 'TBA',
            status: enrolledCourseIds.has(c.course_id) ? 'Enrolled' : 'Available',
            students: c.max_seats - c.available_seats,
            credits: c.credits,
            tags: [c.department?.department_name || 'General'],
            nextClass: 'TBA',
            materials: [],
            assignments: [],
            available_seats: c.available_seats,
            max_seats: c.max_seats,
            description: c.description
          }));
          setCourses(mappedCourses);
        } else {
          // fallback to initial mock courses if api fails or returns empty
          const savedCourses = localStorage.getItem('scrs_courses');
          if (savedCourses) setCourses(JSON.parse(savedCourses));
        }
      } catch (err) {
        console.error("Failed to fetch courses, falling back to local storage:", err);
        const savedCourses = localStorage.getItem('scrs_courses');
        if (savedCourses) setCourses(JSON.parse(savedCourses));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  useEffect(() => {
    localStorage.setItem('scrs_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (user) localStorage.setItem('scrs_user', JSON.stringify(user));
    else localStorage.removeItem('scrs_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('scrs_token', token);
    else localStorage.removeItem('scrs_token');
  }, [token]);

  useEffect(() => {
    localStorage.setItem('scrs_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('scrs_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('scrs_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('scrs_activities', JSON.stringify(activities));
  }, [activities]);

  const API_BASE_URL = 'http://localhost:5000/api';

  // --- Actions ---

  // Auth Actions
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user: userData, token: jwtToken } = data.data;
      
      // Ensure we merge some mock preferences if the backend doesn't provide them yet
      const fullUser = {
        ...userData,
        avatar: userData.name.substring(0, 2).toUpperCase(),
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
      // Map frontend fields to backend fields
      const payload = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        password: userData.password,
        department_id: userData.department_id || 'default-uuid-placeholder', 
        semester: parseInt(userData.semester) || 1
      };

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

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
  }, []);

  // User Actions
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? ({ ...prev, ...updates }) : null);
  }, []);

  const updatePreferences = useCallback((updates) => {
    setUser(prev => prev ? ({
      ...prev,
      preferences: { ...prev.preferences, ...updates }
    }) : null);
  }, []);

  // Activity Actions (must be defined first — used by enrollCourse, addTask, toggleTask, uploadDocument)
  const addActivity = useCallback((activity) => {
    const newActivity = {
      id: Date.now(),
      time: 'Just now',
      ...activity
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  // Course Actions
  const enrollCourse = useCallback(async (courseId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: courseId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enroll');
      
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
  }, [token, courses, addActivity]); // addActivity is now defined above — no TDZ

  // Task Actions
  const addTask = useCallback((task) => {
    const newTask = {
      id: Date.now(),
      completed: false,
      priority: 'Medium',
      ...task
    };
    setTasks(prev => [newTask, ...prev]);
    addActivity({
      user: 'You',
      action: 'created a new task',
      target: newTask.title,
      type: 'task'
    });
  }, [addActivity]);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newState = !t.completed;
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
  }, [addActivity]);

  // Notification Actions
  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Document Actions
  const uploadDocument = useCallback((doc) => {
    const newDoc = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...doc
    };
    setDocuments(prev => [newDoc, ...prev]);
    addActivity({
      user: 'You',
      action: 'uploaded a document',
      target: newDoc.name,
      type: 'upload'
    });
  }, [addActivity]);

  const deleteDocument = useCallback((id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  // (addActivity moved above to fix TDZ — was here)

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
    updateUser,
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
