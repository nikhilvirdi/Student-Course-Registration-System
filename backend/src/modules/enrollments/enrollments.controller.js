const enrollmentsService = require('./enrollments.service');
const auditService = require('../admin/audit.service');

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentsService.getStudentEnrollments(req.user.id);
    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

const getAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentsService.getAllEnrollments();
    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const enrollment = await enrollmentsService.registerForCourse(req.user.id, course_id);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'ENROLL',
      target: `Course ID: ${course_id}`,
      type: 'course'
    });

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

const drop = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const result = await enrollmentsService.dropCourse(req.user.id, course_id);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'DROP',
      target: `Course ID: ${course_id}`,
      type: 'course'
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyEnrollments,
  getAllEnrollments,
  register,
  drop
};

