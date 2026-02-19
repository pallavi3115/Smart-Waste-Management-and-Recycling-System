const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');
const { sendPushNotification } = require('../services/pushService');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    let query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          unreadCount
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
exports.getPreferences = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: user.preferences.notifications
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { email, sms, push } = req.body;

    req.user.preferences.notifications = {
      email: email !== undefined ? email : req.user.preferences.notifications.email,
      sms: sms !== undefined ? sms : req.user.preferences.notifications.sms,
      push: push !== undefined ? push : req.user.preferences.notifications.push
    };

    await req.user.save();

    res.json({
      success: true,
      data: req.user.preferences.notifications
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to create notification
const createNotification = async (userId, data) => {
  try {
    const notification = await Notification.create({
      user: userId,
      ...data
    });

    // Emit via socket
    const io = getIO();
    io.to(`user:${userId}`).emit('notification', notification);

    // Send push notification if enabled
    const user = await User.findById(userId);
    if (user?.preferences?.notifications?.push) {
      await sendPushNotification(userId, {
        title: data.title,
        body: data.message,
        data: data.data
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Bulk create notifications
const createBulkNotifications = async (userIds, data) => {
  const notifications = userIds.map(userId => ({
    user: userId,
    ...data
  }));

  return await Notification.insertMany(notifications);
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  createNotification,
  createBulkNotifications
};