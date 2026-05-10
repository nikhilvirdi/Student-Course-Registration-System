const { PrismaClient } = require('@prisma/client');
const enrollmentsService = require('./src/modules/enrollments/enrollments.service');
const prisma = new PrismaClient();

async function test() {
  try {
    // create student
    const student = await prisma.student.create({
      data: {
        name: 'Test Student',
        email: 'test@student.com',
        password: 'hash',
        semester: 1,
        department_id: '10000001-0000-4000-a000-000000000001' // Aerospace
      }
    });

    // create course
    const course = await prisma.course.create({
      data: {
        course_name: 'Test Aerospace Course',
        description: 'Test',
        credits: 3,
        max_seats: 50,
        available_seats: 50,
        department_id: '10000001-0000-4000-a000-000000000001',
        faculty_id: '3f1dd96a-82b7-4705-84fc-7d273d90afdd' // some faculty
      }
    });

    console.log('Created student and course. Attempting enroll...');
    const enrollment = await enrollmentsService.registerForCourse(student.student_id, course.course_id);
    console.log('Success!', enrollment);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
