const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');

const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// GET /api/admin/enrollments
router.get('/enrollments', adminController.getAllEnrollments);

// POST /api/admin/enrollments — admin enrolls a student
router.post('/enrollments', adminController.adminEnrollStudent);

// DELETE /api/admin/enrollments/:id — admin de-enrolls
router.delete('/enrollments/:id', adminController.adminDropEnrollment);

// GET /api/admin/courses/:id/students
router.get('/courses/:id/students', adminController.getCourseStudents);

// GET /api/admin/students
router.get('/students', adminController.getAllStudents);

// GET /api/admin/students/:id — single student detail
router.get('/students/:id', adminController.getStudentDetail);

// GET /api/admin/stats
router.get('/stats', adminController.getAggregateStats);

// GET /api/admin/analytics — detailed analytics
router.get('/analytics', adminController.getAnalytics);

// GET /api/admin/logs
router.get('/logs', adminController.getSystemLogs);

// GET /api/admin/documents — all documents across students
router.get('/documents', adminController.getAllDocuments);

// GET /api/admin/notifications — all notifications across students
router.get('/notifications', adminController.getAllNotifications);

module.exports = router;
