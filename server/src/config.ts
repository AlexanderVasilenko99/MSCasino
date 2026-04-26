const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/casino',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  sessionTtlSeconds: parseInt(process.env.SESSION_TTL_SECONDS ?? '86400', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'alex-random-secret',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isTest: process.env.NODE_ENV === 'test',
};
