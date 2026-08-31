import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const defaultConnectionString = `postgresql://${process.env.USER || 'genehacqman'}@localhost:5432/${process.env.PGDATABASE || 'showroom'}`;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || defaultConnectionString,
});

const VALID_USER_ROLES = ['customer', 'dealer', 'admin'];
const VALID_BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

const normalizeUserRole = (role) => {
  const value = String(role || 'customer').toLowerCase();
  if (!VALID_USER_ROLES.includes(value)) {
    throw new Error('Invalid user role');
  }
  return value;
};

const normalizeBookingStatus = (status) => {
  const value = String(status || 'pending').toLowerCase();
  if (!VALID_BOOKING_STATUSES.includes(value)) {
    throw new Error('Invalid booking status');
  }
  return value;
};

const serializeJson = (value) => JSON.stringify(value ?? null);

const parseJson = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  return value;
};

const liftVehicle = (row) => {
  if (!row) return null;

  return {
    id: Number(row.id),
    name: row.name,
    brand: row.brand,
    model: row.model,
    year: Number(row.year),
    price: Number(row.price),
    rentalPrice: Number(row.rental_price),
    image: row.image,
    category: row.category,
    type: row.type,
    fuel: row.fuel,
    transmission: row.transmission,
    mileage: Number(row.mileage),
    seats: Number(row.seats),
    horsepower: Number(row.horsepower),
    color: row.color,
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    featured: Boolean(row.featured),
    available: Boolean(row.available),
    status: row.status,
    specs: parseJson(row.specs, {}),
    features: parseJson(row.features, []),
    description: row.description,
  };
};

const liftBooking = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    vehicleId: Number(row.vehicle_id),
    userId: row.user_id,
    type: row.type,
    date: row.date,
    time: row.time,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  };
};

