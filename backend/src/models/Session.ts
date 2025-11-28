import mongoose, { Schema, Document } from 'mongoose';

export type LocationType = 'indoor' | 'outdoor';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  locationType: LocationType;
  gymId?: mongoose.Types.ObjectId;
  cragId?: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  climbCount: number;
  topsCount: number;
  projectsCount: number;
  hardestGrade?: string;
  syncedToStrava: boolean;
  fistbumps: mongoose.Types.ObjectId[];
  fistbumpCount: number;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    locationType: { type: String, enum: ['indoor', 'outdoor'], required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym' },
    cragId: { type: Schema.Types.ObjectId, ref: 'Crag' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    durationSeconds: { type: Number },
    climbCount: { type: Number, default: 0 },
    topsCount: { type: Number, default: 0 },
    projectsCount: { type: Number, default: 0 },
    hardestGrade: { type: String },
    syncedToStrava: { type: Boolean, default: false },
    fistbumps: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    fistbumpCount: { type: Number, default: 0 },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, startedAt: -1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
