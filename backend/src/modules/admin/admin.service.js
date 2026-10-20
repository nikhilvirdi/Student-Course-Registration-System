const prisma = require('../../config/prisma');

const getAllEnrollments = async (query = {}) => {
  const { studentId, courseId, status, semester, search } = query;
  const where = {};

  if (studentId) where.student_id = studentId;
  if (courseId) where.course_id = courseId;
  if (status && status !== 'ALL') where.status = status;
  if (semester && semester !== 'ALL') {
    where.course = { semester_label: semester };
  }
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { student: { name: { contains: q, mode: 'insensitive' } } },
      { student: { email: { contains: q, mode: 'insensitive' } } },
      { course: { course_name: { contains: q, mode: 'insensitive' } } },
      { course: { course_code: { contains: q, mode: 'insensitive' } } },
    ];
  }

  return await prisma.enrollment.findMany({
    where,
    include: {
      student: {
        select: {
          student_id: true,
          name: true,
          email: true,
          semester: true,
          department: {
            select: { department_name: true }
          }
        }
      },
      course: {
        select: {
          course_id: true,
          course_code: true,
          course_name: true,
          semester_label: true,
          credits: true,
          available_seats: true,
          max_seats: true,
        }
      },
      grade: true
    },
    orderBy: {
      enrollment_date: 'desc'
    }
  });
};

const getCourseStudents = async (courseId) => {
  return await prisma.enrollment.findMany({
    where: { course_id: courseId },
    include: {
      student: {
        select: {
          student_id: true,
          name: true,
          email: true,
          semester: true,
          department: {
            select: { department_name: true }
          }
        }
      },
      grade: true
    }
  });
};

