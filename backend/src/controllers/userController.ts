import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Climb } from '../models/Climb';
import { Session } from '../models/Session';

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate stats
    const totalTops = await Climb.countDocuments({
      userId,
      status: 'top',
    });

    const totalProjects = await Climb.countDocuments({
      userId,
      status: 'project',
    });

    const sessions = await Session.countDocuments({ userId });

    // Get hardest grade (simplified - just get the most recent top)
    const hardestClimb = await Climb.findOne({
      userId,
      status: 'top',
    }).sort({ createdAt: -1 });

    res.json({
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      stats: {
        totalTops,
        totalProjects,
        sessions,
        hardestGrade: hardestClimb?.grade || 'N/A',
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserByUsername = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate stats
    const totalTops = await Climb.countDocuments({
      userId: user._id,
      status: 'top',
    });

    const totalProjects = await Climb.countDocuments({
      userId: user._id,
      status: 'project',
    });

    const sessions = await Session.countDocuments({ userId: user._id });

    const hardestClimb = await Climb.findOne({
      userId: user._id,
      status: 'top',
    }).sort({ createdAt: -1 });

    res.json({
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      stats: {
        totalTops,
        totalProjects,
        sessions,
        hardestGrade: hardestClimb?.grade || 'N/A',
      },
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    // Search by username or name (case-insensitive)
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(20)
      .select('name username avatarUrl')
      .lean();

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
