'use server';

import { BookingService, BookingConfig } from '@/services/BookingService';
import { AvailabilityService } from '@/services/AvailabilityService';
import { getConnection } from '../../../db/client';

export async function checkPropertyAvailability(propertyId: string, start: Date, end: Date) {
  try {
    return await BookingService.checkAvailability(propertyId, start, end);
  } catch (error) {
    console.error('Availability check failed:', error);
    return false;
  }
}

export async function getBusyDates(propertyId: string, month: Date) {
  try {
    return await AvailabilityService.getBusyDates(propertyId, month);
  } catch (error) {
    console.error('Failed to fetch busy dates:', error);
    return [];
  }
}

export async function createInitialBooking(
  config: BookingConfig,
  guestFirstName: string,
  guestLastName: string,
  guestEmail: string,
) {
  try {
    const conn = await getConnection();

    // Upsert guest by email — find existing or create a new record
    const [existingRows]: any = await conn.query(
      'SELECT id FROM guests WHERE email = ? LIMIT 1',
      [guestEmail.toLowerCase().trim()],
    );

    let guestId: string;

    if (existingRows.length > 0) {
      guestId = existingRows[0].id;
      // Keep name up-to-date
      await conn.query(
        'UPDATE guests SET first_name = ?, last_name = ? WHERE id = ?',
        [guestFirstName.trim(), guestLastName.trim(), guestId],
      );
    } else {
      const { randomUUID } = await import('crypto');
      guestId = randomUUID();
      await conn.query(
        `INSERT INTO guests (id, email, first_name, last_name, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [guestId, guestEmail.toLowerCase().trim(), guestFirstName.trim(), guestLastName.trim()],
      );
    }

    await conn.end();

    const result = await BookingService.createBooking(config, guestId);
    return { success: true, ...result };
  } catch (error: any) {
    console.error('Booking creation failed:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllProperties() {
  try {
    const conn = await getConnection();
    const [rows]: any = await conn.query('SELECT id, name, slug, max_guests, base_price_cents FROM properties WHERE status = "active"');
    await conn.end();
    return rows as any[];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
}
