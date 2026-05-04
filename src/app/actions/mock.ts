'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { pool } from '../../../db/client';

export async function seedMockData() {
  try {
    // Let's first make sure we have 20 test users
    const passwordHash = "2fc5aa496e04f89963c2cd1d7826a159:aaadc8d0544f5c6673f43b3af4548a74da2a4d18eb6c6cf850c391ef4b06acc1250a3f9db439e7ac93de60b0f3246c7c03e3d9bfd1a1b8f5ac2c08c3609cdf67";
    
    // We can insert 20 mock users directly if they don't exist
    const names = [
      "Ana García", "Carlos Rodríguez", "Elena Fernández", "Juan Martínez", "María Sánchez", 
      "Pedro Pérez", "Lucía Gómez", "David Martín", "Marta Ruiz", "Javier Díaz",
      "Sara Moreno", "Daniel Muñoz", "Paula Blanco", "Andrés Romero", "Laura Alonso",
      "Pablo Navarro", "Raquel Torres", "Sergio Domínguez", "Cristina Ramos", "Lucas Gil"
    ];

    const [properties] = await pool.query('SELECT id, slug, base_price_cents FROM properties WHERE deleted_at IS NULL') as any[];

    if (!properties || properties.length === 0) {
      throw new Error("Missing properties. Please make sure the DB is seeded first.");
    }

    for (let i = 0; i < names.length; i++) {
      const email = `mockuser${i + 1}@sanmateo.test`;
      const userId = `mock_user_${i + 1}`;
      const guestId = `mock_guest_${i + 1}`;

      // Insert User
      await pool.execute(
        `INSERT INTO "user" (id, name, email, "emailVerified", role) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`,
        [userId, names[i], email, true, i === 0 ? 'admin' : 'user']
      );

      // Insert Account (Better Auth credential)
      await pool.execute(
        `INSERT INTO "account" (id, "accountId", "providerId", "userId", password) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`,
        [`account_mock_${i + 1}`, email, 'credential', userId, passwordHash]
      );

      // User inserted above

      // We'll generate 1 test booking per mock user to light up real booking and revenue streams
      const property = properties[i % properties.length];
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + (i * 4) + 1);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkInDate.getDate() + 4);

      const ref = `INF-MOCK-${1000 + i + 1}`;
      const nights = 4;
      const totalCents = property.base_price_cents * nights;
      const bookingId = `mock_booking_${i + 1}`;

      await pool.execute(
        `INSERT INTO bookings (
          id, reference, property_id, user_id, check_in, check_out, nights, guests,
          nightly_rate_cents, accommodation_cents, total_cents, deposit_percentage,
          deposit_cents, balance_cents, status, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`,
        [
          bookingId, ref, property.id, userId,
          checkInDate.toISOString().split('T')[0],
          checkOutDate.toISOString().split('T')[0],
          nights, JSON.stringify({ adults: 2, children: 0, infants: 0, hasPets: false }),
          property.base_price_cents, totalCents, totalCents, 50,
          Math.floor(totalCents / 2), Math.floor(totalCents / 2),
          i % 3 === 0 ? 'confirmed' : i % 3 === 1 ? 'completed' : 'pending',
          'direct'
        ]
      );

      // Insert deposit payment
      await pool.execute(
        `INSERT INTO payments (id, booking_id, kind, amount_cents, status) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`,
        [`mock_payment_${i + 1}_dep`, bookingId, 'deposit', Math.floor(totalCents / 2), i % 3 === 1 || i % 3 === 0 ? 'succeeded' : 'pending']
      );

      // Insert balance payment
      await pool.execute(
        `INSERT INTO payments (id, booking_id, kind, amount_cents, status) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`,
        [`mock_payment_${i + 1}_bal`, bookingId, 'balance', Math.floor(totalCents / 2), i % 3 === 1 ? 'succeeded' : 'pending']
      );
    }

    revalidatePath('/sign-in');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error("Mock seeding error:", error);
    return { success: false, error: error.message };
  }
}

export async function getMockUsers() {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.id as user_id,
        (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) AS bookings_count
       FROM "user" u
       WHERE u.email LIKE '%@sanmateo.test'
       ORDER BY u.id ASC
       LIMIT 20`
    ) as any[];

    return rows || [];
  } catch (error) {
    console.error("Fetch mock users error:", error);
    return [];
  }
}
