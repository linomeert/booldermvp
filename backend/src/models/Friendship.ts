import mongoose, { Schema, Document } from 'mongoose';

export interface IFriendship extends Document {
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create unique compound index to prevent duplicate friendships
friendshipSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const Friendship = mongoose.model<IFriendship>('Friendship', friendshipSchema);
