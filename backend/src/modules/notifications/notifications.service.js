const prisma = require('../../config/prisma');

const getNotifications = async (studentId) => {
  return await prisma.notification.findMany({
    where: { student_id: studentId },
    orderBy: { created_at: 'desc' }
  });
};

const createNotification = async (studentId, data) => {
  return await prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      read: false,
      student_id: studentId
    }
  });
};

const markAsRead = async (notificationId, studentId) => {
  const notification = await prisma.notification.findUnique({ where: { notification_id: notificationId } });
  if (!notification || notification.student_id !== studentId) {
    throw new Error('Notification not found or unauthorized');
  }
  return await prisma.notification.update({
    where: { notification_id: notificationId },
    data: { read: true }
  });
};

const markAllAsRead = async (studentId) => {
  return await prisma.notification.updateMany({
    where: { student_id: studentId, read: false },
    data: { read: true }
  });
};

const deleteNotification = async (notificationId, studentId) => {
  const notification = await prisma.notification.findUnique({ where: { notification_id: notificationId } });
  if (!notification || notification.student_id !== studentId) {
    throw new Error('Notification not found or unauthorized');
  }
  return await prisma.notification.delete({
    where: { notification_id: notificationId }
  });
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
