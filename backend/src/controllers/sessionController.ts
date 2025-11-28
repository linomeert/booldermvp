import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Session } from '../models/Session';
import { Climb, IClimb } from '../models/Climb';
import { Notification } from '../models/Notification';

export const createSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { locationType, gymId, cragId } = req.body;

    if (!locationType) {
      res.status(400).json({ error: 'Location type is required' });
      return;
    }

    const session = await Session.create({
      userId,
      locationType,
      gymId: gymId || undefined,
      cragId: cragId || undefined,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const endSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const session = await Session.findById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.userId.toString() !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    if (session.endedAt) {
      res.status(400).json({ error: 'Session already ended' });
      return;
    }

    const climbs = await Climb.find({ sessionId: id });

    const endedAt = new Date();
    const durationSeconds = Math.floor(
      (endedAt.getTime() - session.startedAt.getTime()) / 1000
    );

    const topsCount = climbs.filter((c: IClimb) => c.status === 'top').length;
    const projectsCount = climbs.filter((c: IClimb) => c.status === 'project').length;

    // Get hardest grade (simplified - just get the first one)
    const hardestGrade = climbs[0]?.grade || null;

    const updatedSession = await Session.findByIdAndUpdate(
      id,
      {
        endedAt,
        durationSeconds,
        climbCount: climbs.length,
        topsCount,
        projectsCount,
        hardestGrade,
      },
      { new: true }
    );

    res.json(updatedSession);
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMySessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const sessions = await Session.find({ userId })
      .sort({ startedAt: -1 })
      .populate('gymId')
      .populate('cragId')
      .populate('participants', 'name username avatarUrl')
      .lean();

    // Fetch climbs for each session
    const sessionsWithClimbs = await Promise.all(
      sessions.map(async (session: any) => {
        const climbs = await Climb.find({ sessionId: session._id })
          .sort({ createdAt: 1 })
          .lean();
        return { ...session, climbs };
      })
    );

    res.json(sessionsWithClimbs);
  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;

    // Find user by username
    const { User } = await import('../models/User');
    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const sessions = await Session.find({ userId: user._id })
      .sort({ startedAt: -1 })
      .populate('gymId')
      .populate('cragId')
      .populate('participants', 'name username avatarUrl')
      .lean();

    // Fetch climbs for each session
    const sessionsWithClimbs = await Promise.all(
      sessions.map(async (session: any) => {
        const climbs = await Climb.find({ sessionId: session._id })
          .populate('gymId')
          .populate('cragId')
          .sort({ createdAt: 1 })
          .lean();
        // Transform gymId/cragId to gym/crag for climbs
        const transformedClimbs = climbs.map((climb: any) => ({
          ...climb,
          gym: climb.gymId,
          crag: climb.cragId,
        }));
        return { ...session, climbs: transformedClimbs };
      })
    );

    res.json(sessionsWithClimbs);
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFeedSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get user's accepted friends only
    const { Friendship } = await import('../models/Friendship');
    const friendships = await Friendship.find({ 
      userId,
      status: 'accepted'
    }).select('friendId');
    const friendIds = friendships.map((f) => f.friendId);

    // Include user's own ID to show their sessions too
    const userIds = [userId, ...friendIds];

    const sessions = await Session.find({ 
      userId: { $in: userIds },
      endedAt: { $exists: true, $ne: null } // Only show completed sessions
    })
      .sort({ startedAt: -1 })
      .limit(50)
      .populate('userId', 'name username avatarUrl')
      .populate('gymId')
      .populate('cragId')
      .populate('participants', 'name username avatarUrl')
      .lean();

    // Fetch climbs for each session
    const sessionsWithClimbs = await Promise.all(
      sessions.map(async (session: any) => {
        const climbs = await Climb.find({ sessionId: session._id })
          .populate('gymId')
          .populate('cragId')
          .sort({ createdAt: 1 })
          .lean();
        // Transform gymId/cragId to gym/crag for climbs
        const transformedClimbs = climbs.map((climb: any) => ({
          ...climb,
          gym: climb.gymId,
          crag: climb.cragId,
        }));
        // Transform userId to user for frontend compatibility
        const { userId, ...rest } = session;
        return { 
          ...rest, 
          userId: userId._id || userId,
          user: typeof userId === 'object' ? userId : undefined,
          climbs: transformedClimbs
        };
      })
    );

    res.json(sessionsWithClimbs);
  } catch (error) {
    console.error('Get feed sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSessionById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate('gymId')
      .populate('cragId')
      .populate('userId', 'name username avatarUrl')
      .populate('participants', 'name username avatarUrl')
      .lean();

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const climbs = await Climb.find({ sessionId: id })
      .populate('climberId', 'name username avatarUrl')
      .populate('gymId')
      .populate('cragId')
      .sort({ createdAt: -1 })
      .lean();

    // Transform gymId/cragId to gym/crag for frontend
    const transformedClimbs = climbs.map((climb: any) => ({
      ...climb,
      gym: climb.gymId,
      crag: climb.cragId,
    }));

    res.json({ ...session, climbs: transformedClimbs });
  } catch (error) {
    console.error('Get session by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const session = await Session.findById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.userId.toString() !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Delete all climbs associated with this session
    await Climb.deleteMany({ sessionId: id });

    // Delete the session
    await Session.findByIdAndDelete(id);

    res.json({ message: 'Session and associated climbs deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const fistbumpSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const session = await Session.findById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check if user already fistbumped
    const alreadyFistbumped = session.fistbumps.some(
      (fistbumpUserId) => fistbumpUserId.toString() === userId
    );

    if (alreadyFistbumped) {
      // Remove fistbump
      session.fistbumps = session.fistbumps.filter(
        (fistbumpUserId) => fistbumpUserId.toString() !== userId
      );
      session.fistbumpCount = session.fistbumps.length;
    } else {
      // Add fistbump
      session.fistbumps.push(userId as any);
      session.fistbumpCount = session.fistbumps.length;

      // Create notification for session owner (if not self-fistbump)
      if (session.userId.toString() !== userId) {
        await Notification.create({
          userId: session.userId,
          type: 'fistbump',
          fromUserId: userId,
          sessionId: session._id,
        });
      }
    }

    await session.save();

    res.json({
      fistbumped: !alreadyFistbumped,
      fistbumpCount: session.fistbumpCount,
    });
  } catch (error) {
    console.error('Fistbump session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addParticipant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;
    const userId = req.userId!;

    const session = await Session.findById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Only session owner can add participants
    if (session.userId.toString() !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Check if active session
    if (session.endedAt) {
      res.status(400).json({ error: 'Cannot add participants to ended session' });
      return;
    }

    // Check if already a participant
    const alreadyParticipant = session.participants.some(
      (participantId) => participantId.toString() === friendId
    );

    if (alreadyParticipant) {
      res.status(400).json({ error: 'User is already a participant' });
      return;
    }

    // Add participant
    session.participants.push(friendId as any);
    await session.save();

    // Populate and return updated session
    const updatedSession = await Session.findById(id)
      .populate('participants', 'name username avatarUrl')
      .lean();

    res.json(updatedSession);
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeParticipant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id, friendId } = req.params;
    const userId = req.userId!;

    const session = await Session.findById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Only session owner can remove participants
    if (session.userId.toString() !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Check if active session
    if (session.endedAt) {
      res.status(400).json({ error: 'Cannot remove participants from ended session' });
      return;
    }

    // Remove participant
    session.participants = session.participants.filter(
      (participantId) => participantId.toString() !== friendId
    );
    await session.save();

    // Populate and return updated session
    const updatedSession = await Session.findById(id)
      .populate('participants', 'name username avatarUrl')
      .lean();

    res.json(updatedSession);
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
