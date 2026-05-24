const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
