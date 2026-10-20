// Demo identities for unauthenticated development mode
const DEMO_STUDENT = {
  id: '00000000-0000-4000-a000-000000000001',
  student_id: '00000000-0000-4000-a000-000000000001',
  name: 'Alex Doe',
  email: 'alex.doe@scrs.edu',
  role: 'STUDENT',
};

const DEMO_ADMIN = {
  id: 'a0000000-0000-4000-a000-000000000001',
  admin_id: 'a0000000-0000-4000-a000-000000000001',
  name: 'System Admin',
  email: 'admin@scrs.com',
  role: 'ADMIN',
};

const authMiddleware = (req, res, next) => {
  // Safety Constraint: Unauthenticated development mode must NEVER run in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Unauthenticated development mode is disabled in production.'
    });
  }

  // Determine active role from client demo header or route path
  const requestedRole = (req.header('x-demo-role') || '').toUpperCase();
  const isAdminRoute = req.baseUrl?.includes('/admin');

  if (requestedRole === 'ADMIN' || (isAdminRoute && requestedRole !== 'STUDENT')) {
    req.user = { ...DEMO_ADMIN };
  } else {
    req.user = { ...DEMO_STUDENT };
  }

  next();
};

module.exports = authMiddleware;

