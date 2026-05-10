const enrollmentsService = require('./enrollments.service');

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
