import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.TRUST_PROXY_HOPS = '1';
process.env.GOOGLE_CLIENT_ID = 'test-google-client';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.APPLE_CLIENT_ID = 'com.example.test';

const { app, setOAuthTestOverrides } = await import('../server/index.js');
const { setEmailTestSink } = await import('../services/email.js');
const {
  createAuthSession,
  createPasswordResetToken,
  createUser,
  getUserByEmail,
  getUserByOAuthAccount,
  resetDatabaseForTests,
} = await import('../database/db.js');

let sequence = 0;
let lastResetUrl = null;
const nextIp = () => `198.51.100.${++sequence}`;
const agentFor = () => ({ agent: request.agent(app), ip: nextIp() });

const csrf = async ({ agent, ip }) => {
  const response = await agent.get('/api/auth/csrf-token').set('X-Forwarded-For', ip);
  assert.equal(response.status, 200);
  return response.body.csrfToken;
};

const startOAuth = async ({ agent, ip }, provider, admin = false) => {
  const response = await agent
    .get(`/api/auth/${provider}/start?returnTo=%2Fdashboard${admin ? '&admin=true' : ''}`)
    .set('X-Forwarded-For', ip);
  assert.equal(response.status, 200);
  const authorizationUrl = new URL(response.body.authorizationUrl);
  return authorizationUrl.searchParams.get('state');
};

const exchangeOAuth = async ({ agent, ip }, code) => {
  const csrfToken = await csrf({ agent, ip });
  return agent
    .post('/api/auth/oauth/exchange')
    .set('X-Forwarded-For', ip)
    .set('X-CSRF-Token', csrfToken)
    .send({ code });
};

const login = async ({ agent, ip }, email = 'demo@example.com', password = 'password123') => {
  const csrfToken = await csrf({ agent, ip });
  const response = await agent
    .post('/api/auth/login')
    .set('X-Forwarded-For', ip)
    .set('X-CSRF-Token', csrfToken)
    .send({ email, password });
  assert.equal(response.status, 200);
  return csrfToken;
};

const callbackCode = (response) => {
  assert.equal(response.status, 302);
  return new URL(response.headers.location).searchParams.get('code');
};

test.beforeEach(async () => {
  await resetDatabaseForTests();
  setOAuthTestOverrides();
  lastResetUrl = null;
  setEmailTestSink(async ({ resetUrl }) => {
    lastResetUrl = resetUrl;
  });
});

test('successful password login creates a backend session', async () => {
  const context = agentFor();
  await login(context);
  const response = await context.agent.get('/api/auth/me').set('X-Forwarded-For', context.ip);
  assert.equal(response.status, 200);
  assert.equal(response.body.user.email, 'demo@example.com');
  assert.equal(response.body.user.passwordHash, undefined);
});

test('successful Google login verifies through the callback and exchanges a one-time session code', async () => {
  const context = agentFor();
  setOAuthTestOverrides({
    google: async (code, transaction) => ({
      providerUserId: `google-${code}`,
      name: 'Google User',
      email: `${code}@example.com`,
      emailVerified: true,
      nonce: transaction.nonce,
    }),
  });
  const state = await startOAuth(context, 'google');
  const callback = await context.agent.get(`/api/auth/google/callback?state=${state}&code=success`).set('X-Forwarded-For', context.ip);
  const sessionCode = callbackCode(callback);
  const exchange = await exchangeOAuth(context, sessionCode);
  assert.equal(exchange.status, 200);
  assert.equal(exchange.body.user.email, 'success@example.com');
  assert.equal(exchange.body.token, undefined);
});

test('failed Google login rejects an invalid nonce', async () => {
  const context = agentFor();
  setOAuthTestOverrides({
    google: async () => ({ providerUserId: 'google-invalid-nonce', name: 'User', email: 'invalid-nonce@example.com', emailVerified: true, nonce: 'wrong' }),
  });
  const state = await startOAuth(context, 'google');
  const callback = await context.agent.get(`/api/auth/google/callback?state=${state}&code=bad-nonce`).set('X-Forwarded-For', context.ip);
  assert.match(new URL(callback.headers.location).searchParams.get('error'), /Google sign-in failed/);
});

test('successful Apple login supports first-use name data', async () => {
  const context = agentFor();
  setOAuthTestOverrides({
    apple: async (code, transaction, rawUser) => ({
      providerUserId: `apple-${code}`,
      name: JSON.parse(rawUser).name.firstName,
      email: 'relay@privaterelay.appleid.com',
      emailVerified: true,
      nonce: transaction.nonce,
    }),
  });
  const state = await startOAuth(context, 'apple');
  const callback = await context.agent
    .post('/api/auth/apple/callback')
    .set('X-Forwarded-For', context.ip)
    .type('form')
    .send({ state, code: 'apple-success', user: JSON.stringify({ name: { firstName: 'Apple User' } }) });
  const exchange = await exchangeOAuth(context, callbackCode(callback));
  assert.equal(exchange.status, 200);
  assert.equal(exchange.body.user.name, 'Apple User');
});

