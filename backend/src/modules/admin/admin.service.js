const prisma = require('../../config/prisma');

const getAllEnrollments = async () => {
  return await prisma.enrollment.findMany({
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
    const course = await tx.course.findUnique({ where: { course_id: courseId } });
    if (!course) throw new Error('Course not found');
    if (course.available_seats <= 0) throw new Error('No seats available in this course');

    // 2. Check student exists
    const student = await tx.student.findUnique({ where: { student_id: studentId } });
    if (!student) throw new Error('Student not found');

    // 3. Check for duplicate enrollment
    const existing = await tx.enrollment.findUnique({
      where: {
        student_id_course_id: { student_id: studentId, course_id: courseId }
      }
    });
    if (existing) throw new Error('Student is already enrolled in this course');

    // 4. Create enrollment
    const enrollment = await tx.enrollment.create({
      data: { student_id: studentId, course_id: courseId }
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
      throw new Error('Cannot de-enroll a completed course with an assigned grade');
    }

    // Delete any existing grade if somehow present
    await tx.grade.deleteMany({ where: { enrollment_id: enrollmentId } });

    // Delete enrollment
    await tx.enrollment.delete({ where: { enrollment_id: enrollmentId } });

    // Increment seats
    await tx.course.update({
      where: { course_id: enrollment.course_id },
      data: { available_seats: { increment: 1 } }
    });

    return { message: 'Enrollment removed successfully' };
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

module.exports = {
  getAllEnrollments,
  getCourseStudents,
  getAllStudents,
  getStudentDetail,
  getAggregateStats,
  getAnalytics,
  adminEnrollStudent,
  adminDropEnrollment,
  getAllDocuments,
  getAllNotifications,
  createStudent,
  updateStudent,
  deleteStudent,
  broadcastAnnouncement,
  deleteAdminNotification,
};
