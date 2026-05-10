const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    const isStudent = !!user.student_id;
    
    res.status(201).json({
      success: true,
      message: `${isStudent ? 'Student' : 'Admin'} registered successfully`,
      data: { 
        id: user.student_id || user.admin_id, 
        name: user.name, 
        email: user.email,
        role: isStudent ? 'STUDENT' : 'ADMIN'
      }
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

const updateProfile = async (req, res, next) => {
  try {
    // Only students can update their profile via this route
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ success: false, message: 'Forbidden: only students can use this endpoint' });
    }
    const updated = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ success: false, message: 'Forbidden: only students can change passwords via this endpoint' });
    }
    await authService.updatePassword(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
};
