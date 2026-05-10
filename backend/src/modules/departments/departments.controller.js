const departmentsService = require('./departments.service');

exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await departmentsService.getAllDepartments();
    res.json(departments);
  } catch (error) {
    next(error);
  }
};
