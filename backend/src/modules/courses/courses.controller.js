const coursesService = require('./courses.service');

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

module.exports = {
  getCourses,
  getCourse
};
