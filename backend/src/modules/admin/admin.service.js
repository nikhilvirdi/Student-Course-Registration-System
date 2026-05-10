const prisma = require('../../config/prisma');

const getAllEnrollments = async () => {
  return await prisma.enrollment.findMany({
    include: {
      student: {
        select: {
          student_id: true,
          name: true,
          email: true,
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
          semester_label: true
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
      department: student.department?.department_name || 'N/A',
      enrollments_count: student._count.enrollments,
      earned_credits: earnedCredits,
      gpa: parseFloat(gpa),
      status: student._count.enrollments > 0 ? 'Active' : 'Inactive',
      enrollments: student.enrollments // Provide details for frontend visibility
    };
  });
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

module.exports = {
  getAllEnrollments,
  getCourseStudents,
  getAllStudents,
  getAggregateStats
};
