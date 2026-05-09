const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seed started...');

  // 1. Clear existing data
  await prisma.prerequisite.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.student.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.department.deleteMany();

  // 2. Create Departments
  const csDept = await prisma.department.create({
    data: { department_name: 'Computer Science' }
  });
  const eeDept = await prisma.department.create({
    data: { department_name: 'Electrical Engineering' }
  });

  // 3. Create Faculty
  const faculty1 = await prisma.faculty.create({
    data: { faculty_name: 'Dr. Alan Turing', email: 'turing@university.edu' }
  });
  const faculty2 = await prisma.faculty.create({
    data: { faculty_name: 'Dr. Ada Lovelace', email: 'ada@university.edu' }
  });

  // 4. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.create({
    data: {
      name: 'System Admin',
      email: 'admin@scrs.com',
      password: adminPassword
    }
  });

  // 5. Create Students
  const studentPassword = await bcrypt.hash('student123', 10);
  const student1 = await prisma.student.create({
    data: {
      name: 'John Doe',
      email: 'john@student.com',
      password: studentPassword,
      semester: 4,
      department_id: csDept.department_id
    }
  });

  const student2 = await prisma.student.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@student.com',
      password: studentPassword,
      semester: 6,
      department_id: eeDept.department_id
    }
  });

  // 6. Create Courses
  const course1 = await prisma.course.create({
    data: {
      course_name: 'Introduction to Programming',
      description: 'Basics of programming using Python.',
      credits: 3,
      max_seats: 30,
      available_seats: 30,
      faculty_id: faculty1.faculty_id,
      department_id: csDept.department_id
    }
  });

  const course2 = await prisma.course.create({
    data: {
      course_name: 'Data Structures',
      description: 'Advanced data organization and algorithms.',
      credits: 4,
      max_seats: 25,
      available_seats: 25,
      faculty_id: faculty1.faculty_id,
      department_id: csDept.department_id
    }
  });

  const course3 = await prisma.course.create({
    data: {
      course_name: 'Circuit Theory',
      description: 'Fundamentals of electrical circuits.',
      credits: 3,
      max_seats: 20,
      available_seats: 20,
      faculty_id: faculty2.faculty_id,
      department_id: eeDept.department_id
    }
  });

  // 7. Create Prerequisites
  // Data Structures requires Intro to Programming
  await prisma.prerequisite.create({
    data: {
      course_id: course2.course_id,
      prerequisite_course_id: course1.course_id
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
