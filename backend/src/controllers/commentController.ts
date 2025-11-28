import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Comment } from '../models/Comment';
import { Session } from '../models/Session';
import { Notification } from '../models/Notification';

export const getSessionComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const comments = await Comment.find({ sessionId })
      .populate('userId', 'name username avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Transform userId to user for frontend
    const transformedComments = comments.map((comment: any) => ({
      ...comment,
      user: comment.userId,
      userId: comment.userId._id || comment.userId,
    }));

    res.json(transformedComments);
  } catch (error) {
    console.error('Get session comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;
    const userId = req.userId!;

    if (!text || text.trim().length === 0) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    const comment = await Comment.create({
      sessionId,
      userId,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name username avatarUrl')
      .lean();

    // Transform userId to user for frontend
    const transformedComment = {
      ...populatedComment,
      user: (populatedComment as any).userId,
      userId: ((populatedComment as any).userId._id || (populatedComment as any).userId),
    };

    // Create notification for session owner (if not commenting on own session)
    const session = await Session.findById(sessionId);
    if (session && session.userId.toString() !== userId) {
      await Notification.create({
        userId: session.userId,
        type: 'comment',
        fromUserId: userId,
        sessionId: session._id,
        commentId: comment._id,
      });
    }

    res.status(201).json(transformedComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId.toString() !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    await Comment.findByIdAndDelete(id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
