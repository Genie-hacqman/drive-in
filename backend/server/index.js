import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import { Server } from 'socket.io';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import {
  createBooking,
  createOAuthUser,
  createVehicle,
  createUser,
  ensureDemoUser,
  getBookingById,
  getBookingsByUser,
  getFeaturedVehicles,
  getUserByEmail,
  getUserByOAuthAccount,
  getUserById,
  getVehicleById,
  initDatabase,
  listVehicles,
  logAuditEvent,
  markUserEmailVerified,
  createOAuthSession,
  createOAuthTransaction as saveOAuthTransaction,
  consumeOAuthSession,
  consumeOAuthTransaction as consumeSavedOAuthTransaction,
  createAuthSession,
  createPasswordResetToken,
  getAuthSession,
  revokeAllAuthSessions,
  revokeAuthSession,
  resetPasswordWithToken,
  seedVehicles,
  updateBookingStatus,
  updateUserLastLogin,
  updateVehicle,
  deleteVehicle,
} from '../database/db.js';
import { sendPasswordResetEmail } from '../services/email.js';

dotenv.config();

const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const TRUST_PROXY_HOPS = Number(process.env.TRUST_PROXY_HOPS || 0);

const app = express();
app.set('trust proxy', TRUST_PROXY_HOPS > 0 ? TRUST_PROXY_HOPS : false);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || (IS_PRODUCTION ? '__Host-drive-me-session' : 'drive-me-session');
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.SESSION_SECRET || (IS_PRODUCTION ? undefined : 'local-development-csrf-secret-change-me');
if (IS_PRODUCTION && (!process.env.SESSION_SECRET || !process.env.CSRF_SECRET)) {
  throw new Error('SESSION_SECRET and CSRF_SECRET are required in production');
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://accounts.google.com'],
      connectSrc: ["'self'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      frameSrc: ["'self'", 'https://accounts.google.com'],
      formAction: ["'self'", 'https://appleid.apple.com'],
    },
  },
  hsts: IS_PRODUCTION ? undefined : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

const hashSessionToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const sessionCookieOptions = { httpOnly: true, secure: IS_PRODUCTION, sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE };

const issueSession = async (user, req, res) => {
  const rawToken = randomToken(48);
  await createAuthSession({
    tokenHash: hashSessionToken(rawToken),
    userId: user.id,
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE),
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });
  res.cookie(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions);
};

const authMiddleware = async (req, res, next) => {
  const rawToken = req.cookies[SESSION_COOKIE_NAME];
  if (!rawToken) return res.status(401).json({ message: 'Unauthorized' });
  const session = await getAuthSession(hashSessionToken(rawToken));
  if (!session || session.user.status !== 'active') return res.status(401).json({ message: 'Unauthorized' });
  req.authSession = session;
  req.user = session.user;
  return next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

const OAUTH_TRANSACTION_TTL = 10 * 60 * 1000;
const OAUTH_SESSION_TTL = 2 * 60 * 1000;

const randomToken = (size = 32) => crypto.randomBytes(size).toString('base64url');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('base64url');

const safeReturnTo = (value, fallback) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
};

const providerConfig = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    redirectUri: () => `${BACKEND_URL}/api/auth/google/callback`,
  },
  apple: {
    clientId: () => process.env.APPLE_CLIENT_ID,
    redirectUri: () => `${BACKEND_URL}/api/auth/apple/callback`,
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const isValidCredentialInput = (email, password) => (
  email.length <= 254 && EMAIL_PATTERN.test(email) && typeof password === 'string' && password.length >= 6 && password.length <= 128
);

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication requests. Please try again later.' },
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Please try again later.' },
});

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  getSessionIdentifier: (req) => `${req.ip}:${req.get('user-agent') || ''}`,
  cookieName: 'drive-me-csrf',
  cookieOptions: { httpOnly: false, sameSite: 'lax', secure: IS_PRODUCTION, path: '/' },
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
  skipCsrfProtection: (req) => req.path.endsWith('/google/callback') || req.path.endsWith('/apple/callback'),
});

const oauthTestOverrides = {};
export const setOAuthTestOverrides = (overrides = {}) => {
  Object.keys(oauthTestOverrides).forEach((key) => delete oauthTestOverrides[key]);
  Object.assign(oauthTestOverrides, overrides);
};

app.use('/api/auth', authRateLimiter);
app.get('/api/auth/csrf-token', (req, res) => res.json({ csrfToken: generateCsrfToken(req, res) }));
app.use(doubleCsrfProtection);

