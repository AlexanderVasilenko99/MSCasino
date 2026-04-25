import { Schema, model, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  startCredits: number;
  finalCredits: number;
  totalSpins: number;
  status: 'active' | 'closed';
  createdAt: Date;
  closedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    startCredits: { type: Number, required: true, default: 10 },
    finalCredits: { type: Number, required: true, default: 10 },
    totalSpins: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    closedAt: { type: Date },
  },
  { timestamps: true },
);

export const SessionModel = model<ISession>('Session', sessionSchema);