const getAllStudents = async () => {
  const students = await prisma.student.findMany({
    select: {
      student_id: true,
      name: true,
      email: true,
      semester: true,
      department_id: true,
      department: {
        select: { department_name: true }
      },
      enrollments: {
        include: {
          course: {
            select: { credits: true, course_name: true, course_code: true }
          },
          grade: true
        }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return students.map(student => {
    let totalCredits = 0;
    let earnedCredits = 0;
    let totalPoints = 0;

    student.enrollments.forEach(enrol => {
      if (enrol.grade) {
        totalCredits += enrol.course.credits;
        totalPoints += enrol.grade.grade_points * enrol.course.credits;
        if (enrol.grade.grade_points > 0) {
          earnedCredits += enrol.course.credits;
        }
      }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    return {
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      semester: student.semester,
      department_id: student.department_id,
      department: student.department?.department_name || 'N/A',
      enrollments_count: student._count.enrollments,
      earned_credits: earnedCredits,
      gpa: parseFloat(gpa),
      status: student._count.enrollments > 0 ? 'Active' : 'Inactive',
      enrollments: student.enrollments // Provide details for frontend visibility
    };
  });
};

const getStudentDetail = async (studentId) => {
  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
    include: {
      department: true,
      enrollments: {
        include: {
          course: {
            select: { 
              course_id: true, course_name: true, course_code: true, 
              credits: true, semester_label: true 
            }
          },
          grade: true
        },
        orderBy: { enrollment_date: 'desc' }
      },
      documents: {
        orderBy: { uploaded_at: 'desc' }
      },
      tasks: {
        orderBy: { created_at: 'desc' },
        take: 10
      },
      _count: {
        select: { enrollments: true, documents: true, tasks: true }
      }
    }
  });

  if (!student) throw new Error('Student not found');

  // Calculate GPA
  let totalCredits = 0;
  let totalPoints = 0;
  student.enrollments.forEach(e => {
    if (e.grade) {
      totalCredits += e.course.credits;
      totalPoints += e.grade.grade_points * e.course.credits;
    }
  });
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  return {
    ...student,
    gpa: parseFloat(gpa),
    total_credits: totalCredits,
  };
};

const getAggregateStats = async () => {
  const [totalStudents, totalCourses, totalDepartments, enrollmentsCount] = await Promise.all([
    prisma.student.count(),
    prisma.course.count(),
    prisma.department.count(),
    prisma.enrollment.count()
  ]);

  return {
    totalStudents,
    totalCourses,
    totalDepartments,
    enrollmentsCount
  };
};

const getAnalytics = async () => {
  const [totalStudents, totalCourses, activeEnrollments, completedEnrollments, droppedEnrollments] = await Promise.all([
    prisma.student.count(),
    prisma.course.count(),
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
    prisma.enrollment.count({ where: { status: 'DROPPED' } }),
  ]);

  // Compute average GPA across all students with grades
  const allGrades = await prisma.grade.findMany({
    include: {
      enrollment: {
        include: { course: { select: { credits: true } } }
      }
    }
  });

  let totalCredits = 0;
  let totalPoints = 0;
  allGrades.forEach(g => {
    const credits = g.enrollment.course.credits;
    totalCredits += credits;
    totalPoints += g.grade_points * credits;
  });
  const avgGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  // Course occupancy
  const courses = await prisma.course.findMany({
    select: {
      course_id: true,
      course_name: true,
      course_code: true,
      max_seats: true,
      available_seats: true,
    }
  });

  const courseOccupancy = courses.map(c => ({
    ...c,
    enrolled: c.max_seats - c.available_seats,
    occupancyPercent: c.max_seats > 0 ? Math.round(((c.max_seats - c.available_seats) / c.max_seats) * 100) : 0,
  }));

  // Recent enrollments
  const recentEnrollments = await prisma.enrollment.findMany({
    take: 10,
    orderBy: { enrollment_date: 'desc' },
    include: {
      student: { select: { name: true } },
      course: { select: { course_name: true, course_code: true } }
    }
  });

  return {
    totalStudents,
    totalCourses,
    activeEnrollments,
    completedEnrollments,
    droppedEnrollments,
    avgGPA: parseFloat(avgGPA),
    courseOccupancy,
    recentEnrollments,
  };
};

const adminEnrollStudent = async (studentId, courseId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check course exists and has seats
    const course = await tx.course.findUnique({ 
      where: { course_id: courseId },
      include: { prerequisites: true }
    });
    if (!course) throw new Error('Course not found');
    if (course.available_seats <= 0) throw new Error('No seats available in this course');

    // 2. Check student exists
    const student = await tx.student.findUnique({ where: { student_id: studentId } });
    if (!student) throw new Error('Student not found');

    // 2b. Check prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
      const prereqIds = course.prerequisites.map(p => p.prerequisite_course_id);
      const met = await tx.enrollment.findMany({
        where: {
          student_id: studentId,
          course_id: { in: prereqIds },
          status: { in: ['ACTIVE', 'COMPLETED'] }
        }
      });
      if (met.length < prereqIds.length) {
        throw new Error('Student has not completed the prerequisite courses for this class');
      }
    }

    // 3. Check for duplicate enrollment
    const existing = await tx.enrollment.findUnique({
      where: {
        student_id_course_id: { student_id: studentId, course_id: courseId }
      }
    });

    if (existing) {
      if (existing.status === 'DROPPED') {
        const reactivated = await tx.enrollment.update({
          where: { enrollment_id: existing.enrollment_id },
          data: { status: 'ACTIVE' },
          include: { student: true, course: true }
        });
        await tx.course.update({
          where: { course_id: courseId },
          data: { available_seats: { decrement: 1 } }
        });
        return reactivated;
      }
      throw new Error('Student is already enrolled in this course');
    }

    // 4. Create enrollment
    const enrollment = await tx.enrollment.create({
      data: { student_id: studentId, course_id: courseId },
      include: { student: true, course: true }
    });

    // 5. Decrement seats
    await tx.course.update({
      where: { course_id: courseId },
      data: { available_seats: { decrement: 1 } }
    });

    return enrollment;
  });
};

const adminDropEnrollment = async (enrollmentId) => {
  return await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findUnique({
      where: { enrollment_id: enrollmentId }
    });
    if (!enrollment) throw new Error('Enrollment not found');
    if (enrollment.status === 'COMPLETED') {
      throw new Error('Cannot remove a completed course with an assigned grade. Reset the grade first.');
    }

    // Delete any existing grade if present
    await tx.grade.deleteMany({ where: { enrollment_id: enrollmentId } });

    // Delete enrollment
    await tx.enrollment.delete({ where: { enrollment_id: enrollmentId } });

    // Increment seats only if it was ACTIVE (if it was already DROPPED, seat was already released)
    if (enrollment.status === 'ACTIVE') {
      await tx.course.update({
        where: { course_id: enrollment.course_id },
        data: { available_seats: { increment: 1 } }
      });
    }

    return { message: 'Enrollment removed successfully' };
  });
};