const createOAuthTransaction = async ({ provider, returnTo, admin }) => {
  const state = randomToken();
  const nonce = randomToken();
  const codeVerifier = randomToken(48);
  await saveOAuthTransaction({
    state,
    provider,
    returnTo,
    admin,
    nonce,
    codeVerifier,
    ttl: OAUTH_TRANSACTION_TTL,
  });
  return { state, nonce, codeVerifier, codeChallenge: sha256(codeVerifier) };
};

const consumeOAuthTransaction = async (state, provider) => {
  const transaction = await consumeSavedOAuthTransaction(state, provider);
  if (!transaction) {
    throw new Error('Invalid or expired OAuth state');
  }
  return transaction;
};

const createOAuthSessionCode = async (user, returnTo, admin) => {
  const code = randomToken(32);
  await createOAuthSession({
    code,
    userId: user.id,
    returnTo,
    admin,
    ttl: OAUTH_SESSION_TTL,
  });
  return code;
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  authProvider: user.authProvider,
  emailVerified: user.emailVerified,
});

const recordAuditEvent = (req, event, userId = null, details = {}) => logAuditEvent({
  event,
  userId,
  provider: details.provider,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  metadata: details.metadata || {},
}).catch((error) => console.error('Audit logging error:', error.message));

const createAppleClientSecret = () => {
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!process.env.APPLE_TEAM_ID || !process.env.APPLE_KEY_ID || !process.env.APPLE_CLIENT_ID || !privateKey) {
    throw new Error('Apple OAuth is not configured on the server');
  }

  return jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: process.env.APPLE_TEAM_ID,
    audience: 'https://appleid.apple.com',
    subject: process.env.APPLE_CLIENT_ID,
    keyid: process.env.APPLE_KEY_ID,
  });
};

const appleJWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

const resolveOAuthUser = async ({ provider, providerUserId, name, email, emailVerified, allowCreate = true }) => {
  let user = await getUserByOAuthAccount(provider, providerUserId);
  let created = false;
  if (!user && email && emailVerified && await getUserByEmail(email)) {
    throw new Error('An account already exists for this email. Sign in to that account and link this provider from account settings.');
  }

  if (!user && !allowCreate) {
    throw new Error('This account is not authorized for admin access');
  }

  if (!user) {
    user = await createOAuthUser({ name, email, emailVerified, provider, providerUserId });
    created = true;
  }

  if (emailVerified) await markUserEmailVerified(user.id);

  return { user: await updateUserLastLogin(user.id), created };
};

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'drive-me-api' });
});

app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { password } = req.body || {};

  if (!isValidCredentialInput(email, password)) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    recordAuditEvent(req, 'LOGIN_FAILED');
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) {
    recordAuditEvent(req, 'LOGIN_FAILED', user.id);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const authenticatedUser = await updateUserLastLogin(user.id);
  await issueSession(authenticatedUser, req, res);
  recordAuditEvent(req, 'LOGIN_SUCCESS', authenticatedUser.id);
  return res.json({
    user: {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      phone: authenticatedUser.phone,
      role: authenticatedUser.role,
    },
  });
});

app.post('/api/auth/admin/login', loginRateLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { password } = req.body || {};

  if (!isValidCredentialInput(email, password)) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await getUserByEmail(email);
  if (!user || user.role !== 'admin') {
    recordAuditEvent(req, 'LOGIN_FAILED');
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) {
    recordAuditEvent(req, 'LOGIN_FAILED', user.id);
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const authenticatedUser = await updateUserLastLogin(user.id);
  await issueSession(authenticatedUser, req, res);
  recordAuditEvent(req, 'LOGIN_SUCCESS', authenticatedUser.id, { metadata: { admin: true } });
  return res.json({
    user: {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      phone: authenticatedUser.phone,
      role: authenticatedUser.role,
    },
  });
});

app.post('/api/auth/register', loginRateLimiter, async (req, res) => {
  const { name, password, phone, role = 'customer' } = req.body || {};
  const email = normalizeEmail(req.body?.email);
  const registrationRole = role === 'dealer' ? 'dealer' : 'customer';

  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100 || !isValidCredentialInput(email, password) || (phone && String(phone).length > 30)) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const newUser = await createUser({ name, email, password, phone, role: registrationRole });
    await issueSession(newUser, req, res);
    recordAuditEvent(req, 'ACCOUNT_CREATED', newUser.id);

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error.message === 'An account with this email already exists') {
      return res.status(409).json({ message: error.message });
    }

    return res.status(400).json({ message: 'Unable to create account' });
  }
});

