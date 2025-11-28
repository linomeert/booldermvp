import { Request, Response } from 'express';
import { Gym, Crag } from '../models/Location';

export const getGyms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const gyms = await Gym.find().sort({ name: 1 }).lean();

    res.json(gyms);
  } catch (error) {
    console.error('Get gyms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCrags = async (_req: Request, res: Response): Promise<void> => {
  try {
    const crags = await Crag.find().sort({ name: 1 }).lean();

    res.json(crags);
  } catch (error) {
    console.error('Get crags error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
