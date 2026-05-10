export const INITIAL_COURSES = [
  {
    id: 'CS301',
    code: 'CS301',
    name: 'Advanced Algorithms',
    instructor: 'Dr. Sarah Johnson',
    semester: 'Spring 2024',
    progress: 75,
    color: '#00D1FF',
    schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
    room: 'Hall A',
    status: 'Enrolled',
    students: 120,
    credits: 4,
    tags: ['Core', 'Theory'],
    nextClass: 'Mon, 10:00 AM',
    materials: [
      { id: 1, title: 'Lecture 1: Introduction', type: 'PDF', date: '2024-01-15' },
      { id: 2, title: 'Week 2: Graph Theory', type: 'Slides', date: '2024-01-22' },
    ],
    assignments: [
      { id: 1, title: 'Dynamic Programming Set', dueDate: '2024-03-25', status: 'Pending' },
      { id: 2, title: 'Graph Algorithms Implementation', dueDate: '2024-04-10', status: 'Pending' },
    ]
  },
  {
    id: 'CS402',
    code: 'CS402',
    name: 'Database Management',
    instructor: 'Prof. Michael Chen',
    semester: 'Spring 2024',
    progress: 45,
    color: '#3B82F6',
    schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
    room: 'Lab 3',
    status: 'Enrolled',
    students: 85,
    credits: 3,
    tags: ['Core', 'Theory'],
    nextClass: 'Tue, 2:00 PM',
    materials: [
      { id: 1, title: 'SQL Fundamentals', type: 'PDF', date: '2024-01-16' },
    ],
    assignments: [
      { id: 1, title: 'Normalization Exercise', dueDate: '2024-03-28', status: 'Pending' },
    ]
  },
  {
    id: 'EE101',
    code: 'EE101',
    name: 'Digital Logic Design',
    instructor: 'Dr. James Wilson',
    semester: 'Spring 2024',
    progress: 90,
    color: '#10B981',
    schedule: 'Fri 9:00 AM - 12:00 PM',
    room: 'Workshop 1',
    status: 'Enrolled',
    students: 110,
    credits: 3,
    tags: ['Hardware', 'Core'],
    nextClass: 'Fri, 9:00 AM',
    materials: [],
    assignments: []
  },
  {
    id: 'MTH201',
    code: 'MTH201',
    name: 'Discrete Mathematics',
    instructor: 'Dr. Emily White',
    semester: 'Spring 2024',
    progress: 0,
    color: '#8B5CF6',
    schedule: 'Wed 11:00 AM - 12:30 PM',
    room: 'Hall B',
    status: 'Waitlisted',
    students: 150,
    credits: 3,
    tags: ['Math', 'Required'],
    nextClass: 'Wed, 11:00 AM',
    materials: [],
    assignments: []
  }
];

export const INITIAL_TASKS = [
  { id: 1, title: 'Midterm Report Submission', category: 'Project', dueDate: 'Today', priority: 'High', completed: false },
  { id: 2, title: 'Register for Next Semester', category: 'Admin', dueDate: 'Tomorrow', priority: 'Medium', completed: false },
  { id: 3, title: 'Algorithm Quiz Prep', category: 'Study', dueDate: 'Mar 24', priority: 'High', completed: false },
  { id: 4, title: 'Database Normalization HW', category: 'Assignment', dueDate: 'Mar 28', priority: 'Medium', completed: true },
  { id: 5, title: 'Review Group Presentation', category: 'Collaboration', dueDate: 'Mar 30', priority: 'Low', completed: false },
];

export const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Assignment Graded', message: 'CS301 Midterm evaluation is now available.', time: '10 mins ago', type: 'grade', read: false },
  { id: 2, title: 'New Course Material', message: 'Dr. Smith uploaded Lecture 5 slides.', time: '2 hours ago', type: 'material', read: false },
  { id: 3, title: 'System Maintenance', message: 'The dashboard will be offline for 2 hours tonight.', time: '5 hours ago', type: 'system', read: true },
  { id: 4, title: 'Meeting Reminder', message: 'Project discussion at 4 PM in Library.', time: 'Yesterday', type: 'reminder', read: true },
];

export const INITIAL_DOCUMENTS = [
  { id: 1, name: 'Algorithm_Notes.pdf', type: 'pdf', size: '2.4 MB', date: 'Mar 15, 2024', modified: 'Mar 15, 2024', category: 'CS301' },
  { id: 2, name: 'Database_Schema.sql', type: 'code', size: '156 KB', date: 'Mar 14, 2024', modified: 'Mar 14, 2024', category: 'CS402' },
  { id: 3, name: 'Midterm_Revision.docx', type: 'doc', size: '1.1 MB', date: 'Mar 12, 2024', modified: 'Mar 12, 2024', category: 'General' },
  { id: 4, name: 'Lab_Report_03.pdf', type: 'pdf', size: '3.8 MB', date: 'Mar 10, 2024', modified: 'Mar 10, 2024', category: 'EE101' },
];

export const INITIAL_ACTIVITY = [
  { id: 1, user: 'Dr. Sarah Johnson', action: 'posted a new announcement', target: 'Advanced Algorithms', time: '10 mins ago', type: 'announcement' },
  { id: 2, user: 'Prof. Michael Chen', action: 'updated the assignment deadline', target: 'Database Management', time: '1 hour ago', type: 'update' },
  { id: 3, user: 'System', action: 'successfully uploaded', target: 'Algorithm_Notes.pdf', time: '3 hours ago', type: 'upload' },
  { id: 4, user: 'You', action: 'completed the task', target: 'Database Normalization HW', time: 'Yesterday', type: 'task' },
];
