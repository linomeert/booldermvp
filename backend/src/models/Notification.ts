import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'friend_request' | 'fistbump' | 'comment';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  fromUserId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['friend_request', 'fistbump', 'comment'], required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
