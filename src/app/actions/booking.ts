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
  userId: string,
) {
  try {
    const result = await BookingService.createBooking(config, userId);
    return { success: true, ...result };
  } catch (error: any) {
    console.error('Booking creation failed:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllProperties() {
  try {
    const conn = await getConnection();
    const [rows]: any = await conn.query("SELECT id, name, slug, max_guests, base_price_cents FROM properties WHERE status = 'active'");
    await conn.end();
    return rows as any[];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
}
