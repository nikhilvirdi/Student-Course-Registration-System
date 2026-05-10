const prisma = require('../../config/prisma');

const getTasks = async (studentId) => {
  return await prisma.task.findMany({
    where: { student_id: studentId },
    orderBy: { created_at: 'desc' }
  });
};

const createTask = async (studentId, data) => {
  return await prisma.task.create({
    data: {
      title: data.title,
      category: data.category || 'Other',
      priority: data.priority || 'Medium',
      due_date: data.due_date || null,
      completed: false,
      student_id: studentId
    }
  });
};

const updateTask = async (taskId, studentId, data) => {
  const task = await prisma.task.findUnique({ where: { task_id: taskId } });
  if (!task || task.student_id !== studentId) {
    throw new Error('Task not found or unauthorized');
  }
  return await prisma.task.update({
    where: { task_id: taskId },
    data
  });
};

const deleteTask = async (taskId, studentId) => {
  const task = await prisma.task.findUnique({ where: { task_id: taskId } });
  if (!task || task.student_id !== studentId) {
    throw new Error('Task not found or unauthorized');
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