const passwordResetResponse = { message: 'If an account exists for that email, a password reset link will be sent shortly.' };

app.post('/api/auth/forgot-password', passwordResetLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) return res.json(passwordResetResponse);

  const user = await getUserByEmail(email);
  if (!user) return res.json(passwordResetResponse);

  const rawToken = randomToken(32);
  try {
    await createPasswordResetToken({
      tokenHash: sha256(rawToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });
  } catch (error) {
    console.error('Password reset delivery error:', error.message);
  }

  return res.json(passwordResetResponse);
});

app.post('/api/auth/reset-password', passwordResetLimiter, async (req, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token : '';
  const newPassword = req.body?.newPassword;
  if (!token || token.length > 256 || !isValidCredentialInput('reset@example.com', newPassword)) {
    return res.status(400).json({ message: 'Invalid or expired password reset token' });
  }

  try {
    const user = await resetPasswordWithToken(sha256(token), newPassword);
    if (!user) return res.status(400).json({ message: 'Invalid or expired password reset token' });
    recordAuditEvent(req, 'PASSWORD_RESET', user.id);
    return res.json({ message: 'Password reset successful. Please sign in again.' });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to reset password' });
  }
});

app.get('/api/auth/:provider/start', async (req, res) => {
  const { provider } = req.params;
  const config = providerConfig[provider];
  if (!config) return res.status(404).json({ message: 'Unsupported OAuth provider' });
  if (!config.clientId()) return res.status(500).json({ message: `${provider} OAuth is not configured on the server` });

  const admin = req.query.admin === 'true';
  const fallback = admin ? '/admin/login' : '/login';
  const returnTo = safeReturnTo(req.query.returnTo, fallback);
  const transaction = await createOAuthTransaction({ provider, returnTo, admin });
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId(),
    redirect_uri: config.redirectUri(),
    scope: provider === 'google' ? 'openid email profile' : 'name email',
    state: transaction.state,
    nonce: transaction.nonce,
    code_challenge: transaction.codeChallenge,
    code_challenge_method: 'S256',
  });

  if (provider === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'select_account');
    return res.json({ authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  }

  params.set('response_mode', 'form_post');
  return res.json({ authorizationUrl: `https://appleid.apple.com/auth/authorize?${params}` });
});

const exchangeGoogleCode = async (code, transaction) => {
  if (oauthTestOverrides.google) return oauthTestOverrides.google(code, transaction);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google OAuth is not configured on the server');

  const response = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: providerConfig.google.redirectUri(),
    grant_type: 'authorization_code',
    code_verifier: transaction.codeVerifier,
  }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 });

  const googleClient = new OAuth2Client(clientId);
  const ticket = await googleClient.verifyIdToken({ idToken: response.data.id_token, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload || payload.iss !== 'https://accounts.google.com' || payload.nonce !== transaction.nonce || payload.email_verified !== true) {
    throw new Error('Google identity verification failed');
  }
  return { providerUserId: payload.sub, name: payload.name, email: payload.email, emailVerified: true, nonce: payload.nonce };
};

const exchangeAppleCode = async (code, transaction, rawUser) => {
  if (oauthTestOverrides.apple) return oauthTestOverrides.apple(code, transaction, rawUser);
  const response = await axios.post('https://appleid.apple.com/auth/token', new URLSearchParams({
    code,
    client_id: process.env.APPLE_CLIENT_ID,
    client_secret: createAppleClientSecret(),
    redirect_uri: providerConfig.apple.redirectUri(),
    grant_type: 'authorization_code',
    code_verifier: transaction.codeVerifier,
  }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 });

  const verified = await jwtVerify(response.data.id_token, appleJWKS, {
    issuer: 'https://appleid.apple.com',
    audience: process.env.APPLE_CLIENT_ID,
  });
  const payload = verified.payload;
  if (payload.nonce !== transaction.nonce || !payload.sub) throw new Error('Apple identity verification failed');

  let firstAuthorizationUser = {};
  if (rawUser) {
    try { firstAuthorizationUser = JSON.parse(rawUser); } catch { firstAuthorizationUser = {}; }
  }
  const name = [firstAuthorizationUser.name?.firstName, firstAuthorizationUser.name?.lastName].filter(Boolean).join(' ');
  return {
    providerUserId: payload.sub,
    name: name || undefined,
    email: payload.email,
    emailVerified: payload.email_verified === true || payload.email_verified === 'true',
    nonce: payload.nonce,
  };
};

