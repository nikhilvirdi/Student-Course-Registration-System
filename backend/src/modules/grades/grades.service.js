const prisma = require('../../config/prisma');

const getAllGrades = async () => {
  return await prisma.grade.findMany({
    include: {
      enrollment: {
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
              credits: true,
              semester_label: true
            }
          }
        }
      }
    },
    orderBy: {
      graded_at: 'desc'
    }
  });
};

const assignGrade = async (data) => {
  let enrollment_id = data.enrollment_id;

  // Support lookup by student_id and course_id
  if (!enrollment_id && data.student_id && data.course_id) {
    const enr = await prisma.enrollment.findUnique({
      where: {
        student_id_course_id: { student_id: data.student_id, course_id: data.course_id }
      }
    });
    if (!enr) {
      throw new Error('Student is not enrolled in this course');
    }
    enrollment_id = enr.enrollment_id;
  }

  if (!enrollment_id) {
    throw new Error('Enrollment ID or both Student ID and Course ID are required');
  }

  // Ensure enrollment exists
  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id },
    include: { grade: true }
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  if (enrollment.status === 'DROPPED') {
    throw new Error('Cannot assign a grade to a dropped enrollment');
  }

  // Validate marks and compute 10-Point CGPA Architecture
  const { grade_letter, grade_points } = computeGrade(data.marks_obtained);

  // If grade already exists for this enrollment, update it safely (prevents duplicate key error)
  if (enrollment.grade) {
    return await prisma.grade.update({
      where: { grade_id: enrollment.grade.grade_id },
      data: {
        marks_obtained: parseFloat(data.marks_obtained),
        grade_letter,
        grade_points,
      }
    });
  }

  // Atomically create grade and update enrollment status to COMPLETED
  return await prisma.$transaction(async (tx) => {
    const grade = await tx.grade.create({
      data: {
        enrollment_id,
        marks_obtained: parseFloat(data.marks_obtained),
        grade_letter,
        grade_points,
      }
    });

    await tx.enrollment.update({
      where: { enrollment_id },
      data: { status: 'COMPLETED' }
    });

    return grade;
  });
};

const updateGrade = async (gradeId, marks_obtained) => {
  const existingGrade = await prisma.grade.findUnique({
    where: { grade_id: gradeId }
  });

  if (!existingGrade) {
    throw new Error('Grade not found');
  }

  const { grade_letter, grade_points } = computeGrade(marks_obtained);

  return await prisma.grade.update({
    where: { grade_id: gradeId },
    data: {
      marks_obtained: parseFloat(marks_obtained),
      grade_letter,
      grade_points,
    }
  });
};

const deleteGrade = async (gradeId) => {
  const existingGrade = await prisma.grade.findUnique({
    where: { grade_id: gradeId }
  });

  if (!existingGrade) {
    throw new Error('Grade not found');
  }

  return await prisma.$transaction(async (tx) => {
    await tx.grade.delete({
      where: { grade_id: gradeId }
    });

    await tx.enrollment.update({
      where: { enrollment_id: existingGrade.enrollment_id },
      data: { status: 'ACTIVE' }
    });

    return { message: 'Grade deleted successfully and enrollment status reverted to ACTIVE' };
  });
};

const getMyGrades = async (student_id) => {
  return await prisma.grade.findMany({
    where: {
      enrollment: {
        student_id
      }
    },
    include: {
      enrollment: {
        include: {
          course: true
        }
      }
    },
    orderBy: {
      graded_at: 'desc'
    }
  });
};

const getGPA = async (student_id) => {
  // GPA Calculation: Sum of (grade_points * credits) / Total credits
  const grades = await prisma.grade.findMany({
    where: {
      enrollment: {
        student_id,
        status: 'COMPLETED'
      }
    },
    include: {
      enrollment: {
        include: {
          course: true
        }
      }
    }
  });

  if (grades.length === 0) {
    return { gpa: 0.0, total_credits: 0 };
  }

  let totalPoints = 0;
  let totalCredits = 0;

  grades.forEach(g => {
    const credits = g.enrollment.course.credits;
    totalPoints += g.grade_points * credits;
    totalCredits += credits;
  });

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0.0;

  return {
    gpa: parseFloat(gpa),
    total_credits: totalCredits
  };
};

// Helper: Compute grade letter and points from marks
function computeGrade(marks_obtained) {
  if (marks_obtained === undefined || marks_obtained === null || marks_obtained === '') {
    throw new Error('Marks obtained is required');
  }
  const marks = parseFloat(marks_obtained);
  if (isNaN(marks) || marks < 0 || marks > 100) {
    throw new Error('Marks must be a valid number between 0 and 100');
  }

  let grade_letter = 'F';
  let grade_points = 0.0;

  if (marks >= 90) { grade_letter = 'O'; grade_points = 10.0; }
  else if (marks >= 80) { grade_letter = 'A+'; grade_points = 9.0; }
  else if (marks >= 70) { grade_letter = 'A'; grade_points = 8.0; }
  else if (marks >= 60) { grade_letter = 'B+'; grade_points = 7.0; }
  else if (marks >= 50) { grade_letter = 'B'; grade_points = 6.0; }
  else if (marks >= 40) { grade_letter = 'C'; grade_points = 5.0; }
  else { grade_letter = 'F'; grade_points = 0.0; }

  return { grade_letter, grade_points };
}

module.exports = {
  getAllGrades,
  assignGrade,
  updateGrade,
  deleteGrade,
  getMyGrades,
  getGPA,
  computeGrade,
};
