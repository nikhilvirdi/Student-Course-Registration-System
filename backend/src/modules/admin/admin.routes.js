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

// PUT /api/admin/enrollments/:id — admin updates enrollment status
router.put('/enrollments/:id', adminController.adminUpdateEnrollmentStatus);

// GET /api/admin/courses/:id/students
router.get('/courses/:id/students', adminController.getCourseStudents);

// GET /api/admin/students
router.get('/students', adminController.getAllStudents);

// POST /api/admin/students — create student
router.post('/students', adminController.createStudent);

// GET /api/admin/students/:id — single student detail
router.get('/students/:id', adminController.getStudentDetail);

// PUT /api/admin/students/:id — update student
router.put('/students/:id', adminController.updateStudent);

// DELETE /api/admin/students/:id — delete student
router.delete('/students/:id', adminController.deleteStudent);

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

// POST /api/admin/notifications — broadcast announcement
router.post('/notifications', adminController.broadcastAnnouncement);

// DELETE /api/admin/notifications/:id — delete notification
router.delete('/notifications/:id', adminController.deleteAdminNotification);

// Settings Routes
router.get('/settings', adminController.getAdminSettings);
router.put('/settings', adminController.updateAdminSettings);
router.post('/settings/reset', adminController.resetAdminSettings);

module.exports = router;
