const tasksService = require('./tasks.service');
const auditService = require('../admin/audit.service');

const getTasks = async (req, res, next) => {
  try {
    const tasks = await tasksService.getTasks(req.user.id);
    res.status(200).json({ success: true, message: 'Tasks retrieved successfully', data: tasks });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await tasksService.createTask(req.user.id, req.body);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'CREATE_TASK',
      target: `Task: ${task.title}`,
      type: 'task'
    });

    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await tasksService.updateTask(req.params.id, req.user.id, req.body);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'UPDATE_TASK',
      target: `Task: ${task.title}`,
      type: 'task'
    });

    res.status(200).json({ success: true, message: 'Task updated successfully', data: task });
  } catch (error) {
    if (error.message === 'Task not found or unauthorized') {
      return res.status(403).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await tasksService.deleteTask(req.params.id, req.user.id);
    
    // Log action
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'DELETE_TASK',
      target: `Task ID: ${req.params.id}`,
      type: 'task'
    });

    res.status(200).json({ success: true, message: 'Task deleted successfully', data: null });
  } catch (error) {
    if (error.message === 'Task not found or unauthorized') {
      return res.status(403).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
