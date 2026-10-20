const gradesService = require('./grades.service');
const auditService = require('../admin/audit.service');

const getAllGrades = async (req, res, next) => {
  try {
    const grades = await gradesService.getAllGrades();
    res.status(200).json({
      success: true,
      data: grades
    });
  } catch (error) {
    next(error);
  }
};

const assignGrade = async (req, res, next) => {
  try {
    const { enrollment_id, marks_obtained, student_id, course_id } = req.body;
    const grade = await gradesService.assignGrade(req.body);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'ASSIGN_GRADE',
      target: `Enrollment: ${enrollment_id || `${student_id}→${course_id}`}, Marks: ${marks_obtained}`,
      type: 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Grade assigned successfully',
      data: grade
    });
  } catch (error) {
    if (
      error.message.includes('not found') || 
      error.message.includes('Cannot assign') || 
      error.message.includes('already been assigned') ||
      error.message.includes('Marks must be') ||
      error.message.includes('required') ||
      error.message.includes('not enrolled')
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateGrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { marks_obtained } = req.body;

    if (marks_obtained === undefined || marks_obtained === null || marks_obtained === '') {
      return res.status(400).json({ success: false, message: 'marks_obtained is required' });
    }

    const grade = await gradesService.updateGrade(id, marks_obtained);

    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'UPDATE_GRADE',
      target: `Grade: ${id}, New Marks: ${marks_obtained}`,
      type: 'system'
    });

    res.status(200).json({
      success: true,
      message: 'Grade updated successfully',
      data: grade
    });
  } catch (error) {
    if (error.message === 'Grade not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('Marks must be') || error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteGrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gradesService.deleteGrade(id);

    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'DELETE_GRADE',
      target: `Grade: ${id}`,
      type: 'system'
    });

    res.status(200).json({
      success: true,
      message: 'Grade reset successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Grade not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getMyGrades = async (req, res, next) => {
  try {
    // req.user is set by auth.middleware
    const student_id = req.user.id;
    const grades = await gradesService.getMyGrades(student_id);
    res.status(200).json({
      success: true,
      data: grades
    });
  } catch (error) {
    next(error);
  }
};

const getGPA = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const gpaData = await gradesService.getGPA(student_id);
    res.status(200).json({
      success: true,
      data: gpaData
    });
  } catch (error) {
    next(error);
  }
};

const getStudentGrades = async (req, res, next) => {
  try {
    const { id } = req.params;
    const grades = await gradesService.getMyGrades(id);
    res.status(200).json({
      success: true,
      data: grades
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGrades,
  assignGrade,
  updateGrade,
  deleteGrade,
  getMyGrades,
  getGPA,
  getStudentGrades
};
