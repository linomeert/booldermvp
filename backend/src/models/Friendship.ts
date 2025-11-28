import mongoose, { Schema, Document } from 'mongoose';

export interface IFriendship extends Document {
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted';
  createdAt: Date;
}

const friendshipSchema = new Schema<IFriendship>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  friendId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create unique compound index to prevent duplicate friendships
friendshipSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const Friendship = mongoose.model<IFriendship>('Friendship', friendshipSchema);
