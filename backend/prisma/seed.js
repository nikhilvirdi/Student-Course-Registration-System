const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Departments
const DEPARTMENTS = [
  { department_id: '10000001-0000-4000-a000-000000000001', department_name: 'Aerospace Engineering' },
  { department_id: '10000002-0000-4000-a000-000000000002', department_name: 'Architecture' },
  { department_id: '10000003-0000-4000-a000-000000000003', department_name: 'Artificial Intelligence & Data Science' },
  { department_id: '10000004-0000-4000-a000-000000000004', department_name: 'Artificial Intelligence & Machine Learning' },
  { department_id: '10000005-0000-4000-a000-000000000005', department_name: 'Biotechnology' },
  { department_id: '10000006-0000-4000-a000-000000000006', department_name: 'Chemical Engineering' },
  { department_id: '10000007-0000-4000-a000-000000000007', department_name: 'Civil Engineering' },
  { department_id: '10000008-0000-4000-a000-000000000008', department_name: 'Computer Science & Engineering' },
  { department_id: '10000009-0000-4000-a000-000000000009', department_name: 'Computer Science & Engineering (AI & ML)' },
  { department_id: '10000010-0000-4000-a000-000000000010', department_name: 'Computer Science & Engineering (Cyber Security)' },
  { department_id: '10000011-0000-4000-a000-000000000011', department_name: 'Electrical & Electronics Engineering' },
  { department_id: '10000012-0000-4000-a000-000000000012', department_name: 'Electronics & Communication Engineering' },
  { department_id: '10000013-0000-4000-a000-000000000013', department_name: 'Electronics & Instrumentation Engineering' },
  { department_id: '10000014-0000-4000-a000-000000000014', department_name: 'Electronics & Telecommunication Engineering' },
  { department_id: '10000015-0000-4000-a000-000000000015', department_name: 'Humanities' },
  { department_id: '10000016-0000-4000-a000-000000000016', department_name: 'Industrial Engineering & Management' },
  { department_id: '10000017-0000-4000-a000-000000000017', department_name: 'Information Science & Engineering' },
  { department_id: '10000018-0000-4000-a000-000000000018', department_name: 'Management Studies (MBA)' },
  { department_id: '10000019-0000-4000-a000-000000000019', department_name: 'Master of Computer Applications (MCA)' },
  { department_id: '10000020-0000-4000-a000-000000000020', department_name: 'Mathematics' },
  { department_id: '10000021-0000-4000-a000-000000000021', department_name: 'Mechanical Engineering' },
  { department_id: '10000022-0000-4000-a000-000000000022', department_name: 'Medical Electronics Engineering' },
];

async function main() {
  console.log('🌱 Seeding departments...');
  for (const dept of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { department_id: dept.department_id },
      update: { department_name: dept.department_name },
      create: dept,
    });
  }

  console.log('🌱 Seeding default admin...');
  const adminPassword = await bcrypt.hash('adminpassword', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@scrs.com' },
    update: {},
    create: {
      admin_id: 'a0000000-0000-4000-a000-000000000001',
      name: 'System Admin',
      email: 'admin@scrs.com',
      password: adminPassword,
    }
  });

  console.log('🌱 Seeding sample faculty...');
  const faculty = [
    { faculty_id: '30000001-0000-4000-a000-000000000001', faculty_name: 'Dr. Sushma B', email: 'sushma@scrs.edu' },
    { faculty_id: '30000002-0000-4000-a000-000000000002', faculty_name: 'Dr. Mamatha A', email: 'mamatha@scrs.edu' },
    { faculty_id: '30000003-0000-4000-a000-000000000003', faculty_name: 'Dr. Sangeetha V', email: 'sangeetha@scrs.edu' },
  ];

  for (const f of faculty) {
    await prisma.faculty.upsert({
      where: { email: f.email },
      update: { faculty_name: f.faculty_name },
      create: f
    });
  }

  console.log('🌱 Seeding dedicated demo student...');
  const studentPassword = await bcrypt.hash('demopassword', 10);
  await prisma.student.upsert({
    where: { email: 'alex.doe@scrs.edu' },
    update: {
      name: 'Alex Doe',
      department_id: '10000008-0000-4000-a000-000000000008',
      semester: 3
    },
    create: {
      student_id: '00000000-0000-4000-a000-000000000001',
      name: 'Alex Doe',
      email: 'alex.doe@scrs.edu',
      password: studentPassword,
      semester: 3,
      department_id: '10000008-0000-4000-a000-000000000008', // Computer Science & Engineering
    }
  });

  console.log('🌱 Seeding initial sample courses...');
  const sampleCourses = [
    {
      course_id: 'c0000001-0000-4000-a000-000000000001',
      course_code: 'CS301',
      course_name: 'Data Structures & Algorithms',
      description: 'Comprehensive study of fundamental data structures, graph theory, sorting, and dynamic programming.',
      credits: 4,
      max_seats: 60,
      available_seats: 59,
      faculty_id: '30000001-0000-4000-a000-000000000001',
      department_id: '10000008-0000-4000-a000-000000000008',
      schedule_days: 'Mon, Wed',
      schedule_time: '10:00 AM - 11:30 AM',
      room: 'Lecture Hall 101',
      semester_label: 'Fall 2026'
    },
    {
      course_id: 'c0000002-0000-4000-a000-000000000002',
      course_code: 'CS402',
      course_name: 'Database Management Systems',
      description: 'Relational database architecture, normalization, ACID properties, transaction processing, and SQL querying.',
      credits: 4,
      max_seats: 50,
      available_seats: 50,
      faculty_id: '30000002-0000-4000-a000-000000000002',
      department_id: '10000008-0000-4000-a000-000000000008',
      schedule_days: 'Tue, Thu',
      schedule_time: '02:00 PM - 03:30 PM',
      room: 'CS Lab 3',
      semester_label: 'Fall 2026'
    },
    {
      course_id: 'c0000003-0000-4000-a000-000000000003',
      course_code: 'AI201',
      course_name: 'Introduction to Artificial Intelligence',
      description: 'Foundations of intelligent agents, search algorithms, knowledge representation, and probabilistic reasoning.',
      credits: 3,
      max_seats: 45,
      available_seats: 45,
      faculty_id: '30000003-0000-4000-a000-000000000003',
      department_id: '10000004-0000-4000-a000-000000000004',
      schedule_days: 'Fri',
      schedule_time: '09:00 AM - 12:00 PM',
      room: 'AI Seminar Hall',
      semester_label: 'Fall 2026'
    }
  ];

  for (const c of sampleCourses) {
    await prisma.course.upsert({
      where: { course_id: c.course_id },
      update: {
        course_name: c.course_name,
        course_code: c.course_code,
        description: c.description,
        credits: c.credits,
        max_seats: c.max_seats,
        faculty_id: c.faculty_id,
        department_id: c.department_id,
        schedule_days: c.schedule_days,
        schedule_time: c.schedule_time,
        room: c.room,
        semester_label: c.semester_label
      },
      create: c
    });
  }

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