test('failed Apple login rejects an invalid nonce', async () => {
  const context = agentFor();
  setOAuthTestOverrides({
    apple: async () => ({ providerUserId: 'apple-invalid-nonce', name: 'User', email: 'apple-invalid@example.com', emailVerified: true, nonce: 'wrong' }),
  });
  const state = await startOAuth(context, 'apple');
  const callback = await context.agent.post('/api/auth/apple/callback').set('X-Forwarded-For', context.ip).type('form').send({ state, code: 'bad-apple' });
  assert.match(new URL(callback.headers.location).searchParams.get('error'), /Apple sign-in failed/);
});

test('invalid OAuth state is rejected', async () => {
  const response = await request(app).get('/api/auth/google/callback?state=unknown&code=code');
  assert.equal(response.status, 302);
  assert.match(response.headers.location, /Google%20sign-in%20failed/);
});

test('invalid audience and issuer verification failures are not exposed', async () => {
  const context = agentFor();
  setOAuthTestOverrides({ google: async () => { throw new Error('invalid audience'); } });
  const googleState = await startOAuth(context, 'google');
  const googleResponse = await context.agent.get(`/api/auth/google/callback?state=${googleState}&code=audience`).set('X-Forwarded-For', context.ip);
  assert.match(googleResponse.headers.location, /Google%20sign-in%20failed/);

  setOAuthTestOverrides({ apple: async () => { throw new Error('invalid issuer'); } });
  const appleState = await startOAuth(context, 'apple');
  const appleResponse = await context.agent.post('/api/auth/apple/callback').set('X-Forwarded-For', context.ip).type('form').send({ state: appleState, code: 'issuer' });
  assert.match(appleResponse.headers.location, /Apple%20sign-in%20failed/);
});

test('invalid or expired session tokens are rejected', async () => {
  const invalid = await request(app).get('/api/auth/me').set('Cookie', 'drive-me-session=invalid-token');
  assert.equal(invalid.status, 401);

  const expiredRaw = 'expired-session-token';
  const demoUser = await getUserByEmail('demo@example.com');
  await createAuthSession({ tokenHash: crypto.createHash('sha256').update(expiredRaw).digest('hex'), userId: demoUser.id, expiresAt: new Date(Date.now() - 1000) });
  const expired = await request(app).get('/api/auth/me').set('Cookie', `drive-me-session=${expiredRaw}`);
  assert.equal(expired.status, 401);
});

test('unauthorized API access is rejected', async () => {
  const response = await request(app).get('/api/auth/me');
  assert.equal(response.status, 401);
});

test('normal users cannot access admin vehicle endpoints', async () => {
  const context = agentFor();
  const csrfToken = await login(context);
  const response = await context.agent.post('/api/admin/vehicles').set('X-Forwarded-For', context.ip).set('X-CSRF-Token', csrfToken).send({ name: 'Nope', brand: 'Nope', model: 'Nope' });
  assert.equal(response.status, 403);
});

test('logout invalidates the current session', async () => {
  const context = agentFor();
  const csrfToken = await login(context);
  const logout = await context.agent.post('/api/auth/logout').set('X-Forwarded-For', context.ip).set('X-CSRF-Token', csrfToken);
  assert.equal(logout.status, 200);
  assert.equal((await context.agent.get('/api/auth/me').set('X-Forwarded-For', context.ip)).status, 401);
});

test('logout-all invalidates sessions on all devices', async () => {
  const first = agentFor();
  const second = agentFor();
  const firstCsrf = await login(first);
  await login(second);
  const logoutAll = await first.agent.post('/api/auth/logout-all').set('X-Forwarded-For', first.ip).set('X-CSRF-Token', firstCsrf);
  assert.equal(logoutAll.status, 200);
  assert.equal((await second.agent.get('/api/auth/me').set('X-Forwarded-For', second.ip)).status, 401);
});

test('OAuth account with an existing email is not automatically linked', async () => {
  await createUser({ name: 'Existing', email: 'existing@example.com', password: 'password123', role: 'customer' });
  const context = agentFor();
  setOAuthTestOverrides({ google: async (code, transaction) => ({ providerUserId: `unlinked-${code}`, name: 'OAuth', email: 'existing@example.com', emailVerified: true, nonce: transaction.nonce }) });
  const state = await startOAuth(context, 'google');
  const callback = await context.agent.get(`/api/auth/google/callback?state=${state}&code=existing`).set('X-Forwarded-For', context.ip);
  assert.match(new URL(callback.headers.location).searchParams.get('error'), /Google sign-in failed/);
  assert.equal(await getUserByOAuthAccount('google', 'unlinked-existing'), null);
});

