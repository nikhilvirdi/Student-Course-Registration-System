const departmentsService = require('./departments.service');

exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await departmentsService.getAllDepartments();
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};
