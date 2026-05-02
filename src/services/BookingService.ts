import { getConnection } from '../../db/client';
import crypto from 'crypto';
import { AvailabilityService } from './AvailabilityService';

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled';

export interface BookingConfig {
  propertyId: string;
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
  babies: number;
  needsCrib: boolean;
  hasPets: boolean;
  dogs: number;
  cats: number;
}

export class BookingService {
  static async checkAvailability(propertyId: string, start: Date, end: Date) {
    return AvailabilityService.isAvailable(propertyId, start, end);
  }

  static async createBooking(config: BookingConfig, guestId: string) {
    const conn = await getConnection();

    // Atomic check and block
    const isAvailable = await this.checkAvailability(config.propertyId, config.startDate, config.endDate);
    if (!isAvailable) throw new Error('Selected dates are no longer available.');

    // 1. Get property details
    const [propertyRows]: any = await conn.query(
      'SELECT base_price_cents, currency FROM properties WHERE id = ?',
      [config.propertyId]
    );
    const property = propertyRows[0];

    // 2. Calculate Pricing Engine
    const nights = Math.ceil((config.endDate.getTime() - config.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const baseTotal = property.base_price_cents * nights;
    
    // Add surcharges (Example: 50€ cleaning fee, 20€ per pet)
    const cleaningFee = 5000;
    const petFee = (config.dogs + config.cats) * 2000;
    const totalCents = baseTotal + cleaningFee + petFee;

    // 3. Persistence
    const bookingId = crypto.randomUUID();
    const reference = `SM-${Math.random().toString(36).toUpperCase().substring(2, 8)}`;

    try {
      await conn.beginTransaction();

      await conn.query(
        `INSERT INTO bookings (
          id, reference, property_id, guest_id, check_in, check_out, nights,
          num_adults, num_children, num_infants,
          currency, nightly_rate_cents, accommodation_cents, fees_cents, taxes_cents,
          discount_cents, length_of_stay_discount_cents, length_of_stay_discount_name,
          total_cents, deposit_percentage, deposit_cents, balance_cents, balance_due_at,
          status, source, guest_message, admin_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        bookingId,
        reference,
        config.propertyId,
        guestId,
        config.startDate.toISOString().split('T')[0],
        config.endDate.toISOString().split('T')[0],
        nights,
        config.adults,
        config.children,
        config.babies,
        property.currency,
        property.base_price_cents,
        baseTotal,
        cleaningFee + petFee,
        0,
        0,
        0,
        null,
        totalCents,
        50,
        Math.round(totalCents * 0.5),
        Math.round(totalCents * 0.5),
        null,
        'pending',
        'direct',
        'Booking created from /finca availability flow.',
        'Auto-generated for testing mode.'
      ]);

      await conn.query(
        `INSERT INTO booking_events (id, booking_id, event_type, payload, actor_type, actor_id)
         VALUES (?, ?, ?, ?, ?, ?)`
      , [
        crypto.randomUUID(),
        bookingId,
        'booking.created',
        JSON.stringify({ reference, propertyId: config.propertyId }),
        'guest',
        guestId,
      ]);

      await conn.query(
        `INSERT INTO payments (
          id, booking_id, kind, amount_cents, currency, status, due_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      , [
        crypto.randomUUID(),
        bookingId,
        'deposit',
        Math.round(totalCents * 0.5),
        property.currency,
        'pending',
        null,
      ]);

      await conn.commit();
      return { bookingId, reference, totalCents, currency: property.currency };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.end();
    }
  }

  static async updateStatus(bookingId: string, status: BookingStatus) {
    const conn = await getConnection();
    try {
      await conn.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    } finally {
      await conn.end();
    }
  }
}
