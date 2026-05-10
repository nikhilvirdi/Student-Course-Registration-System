const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerStudent = async (data) => {
  const { name, email, password, department_id, semester } = data;

  // Check if student exists
  const existingUser = await prisma.student.findUnique({ where: { email } });
  if (existingUser) throw new Error('Student with this email already exists');

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Handle default department placeholder from frontend
  let actualDeptId = department_id;
  if (!actualDeptId || actualDeptId === 'default-uuid-placeholder') {
    let firstDept = await prisma.department.findFirst();
    if (!firstDept) {
      firstDept = await prisma.department.create({
        data: { department_name: 'General Studies' }
      });
    }
    actualDeptId = firstDept.department_id;
  }

  // Create student
  const student = await prisma.student.create({
    data: {
      name,
      email,
      password: hashedPassword,
      department_id: actualDeptId,
      semester: parseInt(semester) || 1
    }
  });

  return student;
};

const loginUser = async (email, password) => {
  // Check in students
  let user = await prisma.student.findUnique({ where: { email } });
  let role = 'STUDENT';

  // If not student, check in admins
  if (!user) {
    user = await prisma.admin.findUnique({ where: { email } });
    role = 'ADMIN';
  }

  if (!user) throw new Error('Invalid email or password');

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  // Generate JWT
  const token = jwt.sign(
    { id: user.student_id || user.admin_id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { user: { id: user.student_id || user.admin_id, name: user.name, email: user.email, role }, token };
};

const getMe = async (id, role) => {
  if (role === 'STUDENT') {
    return await prisma.student.findUnique({ 
      where: { student_id: id },
      include: { department: true }
    });
  }
  return await prisma.admin.findUnique({ where: { admin_id: id } });
};

module.exports = {
  registerStudent,
  loginUser,
  getMe
};
