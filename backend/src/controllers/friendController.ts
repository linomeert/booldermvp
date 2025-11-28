import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Friendship } from '../models/Friendship';
import { User } from '../models/User';

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
      userId,
      friendId,
    });

    if (existingFriendship) {
      res.status(400).json({ error: 'Already friends' });
      return;
    }

    // Create bidirectional friendship
    await Friendship.create([
      { userId, friendId },
      { userId: friendId, friendId: userId },
    ]);

    res.status(201).json({ message: 'Friend added successfully' });
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

    const friendships = await Friendship.find({ userId })
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

    const friendship = await Friendship.findOne({ userId, friendId });

    res.json({ isFriend: !!friendship });
  } catch (error) {
    console.error('Check friendship error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
