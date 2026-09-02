import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Server } from 'socket.io';
import axios from 'axios';
import {
  createBooking,
  createVehicle,
  createUser,
  ensureDemoUser,
  getBookingById,
  getBookingsByUser,
  getFeaturedVehicles,
  getUserByEmail,
  getUserByGoogleId,
  getUserById,
  getVehicleById,
  initDatabase,
  listVehicles,
  seedVehicles,
  updateBookingStatus,
  updateVehicle,
  deleteVehicle,
} from '../database/db.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'drive-me-dev-secret';

app.use(cors());
app.use(express.json());

const createToken = (user) => jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
  expiresIn: '7d',
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'drive-me-api' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = createToken(user);
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token,
  });
});

app.post('/api/auth/admin/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await getUserByEmail(email);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = createToken(user);
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token,
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone, role = 'customer' } = req.body || {};
  const registrationRole = role === 'dealer' ? 'dealer' : 'customer';

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const newUser = await createUser({ name, email, password, phone, role: registrationRole });
    const token = createToken(newUser);

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    if (error.message === 'An account with this email already exists') {
      return res.status(409).json({ message: error.message });
    }

    return res.status(400).json({ message: error.message || 'Unable to create account' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body || {};

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    // Verify the credential with Google
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ message: 'Google OAuth is not configured on the server' });
    }

    // Decode without verification first to get the JWT structure
    const parts = credential.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ message: 'Invalid Google credential format' });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Verify the token signature with Google
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
      { timeout: 5000 }
    );

    if (response.data.aud !== googleClientId) {
      return res.status(400).json({ message: 'Google credential audience mismatch' });
    }

    // At this point, the credential is verified by Google
    const { email, sub: googleId, name, picture } = response.data;

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Invalid Google credential payload' });
    }

    const existingByEmail = await getUserByEmail(email);
    const existingByGoogle = await getUserByGoogleId(googleId);
    const user = existingByGoogle || existingByEmail || await createUser({
      name: name || 'Google User',
      email,
      password: `google-${googleId}`,
      phone: '',
      role: 'customer',
      authProvider: 'google',
      providerId: String(googleId),
    });

    const token = createToken(user);
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authProvider: user.authProvider,
        picture: picture || null,
      },
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error.message);

    if (error.response?.status === 400) {
      return res.status(401).json({ message: 'Invalid or expired Google credential' });
    }

    return res.status(400).json({ message: error.message || 'Unable to sign in with Google' });
  }
});

app.post('/api/auth/admin/google', async (req, res) => {
  const { credential } = req.body || {};

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ message: 'Google OAuth is not configured on the server' });
    }

    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
      { timeout: 5000 }
    );

    if (response.data.aud !== googleClientId) {
      return res.status(400).json({ message: 'Google credential audience mismatch' });
    }

    const { email, sub: googleId, picture } = response.data;
    const user = (await getUserByGoogleId(googleId)) || (await getUserByEmail(email));

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'This Google account is not authorized for admin access' });
    }

    const token = createToken(user);
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authProvider: user.authProvider,
        picture: picture || null,
      },
      token,
    });
  } catch (error) {
    console.error('Admin Google auth error:', error.message);

    if (error.response?.status === 400) {
      return res.status(401).json({ message: 'Invalid or expired Google credential' });
    }

    return res.status(400).json({ message: error.message || 'Unable to sign in with Google' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await getUserById(req.user.sub);
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
    },
  });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  res.json({ ok: true, message: 'Logged out successfully' });
});

app.post('/api/admin/vehicles', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    return res.status(201).json({ vehicle: await createVehicle(req.body) });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to create vehicle' });
  }
});

app.put('/api/admin/vehicles/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vehicle = await updateVehicle(req.params.id, req.body);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    return res.json({ vehicle });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to update vehicle' });
  }
});

app.delete('/api/admin/vehicles/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await deleteVehicle(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Vehicle not found' });
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
      userId: req.user.sub,
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
  const userBookings = await getBookingsByUser(req.user.sub);
  res.json({ bookings: userBookings });
});

app.patch('/api/bookings/:id/status', authMiddleware, async (req, res) => {
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

await initDatabase();
await seedVehicles();
await ensureDemoUser();

server.listen(PORT, () => {
  console.log(`Drive-me API listening on http://localhost:${PORT}`);
});