const finishOAuthRedirect = (res, transaction, code, error) => {
  const query = error
    ? `error=${encodeURIComponent(error)}`
    : `code=${encodeURIComponent(code)}`;
  const returnTo = `&returnTo=${encodeURIComponent(transaction.returnTo)}`;
  return res.redirect(`${FRONTEND_URL}/auth/callback?${query}&provider=${transaction.provider}${returnTo}`);
};

const handleGoogleCallback = async (req, res) => {
  const transaction = await consumeOAuthTransaction(req.query.state, 'google');
  if (req.query.error) return finishOAuthRedirect(res, transaction, null, 'Google sign-in was cancelled');
  const identity = await exchangeGoogleCode(req.query.code, transaction);
  if (identity.nonce !== transaction.nonce) throw new Error('Google identity verification failed');
  const result = await resolveOAuthUser({ provider: 'google', ...identity, allowCreate: !transaction.admin });
  const { user, created } = result;
  if (created) recordAuditEvent(req, 'ACCOUNT_CREATED', user.id, { provider: 'google' });
  if (transaction.admin && user.role !== 'admin') return finishOAuthRedirect(res, transaction, null, 'This account is not authorized for admin access');
  recordAuditEvent(req, 'GOOGLE_LOGIN', user.id, { provider: 'google' });
  return finishOAuthRedirect(res, transaction, await createOAuthSessionCode(user, transaction.returnTo, transaction.admin));
};

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    return await handleGoogleCallback(req, res);
  } catch (error) {
    recordAuditEvent(req, 'LOGIN_FAILED', null, { provider: 'google' });
    return res.redirect(`${FRONTEND_URL}/auth/callback?error=${encodeURIComponent('Google sign-in failed')}&provider=google`);
  }
});

const handleAppleCallback = async (req, res) => {
  const transaction = await consumeOAuthTransaction(req.body?.state || req.query.state, 'apple');
  if (req.body?.error || req.query.error) return finishOAuthRedirect(res, transaction, null, 'Apple sign-in was cancelled');
  const identity = await exchangeAppleCode(req.body?.code || req.query.code, transaction, req.body?.user);
  if (identity.nonce !== transaction.nonce) throw new Error('Apple identity verification failed');
  const result = await resolveOAuthUser({ provider: 'apple', ...identity, allowCreate: !transaction.admin });
  const { user, created } = result;
  if (created) recordAuditEvent(req, 'ACCOUNT_CREATED', user.id, { provider: 'apple' });
  if (transaction.admin && user.role !== 'admin') return finishOAuthRedirect(res, transaction, null, 'This account is not authorized for admin access');
  recordAuditEvent(req, 'APPLE_LOGIN', user.id, { provider: 'apple' });
  return finishOAuthRedirect(res, transaction, await createOAuthSessionCode(user, transaction.returnTo, transaction.admin));
};

app.get('/api/auth/apple/callback', async (req, res) => {
  try {
    return await handleAppleCallback(req, res);
  } catch (error) {
    recordAuditEvent(req, 'LOGIN_FAILED', null, { provider: 'apple' });
    return res.redirect(`${FRONTEND_URL}/auth/callback?error=${encodeURIComponent('Apple sign-in failed')}&provider=apple`);
  }
});

app.post('/api/auth/apple/callback', async (req, res) => {
  try {
    return await handleAppleCallback(req, res);
  } catch (error) {
    recordAuditEvent(req, 'LOGIN_FAILED', null, { provider: 'apple' });
    return res.redirect(`${FRONTEND_URL}/auth/callback?error=${encodeURIComponent('Apple sign-in failed')}&provider=apple`);
  }
});

app.post('/api/auth/oauth/exchange', async (req, res) => {
  const session = await consumeOAuthSession(req.body?.code);
  if (!session) return res.status(400).json({ message: 'Invalid or expired OAuth session' });

  const user = await getUserById(session.userId);
  if (!user || user.status !== 'active' || (session.admin && user.role !== 'admin')) {
    return res.status(403).json({ message: 'This account is not authorized for access' });
  }

  await issueSession(user, req, res);
  return res.json({ user: publicUser(user), redirectTo: session.returnTo });
});

app.post('/api/auth/google', (_, res) => res.status(410).json({ message: 'Use the OAuth authorization flow' }));

