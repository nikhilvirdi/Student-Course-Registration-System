const express = require('express');
const router = express.Router();
const studentsController = require('./students.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Protect all student routes - only accessible by STUDENTS
router.use(authMiddleware);
router.use(roleMiddleware(['STUDENT']));

router.get('/profile', studentsController.getProfile);
router.get('/dashboard', studentsController.getDashboard);

module.exports = router;
