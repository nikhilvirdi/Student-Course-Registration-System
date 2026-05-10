const prisma = require('../../config/prisma');

const assignGrade = async (data) => {
  const { enrollment_id, marks_obtained } = data;

  // Ensure enrollment exists and is ACTIVE
  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id }
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  if (enrollment.status === 'COMPLETED') {
    throw new Error('Grade has already been assigned for this enrollment');
  }

  if (enrollment.status === 'DROPPED') {
    throw new Error('Cannot assign a grade to a dropped enrollment');
  }

  // 10-Point CGPA Architecture
  let grade_letter = 'F';
  let grade_points = 0.0;
  const marks = parseFloat(marks_obtained);

  if (marks >= 90) { grade_letter = 'O'; grade_points = 10.0; }
  else if (marks >= 80) { grade_letter = 'A+'; grade_points = 9.0; }
  else if (marks >= 70) { grade_letter = 'A'; grade_points = 8.0; }
  else if (marks >= 60) { grade_letter = 'B+'; grade_points = 7.0; }
  else if (marks >= 50) { grade_letter = 'B'; grade_points = 6.0; }
  else if (marks >= 40) { grade_letter = 'C'; grade_points = 5.0; }
  else { grade_letter = 'F'; grade_points = 0.0; }

  // Atomically create grade and update enrollment status
  return await prisma.$transaction(async (tx) => {
    const grade = await tx.grade.create({
      data: {
        enrollment_id,
        marks_obtained: marks,
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

module.exports = {
  assignGrade,
  getMyGrades,
  getGPA
};
