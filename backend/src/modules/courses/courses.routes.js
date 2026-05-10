const express = require('express');
const router = express.Router();
const coursesController = require('./courses.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Publicly viewable courses (can also be protected if required)
router.get('/', coursesController.getCourses);
router.get('/:id', coursesController.getCourse);

// Admin-only routes
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), coursesController.createCourse);
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), coursesController.updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), coursesController.deleteCourse);

module.exports = router;
