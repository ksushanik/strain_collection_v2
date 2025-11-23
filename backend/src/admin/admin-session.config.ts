import session from 'express-session';

export const adminSessionStore = new session.MemoryStore();

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
