const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Departments with stable explicit UUIDs so the frontend fallback always matches the DB
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

  console.log(`✅ Seeded ${DEPARTMENTS.length} departments successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
