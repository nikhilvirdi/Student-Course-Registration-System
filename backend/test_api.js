const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function test() {
  try {
    // create student
    const student = await prisma.student.create({
      data: {
        name: 'Api Test Student',
        email: 'apitest@student.com',
        password: 'hash',
        semester: 1,
        department_id: '10000001-0000-4000-a000-000000000001'
      }
    });

    // create course
    const course = await prisma.course.create({
      data: {
        course_name: 'Api Test Course',
        description: 'Test',
        credits: 3,
        max_seats: 50,
        available_seats: 50,
        department_id: '10000001-0000-4000-a000-000000000001',
        faculty_id: '3f1dd96a-82b7-4705-84fc-7d273d90afdd'
      }
    });

    const token = jwt.sign(
      { id: student.student_id, email: student.email, name: student.name, role: 'STUDENT' },
      process.env.JWT_SECRET || 'supersecretjwtkey'
    );

    const res = await fetch('http://localhost:5000/api/enrollments/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ course_id: course.course_id })
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
