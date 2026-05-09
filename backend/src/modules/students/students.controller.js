const studentsService = require('./students.service');

const getProfile = async (req, res, next) => {
  try {
    const profile = await studentsService.getStudentProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const stats = await studentsService.getStudentDashboard(req.user.id);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getDashboard
};
