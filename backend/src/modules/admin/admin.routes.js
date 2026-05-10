const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');

const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// GET /api/admin/enrollments
router.get('/enrollments', adminController.getAllEnrollments);

// GET /api/admin/courses/:id/students
router.get('/courses/:id/students', adminController.getCourseStudents);

// GET /api/admin/students
router.get('/students', adminController.getAllStudents);

// GET /api/admin/stats
router.get('/stats', adminController.getAggregateStats);

module.exports = router;
