const prisma = require('../../config/prisma');

const getStudentEnrollments = async (studentId) => {
  return await prisma.enrollment.findMany({
    where: { student_id: studentId },
    include: {
      course: {
        include: {
          faculty: true,
          department: true
        }
      }
    }
  });
};

const registerForCourse = async (studentId, courseId) => {
  // Use Prisma Transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // 1. Check if course exists and has seats
    const course = await tx.course.findUnique({
      where: { course_id: courseId },
      include: { prerequisites: true }
    });

    if (!course) throw new Error('Course not found');
    if (course.available_seats <= 0) throw new Error('No seats available in this course');

    // 2. Prerequisite Check
    if (course.prerequisites.length > 0) {
      const prerequisiteIds = course.prerequisites.map(p => p.prerequisite_course_id);
      
      const metPrerequisites = await tx.enrollment.findMany({
        where: {
          student_id: studentId,
          course_id: { in: prerequisiteIds }
        }
      });

      if (metPrerequisites.length < prerequisiteIds.length) {
        throw new Error('Prerequisite requirements not met for this course');
      }
    }

    // 3. Check if already enrolled (Duplicate check)
    const existingEnrollment = await tx.enrollment.findUnique({
      where: {
        student_id_course_id: {
          student_id: studentId,
          course_id: courseId
        }
      }
    });

    if (existingEnrollment) throw new Error('You are already registered for this course');

    // 4. Create Enrollment
    const enrollment = await tx.enrollment.create({
      data: {
        student_id: studentId,
        course_id: courseId
      }
    });

    // 5. Update Course Seats
    await tx.course.update({
      where: { course_id: courseId },
      data: { available_seats: { decrement: 1 } }
    });

    return enrollment;
  });
};


const dropCourse = async (studentId, courseId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if enrollment exists
    const enrollment = await tx.enrollment.findUnique({
      where: {
        student_id_course_id: {
          student_id: studentId,
          course_id: courseId
        }
      }
    });

    if (!enrollment) throw new Error('Enrollment not found');

    // 2. Delete Enrollment
    await tx.enrollment.delete({
      where: {
        student_id_course_id: {
          student_id: studentId,
          course_id: courseId
        }
      }
    });

    // 3. Increment Course Seats
    await tx.course.update({
      where: { course_id: courseId },
      data: { available_seats: { increment: 1 } }
    });

    return { message: 'Course dropped successfully' };
  });
};

module.exports = {
  getStudentEnrollments,
  registerForCourse,
  dropCourse
};
