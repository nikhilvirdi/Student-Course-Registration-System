const notificationsService = require('./notifications.service');
const auditService = require('../admin/audit.service');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationsService.getNotifications(req.user.id);
    res.status(200).json({ success: true, message: 'Notifications retrieved', data: notifications });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationsService.markAsRead(req.params.id, req.user.id);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'READ_NOTIFICATION',
      target: `Notification: ${notification.title}`,
      type: 'system'
    });

    res.status(200).json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (error) {
    if (error.message === 'Notification not found or unauthorized') {
      return res.status(403).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationsService.markAllAsRead(req.user.id);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'READ_ALL_NOTIFICATIONS',
      target: 'All Notifications',
      type: 'system'
    });

    res.status(200).json({ success: true, message: 'All notifications marked as read', data: null });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationsService.deleteNotification(req.params.id, req.user.id);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'DELETE_NOTIFICATION',
      target: `Notification ID: ${req.params.id}`,
      type: 'system'
    });

    res.status(200).json({ success: true, message: 'Notification deleted', data: null });
  } catch (error) {
    if (error.message === 'Notification not found or unauthorized') {
      return res.status(403).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
