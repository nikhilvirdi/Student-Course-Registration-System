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

const getLogs = async (options = 100) => {
  const opts = typeof options === 'number' ? { limit: options } : (options || {});
  const limit = opts.limit ? parseInt(opts.limit) : 100;
  
  const where = {};
  if (opts.type && opts.type !== 'ALL') {
    where.type = opts.type.toLowerCase();
  }
  if (opts.role && opts.role !== 'ALL') {
    where.user_role = opts.role.toUpperCase();
  }
  if (opts.search && opts.search.trim()) {
    const q = opts.search.trim();
    where.OR = [
      { user_name: { contains: q, mode: 'insensitive' } },
      { action: { contains: q, mode: 'insensitive' } },
      { target: { contains: q, mode: 'insensitive' } },
    ];
  }

  return await prisma.auditLog.findMany({
    where,
    take: limit,
    orderBy: {
      created_at: 'desc'
    }
  });
};

const getUserLogs = async (user_id, options = 50) => {
  const opts = typeof options === 'number' ? { limit: options } : (options || {});
  const limit = opts.limit ? parseInt(opts.limit) : 50;

  const where = { user_id };
  if (opts.type && opts.type !== 'ALL') {
    where.type = opts.type.toLowerCase();
  }
  if (opts.search && opts.search.trim()) {
    const q = opts.search.trim();
    where.OR = [
      { action: { contains: q, mode: 'insensitive' } },
      { target: { contains: q, mode: 'insensitive' } },
    ];
  }

  return await prisma.auditLog.findMany({
    where,
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

