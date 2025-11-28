import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Climb } from '../models/Climb';
import { Friendship } from '../models/Friendship';

export const getFeed = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get user's accepted friends only
    const friendships = await Friendship.find({ 
      userId,
      status: 'accepted'
    }).select('friendId');
    const friendIds = friendships.map((f) => f.friendId);

    // Include user's own ID to show their climbs too
    const userIds = [userId, ...friendIds];

    // Show recent tops from user and their friends
    const climbs = await Climb.find({ 
      userId: { $in: userIds },
      status: 'top' 
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name username avatarUrl')
      .populate('gymId')
      .populate('cragId')
      .lean();

    // Transform gymId/cragId to gym/crag and userId to user for frontend
    const transformedClimbs = climbs.map((climb: any) => ({
      ...climb,
      gym: climb.gymId,
      crag: climb.cragId,
      user: climb.userId,
    }));

    res.json(transformedClimbs);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
