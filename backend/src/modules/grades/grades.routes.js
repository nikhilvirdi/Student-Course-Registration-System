const express = require('express');
const router = express.Router();
const gradesController = require('./grades.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Admin only routes
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), gradesController.getAllGrades);
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), gradesController.assignGrade);
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), gradesController.updateGrade);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), gradesController.deleteGrade);
router.get('/student/:id', authMiddleware, roleMiddleware(['ADMIN']), gradesController.getStudentGrades);

// Student only routes
router.get('/my', authMiddleware, roleMiddleware(['STUDENT']), gradesController.getMyGrades);
router.get('/gpa', authMiddleware, roleMiddleware(['STUDENT']), gradesController.getGPA);

module.exports = router;
