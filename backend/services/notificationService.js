const { Notification, User } = require('../models/associations');

/**
 * Create and send notification
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
  sendSms = false,
  sendWhatsapp = false,
  sendEmail = false
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      sentViaSms: sendSms,
      sentViaWhatsapp: sendWhatsapp,
      sentViaEmail: sendEmail
    });

    // TODO: Implement actual SMS/WhatsApp/Email sending
    // if (sendSms) await sendSmsNotification(userId, message);
    // if (sendWhatsapp) await sendWhatsappNotification(userId, message);
    // if (sendEmail) await sendEmailNotification(userId, title, message);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  try {
    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      notifications: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { notifications: [], total: 0, page: 1, totalPages: 0 };
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  try {
    return await Notification.count({
      where: { userId, isRead: false }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Notification templates
 */
const notificationTemplates = {
  loanRequestCreated: (borrowerName, amount) => ({
    title: 'New Loan Request',
    message: `${borrowerName} is requesting a loan of ₹${amount}`
  }),
  loanAccepted: (lenderName, amount) => ({
    title: 'Loan Request Accepted',
    message: `${lenderName} has accepted your loan request of ₹${amount}`
  }),
  loanRejected: (lenderName) => ({
    title: 'Loan Request Rejected',
    message: `${lenderName} has declined your loan request`
  }),
  loanFulfilled: (borrowerName, amount) => ({
    title: 'Loan Fulfilled',
    message: `${borrowerName} has confirmed receiving ₹${amount}`
  }),
  paymentReminder: (amount, daysLeft) => ({
    title: 'Payment Reminder',
    message: `Your payment of ₹${amount} is due in ${daysLeft} day(s)`
  }),
  paymentReceived: (borrowerName, amount) => ({
    title: 'Payment Received',
    message: `${borrowerName} has made a payment of ₹${amount}`
  }),
  paymentOverdue: (amount, daysOverdue) => ({
    title: 'Payment Overdue',
    message: `Your payment of ₹${amount} is ${daysOverdue} day(s) overdue`
  }),
  reportFiled: () => ({
    title: 'Report Filed',
    message: 'A report has been filed against you. Our team will review it.'
  }),
  accountBlocked: (reason) => ({
    title: 'Account Blocked',
    message: `Your account has been blocked. Reason: ${reason}`
  })
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  notificationTemplates
};
