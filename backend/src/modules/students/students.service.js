const prisma = require('../../config/prisma');

const getStudentProfile = async (id) => {
  const profile = await prisma.student.findUnique({
    where: { student_id: id },
    include: {
      department: true
    }
  });
  if (!profile) throw new Error('Student not found');
  return profile;
};

const getStudentDashboard = async (id) => {
  // 1. Get enrollments for the student
  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: id },
    include: {
      course: true
    }
  });

  // 2. Calculate Stats
  const totalCourses = enrollments.length;
  const totalCredits = enrollments.reduce((acc, curr) => acc + curr.course.credits, 0);

  // 3. Get recent enrollments (top 5)
  const recentEnrollments = await prisma.enrollment.findMany({
    where: { student_id: id },
    include: { course: true },
    orderBy: { enrollment_date: 'desc' },
    take: 5
  });

  return {
    totalCourses,
    totalCredits,
    recentEnrollments
  };
};

module.exports = {
  getStudentProfile,
  getStudentDashboard
};
