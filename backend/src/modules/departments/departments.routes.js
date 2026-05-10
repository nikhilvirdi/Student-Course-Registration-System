const express = require('express');
const router = express.Router();
const departmentsController = require('./departments.controller');

// GET /api/departments
router.get('/', departmentsController.getAllDepartments);

module.exports = router;
