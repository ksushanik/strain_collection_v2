import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const isProd = process.env.NODE_ENV === 'production';
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;

if (isProd && !redisUrl) {
  throw new Error('REDIS_URL is required in production for admin sessions');
}

if (!adminSessionSecret) {
  throw new Error('ADMIN_SESSION_SECRET is required');
}
const redisClient = redisUrl ? new Redis(redisUrl) : null;

if (redisClient) {
  // Log and continue with MemoryStore fallback if Redis breaks.
  redisClient.on('error', (err) => {
    console.error('Redis session error', err);
  });
}

export const adminSessionStore: session.Store = redisClient
  ? new RedisStore({
      client: redisClient,
      prefix: 'adminjs:',
    })
  : new session.MemoryStore();

export const adminSessionOptions: session.SessionOptions = {
  name: 'adminjs',
  secret: adminSessionSecret,
  resave: false,
  saveUninitialized: false,
  store: adminSessionStore,
  cookie: {
    sameSite: 'lax',
    secure: isProd,
  },
};