const liftUser = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone,
    role: row.role,
    authProvider: row.auth_provider,
    providerId: row.provider_id,
    createdAt: row.created_at,
  };
};

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(trim(name)) > 0),
      email TEXT UNIQUE NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
      password_hash TEXT NOT NULL CHECK (length(password_hash) > 0),
      phone TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'dealer', 'admin')),
      auth_provider TEXT NOT NULL DEFAULT 'local' CHECK (auth_provider IN ('local', 'google')),
      provider_id TEXT DEFAULT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'local';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id TEXT DEFAULT NULL;

    UPDATE users
    SET auth_provider = 'local'
    WHERE auth_provider IS NULL;

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      price NUMERIC(12,2) CHECK (price >= 0),
      rental_price NUMERIC(12,2) CHECK (rental_price >= 0),
      image TEXT,
      category TEXT,
      type TEXT,
      fuel TEXT,
      transmission TEXT,
      mileage INTEGER CHECK (mileage >= 0),
      seats INTEGER CHECK (seats > 0),
      horsepower INTEGER CHECK (horsepower >= 0),
      color TEXT,
      rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 5),
      reviews INTEGER CHECK (reviews >= 0),
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      available BOOLEAN NOT NULL DEFAULT TRUE,
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'maintenance')),
      specs JSONB NOT NULL DEFAULT '{}'::jsonb,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL CHECK (type IN ('test-drive', 'purchase', 'rental')),
      date DATE NOT NULL,
      time TEXT NOT NULL,
      notes TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_identity ON users (auth_provider, provider_id)
      WHERE provider_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings (vehicle_id);
  `);
}

const VEHICLE_SEED_DATA = [
  {
    id: 1,
    name: 'Changan Hunter',
    brand: 'Changan',
    model: 'Hunter',
    year: 2024,
    price: 28990,
    rental_price: 125,
    image: 'https://ik.imagekit.io/genescreative/Changan_Hunter.png?updatedAt=1785185291568',
    category: 'suv',
    type: 'suv',
    fuel: 'gasoline',
    transmission: 'automatic',
    mileage: 18500,
    seats: 5,
    horsepower: 190,
    color: 'Silver',
    rating: 4.6,
    reviews: 118,
    featured: true,
    available: true,
    specs: { acceleration: '0-60 mph in 8.7s', range: 'N/A', topSpeed: '115 mph', engineType: '2.0L Turbo' },
    features: ['Panoramic Roof', 'Smart Infotainment', 'Rear Camera', 'Adaptive Cruise'],
    description: 'A bold SUV with premium comfort and modern styling for everyday driving.',
  },
  {
    id: 2,
    name: 'Ford Handiri',
    brand: 'Ford',
    model: 'Handiri',
    year: 2024,
    price: 32990,
    rental_price: 135,
    image: 'https://ik.imagekit.io/genescreative/FORD%20HANDIRI.png?updatedAt=1785185290974',
    category: 'suv',
    type: 'suv',
    fuel: 'gasoline',
    transmission: 'automatic',
    mileage: 14200,
    seats: 5,
    horsepower: 210,
    color: 'Blue',
    rating: 4.5,
    reviews: 132,
    featured: true,
    available: true,
    specs: { acceleration: '0-60 mph in 8.2s', topSpeed: '120 mph', engineType: '2.0L Turbo' },
    features: ['Spacious Cabin', 'Driver Assist', 'Alloy Wheels', 'Bluetooth'],
    description: 'A contemporary SUV with strong road presence and comfort-focused features.',
  },
  {
    id: 3,
    name: 'BMW Series 7',
    brand: 'BMW',
    model: 'Series 7',
    year: 2024,
    price: 94500,
    rental_price: 240,
    image: 'https://ik.imagekit.io/genescreative/BMW%20SERIES%207.png?updatedAt=1785185290378',
    category: 'luxury',
    type: 'sedan',
    fuel: 'gasoline',
    transmission: 'automatic',
    mileage: 9100,
    seats: 5,
    horsepower: 375,
    color: 'Black',
    rating: 4.8,
    reviews: 204,
    featured: true,
    available: true,
    specs: { acceleration: '0-60 mph in 4.9s', topSpeed: '155 mph', engineType: '3.0L Twin-Turbo' },
    features: ['Luxury Cabin', 'Ambient Lighting', 'Premium Audio', 'Adaptive Suspension'],
    description: 'A flagship sedan that combines executive luxury with confident performance.',
  },
  {
    id: 4,
    name: 'Changan Uni-V',
    brand: 'Changan',
    model: 'Uni-V',
    year: 2024,
    price: 27990,
    rental_price: 120,
    image: 'https://ik.imagekit.io/genescreative/Changan_Uni-V.png?updatedAt=1785185289921',
    category: 'hatchback',
    type: 'hatchback',
    fuel: 'gasoline',
    transmission: 'automatic',
    mileage: 16700,
    seats: 5,
    horsepower: 180,
    color: 'White',
    rating: 4.4,
    reviews: 96,
    featured: false,
    available: true,
    specs: { acceleration: '0-60 mph in 8.1s', topSpeed: '110 mph', engineType: '1.5L Turbo' },
    features: ['Compact Design', 'Efficient Engine', 'Smart Key', 'Rear Sensors'],
    description: 'An efficient modern hatchback designed for urban comfort and practicality.',
  },
  {
    id: 5,
    name: 'Rare Dodge',
    brand: 'Dodge',
    model: 'Special',
    year: 2023,
    price: 68900,
    rental_price: 210,
    image: 'https://ik.imagekit.io/genescreative/rare_dodges.png?updatedAt=1785185289868',
    category: 'sports',
    type: 'coupe',
    fuel: 'gasoline',
    transmission: 'automatic',
    mileage: 4300,
    seats: 4,
    horsepower: 480,
    color: 'Orange',
    rating: 4.7,
    reviews: 145,
    featured: true,
    available: true,
    specs: { acceleration: '0-60 mph in 4.0s', topSpeed: '155 mph', engineType: 'V8' },
    features: ['Performance Exhaust', 'Sport Seats', 'LED Headlights', 'Premium Interior'],
    description: 'A striking performance coupe with aggressive styling and commanding presence.',
  },
  {
    id: 6,
    name: 'Toyota Supra Mk5',
    brand: 'Toyota',
    model: 'Supra Mk5',
    year: 2024,
    price: 71990,
    rental_price: 220,
    image: 'https://ik.imagekit.io/genescreative/TOYOTA%20Supra_mk5.png?updatedAt=1785185289848',
    category: 'sports',
    type: 'coupe',
    fuel: 'gasoline',
    transmission: 'automatic',
    mileage: 6100,
    seats: 2,
    horsepower: 382,
    color: 'Gray',
    rating: 4.8,
    reviews: 188,
    featured: true,
    available: true,
    specs: { acceleration: '0-60 mph in 4.1s', topSpeed: '155 mph', engineType: 'B58 Turbo' },
    features: ['Launch Control', 'Active Rear Spoiler', 'Leather Seats', 'Digital Cockpit'],
    description: 'A modern legend with sharp handling and unmistakable coupe styling.',
  },
  {
    id: 7,
    name: 'Dodge Viper ACR',
    brand: 'Dodge',
    model: 'Viper ACR',
    year: 2023,
    price: 119500,
    rental_price: 320,
    image: 'https://ik.imagekit.io/genescreative/Dodge_Viper_ACR.png?updatedAt=1785185289453',
    category: 'sports',
    type: 'coupe',
    fuel: 'gasoline',
    transmission: 'manual',
    mileage: 2900,
    seats: 2,
    horsepower: 645,
    color: 'Red',
    rating: 4.9,
    reviews: 214,
    featured: true,
    available: true,
    specs: { acceleration: '0-60 mph in 3.3s', topSpeed: '177 mph', engineType: 'V10' },
    features: ['Track Focused', 'Carbon Fiber', 'Racing Seats', 'Performance Brakes'],
    description: 'An uncompromising supercar designed for enthusiasts who want pure adrenaline.',
  },
  {
    id: 8,
    name: 'BMW M8',
    brand: 'BMW',
    model: 'M8',
    year: 2024,
    price: 138900,
    rental_price: 360,
    image: 'https://ik.imagekit.io/genescreative/BMW_M8.png?updatedAt=1785185289391',
    category: 'luxury',
    type: 'coupe',
    fuel: 'gasoline',
    transmission: 'automatic',
    mileage: 5400,
    seats: 4,
    horsepower: 617,
    color: 'Silver',
    rating: 4.8,
    reviews: 162,
    featured: true,
    available: true,
    specs: { acceleration: '0-60 mph in 3.0s', topSpeed: '190 mph', engineType: 'V8 Twin-Turbo' },
    features: ['M Sport Steering', 'Adaptive Cruise', 'Luxury Interior', 'Bowers & Wilkins'],
    description: 'An elegant grand tourer with breathtaking pace and premium comfort.',
  },
  {
    id: 9,
    name: 'Dodge Hellcat',
    brand: 'Dodge',
    model: 'Hellcat',
    year: 2023,
    price: 79900,
    rental_price: 240,
    image: 'https://ik.imagekit.io/genescreative/DODGE%20hellcat.png?updatedAt=1785185289191',
    category: 'sports',
    type: 'coupe',
    fuel: 'gasoline',
    transmission: 'automatic',
    mileage: 7800,
    seats: 4,
    horsepower: 717,
    color: 'Black',
    rating: 4.7,
    reviews: 177,
    featured: false,
    available: true,
    specs: { acceleration: '0-60 mph in 3.6s', topSpeed: '199 mph', engineType: 'Supercharged V8' },
    features: ['SRT Performance', 'Launch Control', 'Carbon Interior', 'Track Mode'],
    description: 'A brute-force super coupe with huge power and unapologetic aggression.',
  },
];

export async function seedVehicles() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM vehicles');
  if (Number(rows[0].count) > 0) {
    return;
  }

  for (const vehicle of VEHICLE_SEED_DATA) {
    await pool.query(
      `INSERT INTO vehicles (
        id, name, brand, model, year, price, rental_price, image, category, type,
        fuel, transmission, mileage, seats, horsepower, color, rating, reviews,
        featured, available, status, specs, features, description
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      )`,
      [
        vehicle.id,
        vehicle.name,
        vehicle.brand,
        vehicle.model,
        vehicle.year,
        vehicle.price,
        vehicle.rental_price,
        vehicle.image,
        vehicle.category,
        vehicle.type,
        vehicle.fuel,
        vehicle.transmission,
        vehicle.mileage,
        vehicle.seats,
        vehicle.horsepower,
        vehicle.color,
        vehicle.rating,
        vehicle.reviews,
        Boolean(vehicle.featured),
        vehicle.available !== false,
        vehicle.status || (vehicle.available !== false ? 'available' : 'booked'),
        serializeJson(vehicle.specs ?? {}),
        serializeJson(vehicle.features ?? []),
        vehicle.description || '',
      ],
    );
  }
}

export async function ensureDemoUser() {
  const existing = await getUserByEmail('demo@example.com');
  if (existing) {
    return existing;
  }

  return createUser({
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    phone: '',
    role: 'customer',
  });
}

export async function resetDatabaseForTests() {
  await initDatabase();
  await pool.query('DELETE FROM bookings; DELETE FROM users; DELETE FROM vehicles;');
  await seedVehicles();
  await ensureDemoUser();
}

export async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [String(email || '')]);
  return liftUser(result.rows[0]);
}

export async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [String(id)]);
  return liftUser(result.rows[0]);
}

export async function getUserByGoogleId(googleId) {
  const result = await pool.query('SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2', ['google', String(googleId)]);
  return liftUser(result.rows[0]);
}

export async function createUser({ name, email, password, phone = '', role = 'customer', authProvider = 'local', providerId = null }) {
  const normalizedEmail = String(email || '').trim();
  const normalizedRole = normalizeUserRole(role);
  const normalizedProvider = authProvider === 'google' ? 'google' : 'local';

  if (!name || !normalizedEmail || !password) {
    throw new Error('Name, email, and password are required');
  }

  const existingByEmail = await getUserByEmail(normalizedEmail);
  if (existingByEmail && normalizedProvider === 'local' && !providerId) {
    throw new Error('An account with this email already exists');
  }

  if (existingByEmail && normalizedProvider === 'google' && !providerId) {
    return existingByEmail;
  }

  if (providerId && normalizedProvider === 'google') {
    const existingByProvider = await getUserByGoogleId(providerId);
    if (existingByProvider) {
      return existingByProvider;
    }
  }

  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const passwordHash = bcrypt.hashSync(String(password), 10);

  await pool.query(
    'INSERT INTO users (id, name, email, password_hash, phone, role, auth_provider, provider_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
    [id, String(name), normalizedEmail, passwordHash, String(phone || ''), normalizedRole, normalizedProvider, providerId ? String(providerId) : null],
  );

  return getUserById(id);
}

export async function listVehicles(filters = {}) {
  const { brand, fuel, transmission, minPrice, maxPrice, type, minYear, search } = filters;
  const clauses = [];
  const params = [];
  let index = 1;

  if (brand) {
    clauses.push(`brand = $${index++}`);
    params.push(brand);
  }

  if (fuel) {
    clauses.push(`fuel = $${index++}`);
    params.push(fuel);
  }

  if (transmission) {
    clauses.push(`transmission = $${index++}`);
    params.push(transmission);
  }

  if (type) {
    clauses.push(`type = $${index++}`);
    params.push(type);
  }

  if (minPrice) {
    clauses.push(`price >= $${index++}`);
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    clauses.push(`price <= $${index++}`);
    params.push(Number(maxPrice));
  }

  if (minYear) {
    clauses.push(`year >= $${index++}`);
    params.push(Number(minYear));
  }

  let sql = 'SELECT * FROM vehicles';
  if (clauses.length) {
    sql += ` WHERE ${clauses.join(' AND ')}`;
  }

  if (search) {
    const term = `%${String(search).toLowerCase()}%`;
    const prefix = clauses.length ? ' AND ' : ' WHERE ';
    sql += `${prefix}(LOWER(name) LIKE $${index} OR LOWER(brand) LIKE $${index} OR LOWER(model) LIKE $${index})`;
    params.push(term);
    index += 1;
  }

  sql += ' ORDER BY id ASC';
  const result = await pool.query(sql, params);
  return result.rows.map((row) => liftVehicle(row));
}

export async function getVehicleById(id) {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [Number(id)]);
  return liftVehicle(result.rows[0]);
}

export async function getFeaturedVehicles(limit = 10) {
  const result = await pool.query('SELECT * FROM vehicles WHERE featured = TRUE ORDER BY id ASC LIMIT $1', [Number(limit)]);
  return result.rows.map((row) => liftVehicle(row));
}

export async function createBooking({ vehicleId, userId, date, time, notes = '', type = 'test-drive', status = 'pending' }) {
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const normalizedStatus = normalizeBookingStatus(status);
  const bookingId = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await pool.query(
    `INSERT INTO bookings (id, vehicle_id, user_id, type, date, time, notes, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
    [bookingId, Number(vehicleId), String(userId), type, String(date), String(time), String(notes || ''), normalizedStatus],
  );

  await pool.query('UPDATE vehicles SET available = FALSE, status = $1 WHERE id = $2', ['booked', Number(vehicleId)]);

  const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  return liftBooking(result.rows[0]);
}

export async function getBookingsByUser(userId) {
  const result = await pool.query('SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC', [String(userId)]);
  return result.rows.map((row) => liftBooking(row));
}

export async function getBookingById(id) {
  const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [String(id)]);
  return liftBooking(result.rows[0]);
}

export async function updateBookingStatus(id, status) {
  const booking = await getBookingById(id);
  if (!booking) {
    return null;
  }

  const normalizedStatus = normalizeBookingStatus(status || booking.status);
  await pool.query('UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2', [normalizedStatus, String(id)]);

  const isAvailable = normalizedStatus === 'confirmed' || normalizedStatus === 'completed';
  await pool.query('UPDATE vehicles SET available = $1, status = $2 WHERE id = $3', [isAvailable, isAvailable ? 'available' : 'booked', booking.vehicleId]);

  return getBookingById(id);
}

export default pool;
