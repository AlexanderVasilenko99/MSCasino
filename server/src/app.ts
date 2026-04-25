import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './api/routes/auth.routes';
import sessionRoutes from './api/routes/session.routes';
import gameRoutes from './api/routes/game.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/session/:sessionId', gameRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