const adminUpdateEnrollmentStatus = async (enrollmentId, newStatus) => {
  const allowed = ['ACTIVE', 'COMPLETED', 'DROPPED'];
  if (!allowed.includes(newStatus)) {
    throw new Error('Invalid status. Allowed values: ACTIVE, COMPLETED, DROPPED');
  }

  return await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findUnique({
      where: { enrollment_id: enrollmentId },
      include: { course: true, grade: true }
    });

    if (!enrollment) throw new Error('Enrollment not found');
    if (enrollment.status === newStatus) return enrollment;

    if (enrollment.status === 'COMPLETED' && newStatus !== 'COMPLETED') {
      throw new Error('Cannot change status of a completed course with an assigned grade. Reset the grade first.');
    }

    if (newStatus === 'COMPLETED' && !enrollment.grade) {
      throw new Error('Cannot set status to COMPLETED without an assigned grade. Use the Grades tab to assign marks.');
    }

    // Seat adjustments:
    // If moving from ACTIVE to DROPPED: seat is freed (+1 available_seats)
    if (enrollment.status === 'ACTIVE' && newStatus === 'DROPPED') {
      await tx.course.update({
        where: { course_id: enrollment.course_id },
        data: { available_seats: { increment: 1 } }
      });
    }

    // If moving from DROPPED to ACTIVE: seat is occupied (-1 available_seats)
    if (enrollment.status === 'DROPPED' && newStatus === 'ACTIVE') {
      if (enrollment.course.available_seats <= 0) {
        throw new Error('Cannot activate enrollment: No available seats left in this course');
      }
      await tx.course.update({
        where: { course_id: enrollment.course_id },
        data: { available_seats: { decrement: 1 } }
      });
    }

    const updated = await tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { status: newStatus },
      include: {
        student: {
          select: {
            student_id: true,
            name: true,
            email: true,
            semester: true,
            department: { select: { department_name: true } }
          }
        },
        course: {
          select: {
            course_id: true,
            course_code: true,
            course_name: true,
            semester_label: true,
            credits: true,
            available_seats: true,
            max_seats: true,
          }
        },
        grade: true
      }
    });

    return updated;
  });
};

const getAllDocuments = async () => {
  return await prisma.document.findMany({
    include: {
      student: {
        select: { student_id: true, name: true, email: true }
      }
    },
    orderBy: { uploaded_at: 'desc' }
  });
};