test('CSRF protection rejects state-changing requests without a token', async () => {
  const response = await request(app).post('/api/auth/login').send({ email: 'demo@example.com', password: 'password123' });
  assert.equal(response.status, 403);
});

test('rate limiting protects repeated login attempts', async () => {
  const context = agentFor();
  const csrfToken = await csrf(context);
  let lastResponse;
  for (let attempt = 0; attempt < 11; attempt += 1) {
    lastResponse = await context.agent.post('/api/auth/login').set('X-Forwarded-For', context.ip).set('X-CSRF-Token', csrfToken).send({ email: 'wrong@example.com', password: 'wrongpass' });
  }
  assert.equal(lastResponse.status, 429);
});

test('successful password reset sends a link, changes the password, and revokes sessions', async () => {
  const oldSession = agentFor();
  await login(oldSession);
  const resetContext = agentFor();
  const csrfToken = await csrf(resetContext);
  const forgot = await resetContext.agent.post('/api/auth/forgot-password').set('X-Forwarded-For', resetContext.ip).set('X-CSRF-Token', csrfToken).send({ email: 'demo@example.com' });
  assert.equal(forgot.status, 200);
  assert.match(forgot.body.message, /If an account exists/);
  assert.ok(lastResetUrl);

  const resetToken = new URL(lastResetUrl).searchParams.get('token');
  const resetCsrf = await csrf(resetContext);
  const reset = await resetContext.agent.post('/api/auth/reset-password').set('X-Forwarded-For', resetContext.ip).set('X-CSRF-Token', resetCsrf).send({ token: resetToken, newPassword: 'new-password-123' });
  assert.equal(reset.status, 200);
  assert.equal((await oldSession.agent.get('/api/auth/me').set('X-Forwarded-For', oldSession.ip)).status, 401);

  const reused = await resetContext.agent.post('/api/auth/reset-password').set('X-Forwarded-For', resetContext.ip).set('X-CSRF-Token', resetCsrf).send({ token: resetToken, newPassword: 'another-password-123' });
  assert.equal(reused.status, 400);

  const newLogin = agentFor();
  await login(newLogin, 'demo@example.com', 'new-password-123');
});

test('expired and invalid password reset tokens are rejected', async () => {
  const user = await getUserByEmail('demo@example.com');
  const expiredRaw = 'expired-reset-token';
  await createPasswordResetToken({ tokenHash: crypto.createHash('sha256').update(expiredRaw).digest('base64url'), userId: user.id, expiresAt: new Date(Date.now() - 1000) });
  const context = agentFor();
  const csrfToken = await csrf(context);
  const expired = await context.agent.post('/api/auth/reset-password').set('X-Forwarded-For', context.ip).set('X-CSRF-Token', csrfToken).send({ token: expiredRaw, newPassword: 'new-password-123' });
  assert.equal(expired.status, 400);
  const invalid = await context.agent.post('/api/auth/reset-password').set('X-Forwarded-For', context.ip).set('X-CSRF-Token', csrfToken).send({ token: 'does-not-exist', newPassword: 'new-password-123' });
  assert.equal(invalid.status, 400);
});

test('forgot-password does not reveal whether an account exists', async () => {
  const existing = agentFor();
  const existingCsrf = await csrf(existing);
  const existingResponse = await existing.agent.post('/api/auth/forgot-password').set('X-Forwarded-For', existing.ip).set('X-CSRF-Token', existingCsrf).send({ email: 'demo@example.com' });
  const missing = agentFor();
  const missingCsrf = await csrf(missing);
  const missingResponse = await missing.agent.post('/api/auth/forgot-password').set('X-Forwarded-For', missing.ip).set('X-CSRF-Token', missingCsrf).send({ email: 'missing@example.com' });
  assert.equal(existingResponse.status, missingResponse.status);
  assert.deepEqual(existingResponse.body, missingResponse.body);
});

test('password reset requests are rate limited', async () => {
  const context = agentFor();
  const csrfToken = await csrf(context);
  let lastResponse;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    lastResponse = await context.agent.post('/api/auth/forgot-password').set('X-Forwarded-For', context.ip).set('X-CSRF-Token', csrfToken).send({ email: 'missing@example.com' });
  }
  assert.equal(lastResponse.status, 429);
});
