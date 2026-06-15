import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  broadcastEmergencyAlert
} from '../services/notificationService.js';
import { getResidentProfile } from '../services/residentService.js';

// Helper to get local user ID from req.user
const getLocalUserId = async (userPayload) => {
  const profile = await getResidentProfile(userPayload.authUserId);
  return profile.id;
};

export const getNotifications = async (req, res, next) => {
  try {
    const localUserId = await getLocalUserId(req.user);
    const { isRead, page, limit } = req.query;

    const result = await getUserNotifications(localUserId, {
      isRead,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const localUserId = await getLocalUserId(req.user);

    const notification = await markAsRead(id, localUserId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read successfully',
      notification
    });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const localUserId = await getLocalUserId(req.user);
    await markAllAsRead(localUserId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const sendEmergencyAlert = async (req, res, next) => {
  try {
    const localUserId = await getLocalUserId(req.user);
    const result = await broadcastEmergencyAlert(req.body, localUserId);

    res.status(201).json({
      success: true,
      message: `Emergency alert broadcasted successfully to ${result.broadcastCount} residents`,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
