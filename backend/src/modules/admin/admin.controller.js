const AdminService = require('./admin.service');
const AuditService = require('./audit.service');

const getAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await AdminService.getAllEnrollments();
    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

const getCourseStudents = async (req, res, next) => {
  try {
    const students = await AdminService.getCourseStudents(req.params.id);
    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const students = await AdminService.getAllStudents();
    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

const getAggregateStats = async (req, res, next) => {
  try {
    const stats = await AdminService.getAggregateStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getSystemLogs = async (req, res, next) => {
  try {
    const logs = await AuditService.getLogs();
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEnrollments,
  getCourseStudents,
  getAllStudents,
  getAggregateStats,
  getSystemLogs
};
