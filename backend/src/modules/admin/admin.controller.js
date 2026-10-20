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

const getStudentDetail = async (req, res, next) => {
  try {
    const student = await AdminService.getStudentDetail(req.params.id);
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    if (error.message === 'Student not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
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

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await AdminService.getAnalytics();
    res.status(200).json({
      success: true,
      data: analytics
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

const adminEnrollStudent = async (req, res, next) => {
  try {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id) {
      return res.status(400).json({ success: false, message: 'student_id and course_id are required' });
    }

    const enrollment = await AdminService.adminEnrollStudent(student_id, course_id);

    // Log action
    await AuditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'ADMIN_ENROLL',
      target: `Student: ${student_id} → Course: ${course_id}`,
      type: 'course'
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('already enrolled') || error.message.includes('No seats')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const adminDropEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AdminService.adminDropEnrollment(id);

    // Log action
    await AuditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'ADMIN_DROP',
      target: `Enrollment: ${id}`,
      type: 'course'
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Cannot')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getAllDocuments = async (req, res, next) => {
  try {
    const documents = await AdminService.getAllDocuments();
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await AdminService.getAllNotifications();
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const student = await AdminService.createStudent(req.body);

    await AuditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'CREATE_STUDENT',
      target: `Student: ${student.name} (${student.email})`,
      type: 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await AdminService.updateStudent(id, req.body);

    await AuditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'UPDATE_STUDENT',
      target: `Student: ${student.name} (${student.email})`,
      type: 'system'
    });

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AdminService.deleteStudent(id);

    await AuditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'DELETE_STUDENT',
      target: `Student ID: ${id}`,
      type: 'system'
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const broadcastAnnouncement = async (req, res, next) => {
  try {
    const result = await AdminService.broadcastAnnouncement(req.body);

    await AuditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'BROADCAST_ANNOUNCEMENT',
      target: `Announcement: ${req.body.title}`,
      type: 'system'
    });

    res.status(201).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('No students')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteAdminNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AdminService.deleteAdminNotification(id);

    await AuditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'DELETE_NOTIFICATION',
      target: `Notification ID: ${id}`,
      type: 'system'
    });

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getAllEnrollments,
  getCourseStudents,
  getAllStudents,
  getStudentDetail,
  getAggregateStats,
  getAnalytics,
  getSystemLogs,
  adminEnrollStudent,
  adminDropEnrollment,
  getAllDocuments,
  getAllNotifications,
  createStudent,
  updateStudent,
  deleteStudent,
  broadcastAnnouncement,
  deleteAdminNotification,
};
