const prisma = require('../../config/prisma');

const logAction = async ({ user_id, user_name, user_role, action, target, type }) => {
  try {
    return await prisma.auditLog.create({
      data: {
        user_id,
        user_name,
        user_role,
        action,
        target,
        type: type || 'system',
      }
    });
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    // We don't throw here to avoid breaking the main request flow
  }
};

const getLogs = async (limit = 100) => {
  return await prisma.auditLog.findMany({
    take: limit,
    orderBy: {
      created_at: 'desc'
    }
  });
};

const getUserLogs = async (user_id, limit = 50) => {
  return await prisma.auditLog.findMany({
    where: { user_id },
    take: limit,
    orderBy: {
      created_at: 'desc'
    }
  });
};

module.exports = {
  logAction,
  getLogs,
  getUserLogs
};

