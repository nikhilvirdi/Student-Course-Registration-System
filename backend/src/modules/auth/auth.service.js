const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (data) => {
  const { firstName, lastName, email, password, department_id, semester, role } = data;
  const name = `${firstName} ${lastName}`.trim();

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === 'ADMIN') {
    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) throw new Error('Admin with this email already exists');

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });
    return admin;
  } else {
    // Default to STUDENT
    // Check if student exists
    const existingUser = await prisma.student.findUnique({ where: { email } });
    if (existingUser) throw new Error('Student with this email already exists');

    // Require a valid department_id for students
    if (!department_id) {
      throw new Error('department_id is required for student registration');
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department_id,
        semester: parseInt(semester) || 1
      }
    });
    return student;
  }
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

  const parts = (user.name || '').split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';

  return { user: { id: user.student_id || user.admin_id, name: user.name, firstName, lastName, email: user.email, role }, token };
};

const getMe = async (id, role) => {
  let user;
  if (role === 'STUDENT') {
    user = await prisma.student.findUnique({ 
      where: { student_id: id },
      include: { department: true }
    });
  } else {
    user = await prisma.admin.findUnique({ where: { admin_id: id } });
  }

  if (user) {
    const parts = (user.name || '').split(' ');
    user.firstName = parts[0] || '';
    user.lastName = parts.slice(1).join(' ') || '';
  }
  return user;
};

/**
 * Update a student's name and/or email.
 * - Validates email uniqueness (excluding the current student).
 * - Returns the updated safe user object (no password field).
 */
const updateProfile = async (studentId, { name, email }) => {
  if (!name && !email) throw new Error('At least one field (name or email) is required');

  // If email is changing, ensure no other student already has it
  if (email) {
    const conflict = await prisma.student.findFirst({
      where: { email, NOT: { student_id: studentId } }
    });
    if (conflict) throw new Error('This email is already in use by another account');
  }

  const updated = await prisma.student.update({
    where: { student_id: studentId },
    data: {
      ...(name && { name }),
      ...(email && { email }),
    },
    select: {
      student_id: true,
      name: true,
      email: true,
    }
  });

  if (updated) {
    const parts = (updated.name || '').split(' ');
    updated.firstName = parts[0] || '';
    updated.lastName = parts.slice(1).join(' ') || '';
  }

  return updated;
};

/**
 * Change a student's password.
 * - Verifies the current password with bcrypt before accepting the new one.
 * - Rehashes the new password before storing.
 * - Enforces minimum length (8 chars).
 */
const updatePassword = async (studentId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Both currentPassword and newPassword are required');
  }
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  const student = await prisma.student.findUnique({ where: { student_id: studentId } });
  if (!student) throw new Error('Student not found');

  const isMatch = await bcrypt.compare(currentPassword, student.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.student.update({
    where: { student_id: studentId },
    data: { password: hashed }
  });

  return { success: true };
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updatePassword,
};
