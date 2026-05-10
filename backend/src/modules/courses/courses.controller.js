const coursesService = require('./courses.service');
const auditService = require('../admin/audit.service');

const getCourses = async (req, res, next) => {
  try {
    const { search, department_id } = req.query;
    const courses = await coursesService.getAllCourses({ search, department_id });
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await coursesService.getCourseById(req.params.id);
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await coursesService.createCourse(req.body);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'CREATE',
      target: `Course: ${course.course_name} (${course.course_code || course.course_id})`,
      type: 'course'
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await coursesService.updateCourse(req.params.id, req.body);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'UPDATE',
      target: `Course: ${course.course_name} (${course.course_code || course.course_id})`,
      type: 'course'
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    // We might want to get the course info before deleting for the log
    const course = await coursesService.getCourseById(courseId);
    
    await coursesService.deleteCourse(courseId);
    
    // Log action
    if (course) {
      await auditService.logAction({
        user_id: req.user.id,
        user_name: req.user.name,
        user_role: req.user.role,
        action: 'DELETE',
        target: `Course: ${course.course_name} (${course.course_code || course.course_id})`,
        type: 'course'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
};

