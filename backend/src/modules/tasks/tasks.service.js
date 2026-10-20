const prisma = require('../../config/prisma');

const getTasks = async (userId, userRole = 'STUDENT') => {
  if (userRole === 'ADMIN') {
    return await prisma.task.findMany({
      include: {
        student: { select: { student_id: true, name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }
  return await prisma.task.findMany({
    where: { student_id: userId },
    orderBy: { created_at: 'desc' }
  });
};

const createTask = async (userId, data, userRole = 'STUDENT') => {
  const studentId = userRole === 'ADMIN' ? (data.student_id || '00000000-0000-4000-a000-000000000001') : userId;
  const isCompleted = data.completed !== undefined ? data.completed : data.is_completed;
  return await prisma.task.create({
    data: {
      title: data.title,
      category: data.category || 'Other',
      priority: data.priority || 'Medium',
      due_date: data.due_date || null,
      completed: Boolean(isCompleted),
      student_id: studentId
    }
  });
};

const updateTask = async (taskId, userId, data, userRole = 'STUDENT') => {
  const task = await prisma.task.findUnique({ where: { task_id: taskId } });
  if (!task) {
    throw new Error('Task not found');
  }
  if (userRole !== 'ADMIN' && task.student_id !== userId) {
    throw new Error('Unauthorized');
  }
  const completedVal = data.completed !== undefined ? data.completed : data.is_completed;
  return await prisma.task.update({
    where: { task_id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.due_date !== undefined && { due_date: data.due_date }),
      ...(completedVal !== undefined && { completed: Boolean(completedVal) }),
    }
  });
};

const deleteTask = async (taskId, userId, userRole = 'STUDENT') => {
  const task = await prisma.task.findUnique({ where: { task_id: taskId } });
  if (!task) {
    throw new Error('Task not found');
  }
  if (userRole !== 'ADMIN' && task.student_id !== userId) {
    throw new Error('Unauthorized');
  }
  return await prisma.task.delete({
    where: { task_id: taskId }
  });
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
