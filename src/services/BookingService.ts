import { getConnection } from '../../db/client';
import crypto from 'crypto';
import { AvailabilityService } from './AvailabilityService';

export type BookingStatus = 'pending' | 'reserved' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

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
  /**
   * High-performance availability check using the slots table
   */
  static async checkAvailability(propertyId: string, start: Date, end: Date) {
    const conn = await getConnection();
    
    // Ensure slots exist for this range
    await AvailabilityService.initializeSlots(propertyId, start, end);

    // Check if any slot in range is not 'available'
    // Note: check_out day is not included in the block (it's the arrival day for the next guest)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const [rows]: any = await conn.query(`
      SELECT COUNT(*) as busy_count 
      FROM availability_slots 
      WHERE property_id = ? 
      AND status != 'available'
      AND slot_date >= ? 
      AND slot_date < ?
    `, [propertyId, start.toISOString().split('T')[0], end.toISOString().split('T')[0]]);

    return rows[0].busy_count === 0;
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

      await conn.query(`
        INSERT INTO bookings (
          id, reference, property_id, guest_id, check_in, check_out, 
          num_adults, num_children, num_babies, needs_crib, num_dogs, num_cats,
          currency, nightly_rate_cents, accommodation_cents, fees_cents, total_cents, 
          status, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bookingId, reference, config.propertyId, guestId,
        config.startDate.toISOString().split('T')[0],
        config.endDate.toISOString().split('T')[0],
        config.adults, config.children, config.babies, config.needsCrib, config.dogs, config.cats,
        property.currency, property.base_price_cents, baseTotal, cleaningFee + petFee, totalCents,
        'reserved', 'unpaid'
      ]);

      // Block the slots immediately
      await AvailabilityService.blockSlots(config.propertyId, config.startDate, config.endDate, bookingId);

      await conn.commit();
      return { bookingId, reference, totalCents, currency: property.currency };
    } catch (error) {
      await conn.rollback();
      throw error;
    }
  }

  static async updateStatus(bookingId: string, status: BookingStatus) {
    const conn = await getConnection();
    await conn.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
  }
}
