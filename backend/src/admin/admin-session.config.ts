import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
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
  secret:
    process.env.ADMIN_SESSION_SECRET || 'session_secret_change_in_production',
  resave: false,
  saveUninitialized: false,
  store: adminSessionStore,
  cookie: {
    sameSite: 'lax',
    secure: false,
  },
};
