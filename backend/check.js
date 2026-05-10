const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
const enrollmentsService = require('./src/modules/enrollments/enrollments.service');

async function check() { 
  try {
    const students = await prisma.student.findMany(); 
    const courses = await prisma.course.findMany(); 
    
    if (students.length > 0 && courses.length > 1) {
      console.log('Attempting to enroll Student in Course 2 using service...');
      const enrollment = await enrollmentsService.registerForCourse(students[0].student_id, courses[1].course_id);
      console.log('Success:', enrollment);
    }
  } catch (err) {
    console.error('Error:', err);
  }
} 
check().finally(() => prisma.$disconnect());
