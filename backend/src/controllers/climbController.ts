import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Climb, IClimb } from '../models/Climb';
import { Session } from '../models/Session';

export const createClimb = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      sessionId,
      climberId,
      status,
      locationType,
      gymId,
      cragId,
      grade,
      style,
      attempts,
      mediaUrl,
      notes,
    } = req.body;

    if (!status || !locationType || !grade) {
      res.status(400).json({ error: 'Status, locationType, and grade are required' });
      return;
    }

    const climbData: any = {
      userId,
      status,
      locationType,
      grade,
    };

    // Only add optional fields if they have values
    if (sessionId) climbData.sessionId = sessionId;
    if (climberId) climbData.climberId = climberId;
    // Extract ID if gym/crag is passed as object
    if (gymId) climbData.gymId = typeof gymId === 'object' ? gymId.id || gymId._id : gymId;
    if (cragId) climbData.cragId = typeof cragId === 'object' ? cragId.id || cragId._id : cragId;
    if (style) climbData.style = style;
    if (attempts) climbData.attempts = attempts;
    if (mediaUrl) climbData.mediaUrl = mediaUrl;
    if (notes) climbData.notes = notes;

    const climb = await Climb.create(climbData);

    // Update session stats if climb is part of a session
    if (sessionId) {
      const sessionClimbs = await Climb.find({ sessionId });

      const topsCount = sessionClimbs.filter((c: IClimb) => c.status === 'top').length;
      const projectsCount = sessionClimbs.filter((c: IClimb) => c.status === 'project').length;

      await Session.findByIdAndUpdate(sessionId, {
        climbCount: sessionClimbs.length,
        topsCount,
        projectsCount,
      });
    }

    res.status(201).json(climb);
  } catch (error) {
    console.error('Create climb error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyClimbs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status, locationType } = req.query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (locationType) {
      where.locationType = locationType;
    }

    const climbs = await Climb.find(where)
      .sort({ createdAt: -1 })
      .populate('gymId')
      .populate('cragId')
      .lean();

    // Transform gymId/cragId to gym/crag for frontend
    const transformedClimbs = climbs.map((climb: any) => ({
      ...climb,
      gym: climb.gymId,
      crag: climb.cragId,
    }));

    res.json(transformedClimbs);
  } catch (error) {
    console.error('Get my climbs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClimbById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const climb = await Climb.findById(id)
      .populate('userId', 'name username avatarUrl')
      .populate('gymId')
      .populate('cragId')
      .populate('sessionId')
      .lean();

    if (!climb) {
      res.status(404).json({ error: 'Climb not found' });
      return;
    }

    // Transform gymId/cragId to gym/crag for frontend
    const transformedClimb = {
      ...climb,
      gym: (climb as any).gymId,
      crag: (climb as any).cragId,
      user: (climb as any).userId,
    };

    res.json(transformedClimb);
  } catch (error) {
    console.error('Get climb by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserClimbs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;
    const { status, locationType } = req.query;

    // Find user by username
    const { User } = await import('../models/User');
    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const where: any = { userId: user._id };

    if (status) {
      where.status = status;
    }

    if (locationType) {
      where.locationType = locationType;
    }

    const climbs = await Climb.find(where)
      .sort({ createdAt: -1 })
      .populate('gymId')
      .populate('cragId')
      .lean();

    // Transform gymId/cragId to gym/crag for frontend
    const transformedClimbs = climbs.map((climb: any) => ({
      ...climb,
      gym: climb.gymId,
      crag: climb.cragId,
    }));

    res.json(transformedClimbs);
  } catch (error) {
    console.error('Get user climbs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteClimb = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const climb = await Climb.findById(id);

    if (!climb) {
      res.status(404).json({ error: 'Climb not found' });
      return;
    }

    if (climb.userId.toString() !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const sessionId = climb.sessionId;

    await Climb.findByIdAndDelete(id);

    // Update session stats if climb was part of a session
    if (sessionId) {
      const sessionClimbs = await Climb.find({ sessionId });

      const topsCount = sessionClimbs.filter((c: IClimb) => c.status === 'top').length;
      const projectsCount = sessionClimbs.filter((c: IClimb) => c.status === 'project').length;

      await Session.findByIdAndUpdate(sessionId, {
        climbCount: sessionClimbs.length,
        topsCount,
        projectsCount,
      });
    }

    res.json({ message: 'Climb deleted successfully' });
  } catch (error) {
    console.error('Delete climb error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
