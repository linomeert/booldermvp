import mongoose, { Schema, Document } from 'mongoose';

export type ClimbStatus = 'top' | 'project';
export type LocationType = 'indoor' | 'outdoor';

export interface IClimb extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  climberId?: mongoose.Types.ObjectId;
  status: ClimbStatus;
  locationType: LocationType;
  gymId?: mongoose.Types.ObjectId;
  cragId?: mongoose.Types.ObjectId;
  grade: string;
  style?: string;
  attempts?: number;
  mediaUrl?: string;
  notes?: string;
  projectDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClimbSchema = new Schema<IClimb>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    climberId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['top', 'project'], required: true },
    locationType: { type: String, enum: ['indoor', 'outdoor'], required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym' },
    cragId: { type: Schema.Types.ObjectId, ref: 'Crag' },
    grade: { type: String, required: true },
    style: { type: String },
    attempts: { type: Number },
    mediaUrl: { type: String },
    notes: { type: String },
    projectDate: { type: Date },
  },
  { timestamps: true }
);

ClimbSchema.index({ userId: 1, createdAt: -1 });
ClimbSchema.index({ sessionId: 1 });

export const Climb = mongoose.model<IClimb>('Climb', ClimbSchema);
