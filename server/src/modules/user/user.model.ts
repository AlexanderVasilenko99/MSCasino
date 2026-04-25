import { Schema, model, Document } from 'mongoose';

/**
 * Stub for future user accounts.
 * Currently unused — guest sessions have no persistent user identity.
 */
export interface IUser extends Document {
  accountBalance: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    accountBalance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', userSchema);
