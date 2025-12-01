import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import fs from 'fs';
import cloudinary from '../config/cloudinary';

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const userId = req.userId!;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'boolder/avatars',
      public_id: `${user.username}_${Date.now()}`,
      overwrite: true,
      resource_type: 'image',
    });
    // Remove local file after upload
    fs.unlinkSync(req.file.path);
    user.avatarUrl = result.secure_url;
    await user.save();
    res.json({ avatarUrl: result.secure_url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
