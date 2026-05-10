const gradesService = require('./grades.service');
const auditService = require('../admin/audit.service');

const assignGrade = async (req, res, next) => {
  try {
    const { enrollment_id, marks_obtained } = req.body;
    const grade = await gradesService.assignGrade(req.body);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'ASSIGN_GRADE',
      target: `Enrollment: ${enrollment_id}, Marks: ${marks_obtained}`,
      type: 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Grade assigned successfully',
      data: grade
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Cannot assign') || error.message.includes('already been assigned')) {
      return res.status(400).json({ success: false, message: error.message });
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
  assignGrade,
  getMyGrades,
  getGPA,
  getStudentGrades
};

