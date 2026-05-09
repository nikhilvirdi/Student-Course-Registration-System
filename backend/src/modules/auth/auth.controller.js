const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const student = await authService.registerStudent(req.body);
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: { id: student.student_id, name: student.name, email: student.email }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
