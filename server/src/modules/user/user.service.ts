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

/**
 * Signs a JWT containing the user's ID and username.
 * Purpose: create a compact, stateless token the client can store and send
 * with subsequent requests to prove identity.
 */
function signToken(payload: UserPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

/**
 * Creates a new user account and returns a signed JWT.
 * Purpose: allow a player to establish a persistent identity so their cashed-
 * out credits are preserved across sessions. The password is hashed with bcrypt
 * before storage — the plain-text password is never persisted.
 * Throws 409 if the username is already taken.
 */
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

/**
 * Verifies credentials and returns a signed JWT for an existing user.
 * Purpose: authenticate a returning player so they can cash out into their
 * account. A generic error is returned for both "user not found" and "wrong
 * password" to avoid leaking which usernames exist.
 */
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

/**
 * Fetches a user document by MongoDB ID.
 * Purpose: retrieve the full user record (e.g. to read the current account
 * balance) after the JWT has already identified them.
 * 404 if no user with that ID exists.
 */
export async function getUser(userId: string): Promise<IUser> {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');
  return user;
}

/**
 * Atomically adds credits to a user's account balance.
 * Purpose: transfer cashed-out session credits to the player's persistent
 * wallet. Uses MongoDB's $inc operator so concurrent updates cannot overwrite
 * each other. Returns the new total balance after the increment.
 */
export async function creditBalance(userId: string, amount: number): Promise<number> {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $inc: { accountBalance: amount } },
    { new: true },
  );
  if (!user) throw new AppError(404, 'User not found.');
  return user.accountBalance;
}
