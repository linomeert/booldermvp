import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const notifications = await Notification.find({ userId })
      .populate('fromUserId', 'name username avatarUrl')
      .populate('sessionId')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Transform fromUserId to fromUser for frontend
    const transformedNotifications = notifications.map((notif: any) => ({
      ...notif,
      id: notif._id.toString(),
      fromUser: notif.fromUserId,
      fromUserId: notif.fromUserId?._id?.toString() || notif.fromUserId,
      sessionId: notif.sessionId?._id?.toString() || notif.sessionId,
      commentId: notif.commentId?._id?.toString() || notif.commentId,
    }));

    res.json(transformedNotifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
