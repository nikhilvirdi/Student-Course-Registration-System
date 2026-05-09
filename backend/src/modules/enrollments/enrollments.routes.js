const express = require('express');
const router = express.Router();
const enrollmentsController = require('./enrollments.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Protect all enrollment routes - only accessible by STUDENTS
router.use(authMiddleware);
router.use(roleMiddleware(['STUDENT']));

router.get('/my', enrollmentsController.getMyEnrollments);
router.post('/register', enrollmentsController.register);
router.delete('/drop/:course_id', enrollmentsController.drop);

module.exports = router;