const getAllNotifications = async () => {
  return await prisma.notification.findMany({
    include: {
      student: {
        select: { student_id: true, name: true, email: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
};

const broadcastAnnouncement = async (data) => {
  const { title, message, type = 'info', department_id } = data;
  if (!title || !message) throw new Error('Title and message are required');

  let students;
  if (department_id) {
    students = await prisma.student.findMany({
      where: { department_id },
      select: { student_id: true }
    });
  } else {
    students = await prisma.student.findMany({
      select: { student_id: true }
    });
  }

  if (students.length === 0) {
    throw new Error('No students found to receive announcement');
  }

  await prisma.notification.createMany({
    data: students.map(s => ({
      title,
      message,
      type,
      read: false,
      student_id: s.student_id
    }))
  });

  return { message: `Announcement sent to ${students.length} student(s)` };
};

const deleteAdminNotification = async (id) => {
  const notif = await prisma.notification.findUnique({ where: { notification_id: id } });
  if (!notif) throw new Error('Notification not found');
  return await prisma.notification.delete({
    where: { notification_id: id }
  });
};

const createStudent = async (data) => {
  const bcrypt = require('bcryptjs');
  const { name, email, password, semester, department_id } = data;
  if (!name || !email || !department_id) {
    throw new Error('Name, email, and department are required');
  }

  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) {
    throw new Error('A student with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password || 'student123', 10);

  return await prisma.student.create({
    data: {
      name,
      email,
      password: hashedPassword,
      semester: parseInt(semester) || 1,
      department_id,
    },
    include: {
      department: true,
    }
  });
};

const updateStudent = async (id, data) => {
  const { name, email, semester, department_id } = data;
  const existing = await prisma.student.findUnique({ where: { student_id: id } });
  if (!existing) throw new Error('Student not found');

  if (email && email !== existing.email) {
    const conflict = await prisma.student.findFirst({
      where: { email, NOT: { student_id: id } }
    });
    if (conflict) throw new Error('A student with this email already exists');
  }

  return await prisma.student.update({
    where: { student_id: id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(semester !== undefined && { semester: parseInt(semester) }),
      ...(department_id && { department_id }),
    },
    include: {
      department: true,
    }
  });
};

const deleteStudent = async (id) => {
  const existing = await prisma.student.findUnique({ where: { student_id: id } });
  if (!existing) throw new Error('Student not found');

  return await prisma.$transaction(async (tx) => {
    const enrollments = await tx.enrollment.findMany({ where: { student_id: id } });
    const enrollmentIds = enrollments.map(e => e.enrollment_id);

    if (enrollmentIds.length > 0) {
      await tx.grade.deleteMany({ where: { enrollment_id: { in: enrollmentIds } } });
    }

    for (const enr of enrollments) {
      if (enr.status === 'ACTIVE') {
        await tx.course.update({
          where: { course_id: enr.course_id },
          data: { available_seats: { increment: 1 } }
        });
      }
    }

    await tx.enrollment.deleteMany({ where: { student_id: id } });
    await tx.task.deleteMany({ where: { student_id: id } });
    await tx.notification.deleteMany({ where: { student_id: id } });
    await tx.document.deleteMany({ where: { student_id: id } });
    await tx.student.delete({ where: { student_id: id } });

    return { message: 'Student and related records deleted successfully' };
  });
};

// ---------------------------------------------------------------------------
// Admin & System Settings Methods
// ---------------------------------------------------------------------------
const path = require('path');
const fs = require('fs');

const SETTINGS_FILE = path.join(__dirname, '../../../data/system_settings.json');

const DEFAULT_SETTINGS = {
  academic: {
    term: 'Spring 2026',
    registrationOpen: true,
    defaultCourseSeats: 50,
    maxCreditsPerStudent: 24,
    minPassingMarks: 40,
  },
  notifications: {
    emailNewEnrollments: true,
    alertLowSeats: true,
    autoNotifyGrades: true,
    dailyDigest: false,
  },
  display: {
    showStudentAvatars: true,
    compactTableRows: false,
    showRealtimeClock: true,
  }
};

function readSettingsFile() {
  try {
    const dataDir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read settings file, returning defaults:', err);
    return DEFAULT_SETTINGS;
  }
}

function writeSettingsFile(settings) {
  try {
    const dataDir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error('Failed to write settings file:', err);
  }
}

const getAdminSettings = async (adminId) => {
  // 1. Fetch Admin from Postgres via Prisma
  const admin = await prisma.admin.findUnique({
    where: { admin_id: adminId },
    select: {
      admin_id: true,
      name: true,
      email: true,
      created_at: true,
      updated_at: true,
    }
  });

  if (!admin) {
    throw new Error('Admin not found');
  }

  // 2. Fetch live system metadata from Prisma
  const [totalCourses, totalDepartments, totalStudents, totalAuditLogs] = await Promise.all([
    prisma.course.count(),
    prisma.department.count(),
    prisma.student.count(),
    prisma.auditLog.count(),
  ]);

  // 3. Load saved settings file
  const persistentSettings = readSettingsFile();

  return {
    profile: {
      ...admin,
      role: 'ADMIN',
    },
    academic: persistentSettings.academic || DEFAULT_SETTINGS.academic,
    notifications: persistentSettings.notifications || DEFAULT_SETTINGS.notifications,
    display: persistentSettings.display || DEFAULT_SETTINGS.display,
    systemMeta: {
      databaseEngine: 'PostgreSQL 16 via Prisma ORM',
      connectionStatus: 'Connected',
      totalCourses,
      totalDepartments,
      totalStudents,
      totalAuditLogs,
    }
  };
};

const updateAdminSettings = async (adminId, data) => {
  const { profile, academic, notifications, display } = data;

  // 1. Update Admin in PostgreSQL if name or email provided
  let updatedAdmin = null;
  if (profile?.name || profile?.email) {
    if (profile.email) {
      const conflict = await prisma.admin.findFirst({
        where: { email: profile.email.trim(), NOT: { admin_id: adminId } }
      });
      if (conflict) throw new Error('A user with this email already exists');
    }

    updatedAdmin = await prisma.admin.update({
      where: { admin_id: adminId },
      data: {
        ...(profile.name && { name: profile.name.trim() }),
        ...(profile.email && { email: profile.email.trim() }),
      },
      select: {
        admin_id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
      }
    });
  }

  // 2. Update persistent system settings
  const current = readSettingsFile();
  const newSettings = {
    academic: {
      ...current.academic,
      ...(academic && {
        ...(academic.term && { term: academic.term.trim() }),
        ...(academic.registrationOpen !== undefined && { registrationOpen: Boolean(academic.registrationOpen) }),
        ...(academic.defaultCourseSeats !== undefined && { defaultCourseSeats: parseInt(academic.defaultCourseSeats) }),
        ...(academic.maxCreditsPerStudent !== undefined && { maxCreditsPerStudent: parseInt(academic.maxCreditsPerStudent) }),
        ...(academic.minPassingMarks !== undefined && { minPassingMarks: parseFloat(academic.minPassingMarks) }),
      })
    },
    notifications: {
      ...current.notifications,
      ...(notifications && {
        ...(notifications.emailNewEnrollments !== undefined && { emailNewEnrollments: Boolean(notifications.emailNewEnrollments) }),
        ...(notifications.alertLowSeats !== undefined && { alertLowSeats: Boolean(notifications.alertLowSeats) }),
        ...(notifications.autoNotifyGrades !== undefined && { autoNotifyGrades: Boolean(notifications.autoNotifyGrades) }),
        ...(notifications.dailyDigest !== undefined && { dailyDigest: Boolean(notifications.dailyDigest) }),
      })
    },
    display: {
      ...current.display,
      ...(display && {
        ...(display.showStudentAvatars !== undefined && { showStudentAvatars: Boolean(display.showStudentAvatars) }),
        ...(display.compactTableRows !== undefined && { compactTableRows: Boolean(display.compactTableRows) }),
        ...(display.showRealtimeClock !== undefined && { showRealtimeClock: Boolean(display.showRealtimeClock) }),
      })
    }
  };

  writeSettingsFile(newSettings);

  return {
    profile: updatedAdmin || await prisma.admin.findUnique({
      where: { admin_id: adminId },
      select: { admin_id: true, name: true, email: true, created_at: true, updated_at: true }
    }),
    academic: newSettings.academic,
    notifications: newSettings.notifications,
    display: newSettings.display,
  };
};

const resetAdminSettings = async (adminId) => {
  writeSettingsFile(DEFAULT_SETTINGS);
  return await getAdminSettings(adminId);
};

module.exports = {
  getAllEnrollments,
  getCourseStudents,
  getAllStudents,
  getStudentDetail,
  getAggregateStats,
  getAnalytics,
  adminEnrollStudent,
  adminDropEnrollment,
  adminUpdateEnrollmentStatus,
  getAllDocuments,
  getAllNotifications,
  createStudent,
  updateStudent,
  deleteStudent,
  broadcastAnnouncement,
  deleteAdminNotification,
  getAdminSettings,
  updateAdminSettings,
  resetAdminSettings,
};
