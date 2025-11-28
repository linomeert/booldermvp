import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Friendship } from '../models/Friendship';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

export const addFriend = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { friendId } = req.params;

    if (userId === friendId) {
      res.status(400).json({ error: 'Cannot add yourself as a friend' });
      return;
    }

    const friendUser = await User.findById(friendId);
    if (!friendUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'pending') {
        res.status(400).json({ error: 'Friend request already sent' });
      } else {
        res.status(400).json({ error: 'Already friends' });
      }
      return;
    }

    // Create friend request (pending status)
    await Friendship.create({
      userId,
      friendId,
      status: 'pending',
    });

    // Create notification for the friend
    const notification = await Notification.create({
      userId: friendId,
      type: 'friend_request',
      fromUserId: userId,
    });

    console.log('Created notification:', {
      id: notification._id,
      userId: friendId,
      fromUserId: userId,
      type: 'friend_request',
    });

    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFriend = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { friendId } = req.params;

    // Remove bidirectional friendship
    await Friendship.deleteMany({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFriends = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const friendships = await Friendship.find({ 
      userId,
      status: 'accepted'
    })
      .populate('friendId', 'name username avatarUrl')
      .lean();

    const friends = friendships.map((f: any) => f.friendId);

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkFriendship = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { friendId } = req.params;

    const friendship = await Friendship.findOne({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    });

    res.json({ 
      isFriend: friendship?.status === 'accepted',
      status: friendship?.status || null,
    });
  } catch (error) {
    console.error('Check friendship error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const acceptFriendRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { friendId } = req.params;

    // Find the pending friend request where friendId is the one who sent the request
    const friendRequest = await Friendship.findOne({
      userId: friendId,
      friendId: userId,
      status: 'pending',
    });

    if (!friendRequest) {
      res.status(404).json({ error: 'Friend request not found' });
      return;
    }

    // Update the request to accepted
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Create the reverse friendship (bidirectional)
    await Friendship.create({
      userId,
      friendId,
      status: 'accepted',
    });

    // Delete the friend request notification
    await Notification.deleteMany({
      userId,
      type: 'friend_request',
      fromUserId: friendId,
    });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const rejectFriendRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { friendId } = req.params;

    // Delete the pending friend request
    await Friendship.deleteOne({
      userId: friendId,
      friendId: userId,
      status: 'pending',
    });

    // Delete the friend request notification
    await Notification.deleteMany({
      userId,
      type: 'friend_request',
      fromUserId: friendId,
    });

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
