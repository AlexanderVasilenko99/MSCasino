import { Router, Request, Response } from 'express';
import * as userService from '../../modules/user/user.service';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  const result = await userService.register(username, password);
  res.status(201).json(result);
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  const result = await userService.login(username, password);
  res.json(result);
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await userService.getUser(req.user!.userId);
  res.json({ username: user.username, accountBalance: user.accountBalance });
});

export default router;
