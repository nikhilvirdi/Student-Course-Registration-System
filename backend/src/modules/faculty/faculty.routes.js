const express = require('express');
const router = express.Router();
const facultyController = require('./faculty.controller');

// Public route to fetch all faculty members
router.get('/', facultyController.getAllFaculty);

module.exports = router;
