const authService = require('./auth.service');
const auditService = require('../admin/audit.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    const isStudent = !!user.student_id;
    
    // Log action
    await auditService.logAction({
      user_id: user.student_id || user.admin_id,
      user_name: user.name,
      user_role: isStudent ? 'STUDENT' : 'ADMIN',
      action: 'REGISTER',
      target: `User: ${user.email}`,
      type: 'security'
    });

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
    
    // Log action
    await auditService.logAction({
      user_id: result.user.id,
      user_name: result.user.name,
      user_role: result.user.role,
      action: 'LOGIN',
      target: `User: ${result.user.email}`,
      type: 'security'
    });

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
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'UPDATE_PROFILE',
      target: `User: ${updated.email}`,
      type: 'security'
    });

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
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'CHANGE_PASSWORD',
      target: `User: ${req.user.email}`,
      type: 'security'
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMyLogs = async (req, res, next) => {
  try {
    const logs = await auditService.getUserLogs(req.user.id);
    res.status(200).json({
      success: true,
      data: logs
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
  getMyLogs
};


