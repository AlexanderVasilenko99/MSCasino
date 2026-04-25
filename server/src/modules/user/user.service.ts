import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from './user.model';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config';

const SALT_ROUNDS = 10;

export interface UserPayload {
  userId: string;
  username: string;
}

function signToken(payload: UserPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

export async function register(
  username: string,
  password: string,
): Promise<{ token: string; username: string; accountBalance: number }> {
  const existing = await UserModel.findOne({ username: username.toLowerCase().trim() });
  if (existing) {
    throw new AppError(409, `Username '${username}' is already taken.`);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create({ username: username.toLowerCase().trim(), passwordHash });

  const token = signToken({ userId: (user.id as string), username: user.username });
  return { token, username: user.username, accountBalance: user.accountBalance };
}

export async function login(
  username: string,
  password: string,
): Promise<{ token: string; username: string; accountBalance: number }> {
  const user = await UserModel.findOne({ username: username.toLowerCase().trim() });
  if (!user) {
    throw new AppError(401, 'Invalid username or password.');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid username or password.');
  }

  const token = signToken({ userId: (user.id as string), username: user.username });
  return { token, username: user.username, accountBalance: user.accountBalance };
}

export async function getUser(userId: string): Promise<IUser> {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');
  return user;
}

export async function creditBalance(userId: string, amount: number): Promise<number> {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $inc: { accountBalance: amount } },
    { new: true },
  );
  if (!user) throw new AppError(404, 'User not found.');
  return user.accountBalance;
}
