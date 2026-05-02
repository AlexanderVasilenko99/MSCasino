import { Router, Request, Response } from 'express';
import * as userService from '../../modules/user/user.service';

const router = Router();

/**
 * POST /api/auth/register
 * Creates a new user account and returns a signed JWT alongside the initial account balance.
 */
router.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  const result = await userService.register(username, password);
  res.status(201).json(result);
});

/**
 * POST /api/auth/login
 * Verifies credentials and returns a signed JWT alongside the current account balance.
 */
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  const result = await userService.login(username, password);
  res.json(result);
});

export default router;