app.post('/api/auth/admin/google', (_, res) => res.status(410).json({ message: 'Use the OAuth authorization flow' }));

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const rawToken = req.cookies[SESSION_COOKIE_NAME];
  return revokeAuthSession(hashSessionToken(rawToken))
    .then(() => {
      res.clearCookie(SESSION_COOKIE_NAME, { httpOnly: true, secure: IS_PRODUCTION, sameSite: 'lax', path: '/' });
      recordAuditEvent(req, 'LOGOUT', req.user.id);
      return res.json({ ok: true, message: 'Logged out successfully' });
    });
});

app.post('/api/auth/logout-all', authMiddleware, async (req, res) => {
  await revokeAllAuthSessions(req.user.id);
  res.clearCookie(SESSION_COOKIE_NAME, { httpOnly: true, secure: IS_PRODUCTION, sameSite: 'lax', path: '/' });
  recordAuditEvent(req, 'LOGOUT_ALL', req.user.id);
  return res.json({ ok: true, message: 'All sessions revoked' });
});

app.post('/api/admin/vehicles', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vehicle = await createVehicle(req.body);
    recordAuditEvent(req, 'ADMIN_ACTION', req.user.id, { metadata: { action: 'vehicle_create', vehicleId: vehicle.id } });
    return res.status(201).json({ vehicle });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create vehicle' });
  }
});

app.put('/api/admin/vehicles/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vehicle = await updateVehicle(req.params.id, req.body);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    recordAuditEvent(req, 'ADMIN_ACTION', req.user.id, { metadata: { action: 'vehicle_update', vehicleId: vehicle.id } });
    return res.json({ vehicle });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update vehicle' });
  }
});

app.delete('/api/admin/vehicles/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await deleteVehicle(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Vehicle not found' });
    recordAuditEvent(req, 'ADMIN_ACTION', req.user.id, { metadata: { action: 'vehicle_delete', vehicleId: Number(req.params.id) } });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(409).json({ message: 'Vehicle cannot be deleted while it has bookings' });
  }
});

app.get('/api/vehicles', async (req, res) => {
  const { brand, fuel, transmission, minPrice, maxPrice, type, minYear, search } = req.query;

  const vehicles = await listVehicles({
    brand,
    fuel,
    transmission,
    minPrice,
    maxPrice,
    type,
    minYear,
    search,
  });

  res.json({ vehicles });
});

app.get('/api/vehicles/:id', async (req, res) => {
  const vehicle = await getVehicleById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  return res.json({ vehicle });
});

app.get('/api/vehicles/featured', async (req, res) => {
  const limit = Number(req.query.limit || 10);
  res.json({ vehicles: await getFeaturedVehicles(limit) });
});

app.post('/api/bookings/test-drive', authMiddleware, async (req, res) => {
  const { vehicleId, date, time, notes } = req.body || {};

  if (!vehicleId || !date || !time) {
    return res.status(400).json({ message: 'Vehicle, date, and time are required' });
  }

  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  try {
    const booking = await createBooking({
      vehicleId: vehicle.id,
      userId: req.user.id,
      date,
      time,
      notes: notes || '',
      type: 'test-drive',
    });

    io.emit('booking:updated', { booking, vehicleId: vehicle.id, status: booking.status });
    io.emit('vehicle:availability', { vehicleId: vehicle.id, available: false, status: 'booked' });

    return res.status(201).json({ booking });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to create booking' });
  }
});

app.get('/api/bookings/user', authMiddleware, async (req, res) => {
  const userBookings = await getBookingsByUser(req.user.id);
  res.json({ bookings: userBookings });
});

app.patch('/api/bookings/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body || {};
  const booking = await getBookingById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const updatedBooking = await updateBookingStatus(booking.id, status);
  if (!updatedBooking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const vehicle = await getVehicleById(updatedBooking.vehicleId);
  io.emit('booking:updated', { booking: updatedBooking, vehicleId: updatedBooking.vehicleId, status: updatedBooking.status });
  io.emit('vehicle:availability', { vehicleId: updatedBooking.vehicleId, available: vehicle?.available ?? false, status: vehicle?.status || 'booked' });

  res.json({ booking: updatedBooking });
});

io.on('connection', (socket) => {
  socket.on('join:room', (room) => {
    if (room) socket.join(room);
  });

  socket.on('ping', (payload, callback) => {
    if (typeof callback === 'function') callback({ ok: true, payload });
  });
});

app.use((error, req, res, next) => {
  if (error?.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  console.error('Unhandled API error:', error);
  return res.status(error.status || 500).json({ message: 'Internal server error' });
});

await initDatabase();
await seedVehicles();
await ensureDemoUser();

export { app };

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Drive-me API listening on http://localhost:${PORT}`);
  });
}
