import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resetDatabaseForTests,
  createUser,
  getUserByEmail,
  createBooking,
  getBookingsByUser,
  getVehicleById,
} from '../database/db.js';

test('auth and booking records persist in Postgres instead of memory', async () => {
  await resetDatabaseForTests();

  const user = await createUser({
    name: 'Postgres User',
    email: 'postgres@example.com',
    password: 'supersecret',
    phone: '123456789',
    role: 'customer',
  });

  assert.ok(user.id);
  assert.equal(user.email, 'postgres@example.com');

  const storedUser = await getUserByEmail('postgres@example.com');
  assert.equal(storedUser.email, 'postgres@example.com');
  assert.notEqual(storedUser.passwordHash, 'supersecret');

  const booking = await createBooking({
    vehicleId: 1,
    userId: user.id,
    date: '2026-09-15',
    time: '10:30',
    notes: 'Need a test drive',
    type: 'test-drive',
  });

  assert.equal(booking.status, 'pending');
  assert.equal((await getBookingsByUser(user.id)).length, 1);
  assert.equal((await getVehicleById(1)).status, 'booked');
});

test('user roles and booking status values are restricted to valid domain values', async () => {
  await resetDatabaseForTests();

  await assert.rejects(
    () => createUser({
      name: 'Bad Role',
      email: 'bad-role@example.com',
      password: 'secret',
      role: 'ghost',
    }),
    /Invalid user role/i,
  );

  const user = await createUser({
    name: 'Role User',
    email: 'role-user@example.com',
    password: 'secret',
    role: 'dealer',
  });

  await assert.rejects(
    () => createBooking({
      vehicleId: 1,
      userId: user.id,
      date: '2026-09-18',
      time: '14:00',
      status: 'unknown',
    }),
    /Invalid booking status/i,
  );
});
