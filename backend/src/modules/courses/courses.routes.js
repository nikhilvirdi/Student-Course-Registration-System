const express = require('express');
const router = express.Router();
const coursesController = require('./courses.controller');

// Publicly viewable courses (can also be protected if required)
router.get('/', coursesController.getCourses);
router.get('/:id', coursesController.getCourse);

module.exports = router;
