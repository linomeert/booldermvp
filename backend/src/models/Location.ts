import mongoose, { Schema, Document } from 'mongoose';


export interface IGym extends Document {
  name: string;
  city?: string;
  country?: string;
  address?: string;
  grading?: string[];
}

const GymSchema = new Schema<IGym>({
  name: { type: String, required: true },
  city: { type: String },
  country: { type: String },
  address: { type: String },
  grading: { type: [String], default: [] },
});

export const Gym = mongoose.model<IGym>('Gym', GymSchema);

export interface ICrag extends Document {
  name: string;
  area?: string;
  country?: string;
}

const CragSchema = new Schema<ICrag>({
  name: { type: String, required: true },
  area: { type: String },
  country: { type: String },
});

export const Crag = mongoose.model<ICrag>('Crag', CragSchema);
