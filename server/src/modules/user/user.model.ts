import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  accountBalance: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    accountBalance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', userSchema);
