import { getConnection } from '../../db/client';
import crypto from 'crypto';
import { eachDayOfInterval, format, startOfMonth, endOfMonth, addMonths, addDays } from 'date-fns';

export class AvailabilityService {
  /**
   * Initializes availability slots for a property if they don't exist
   */
  static async initializeSlots(propertyId: string, startDate: Date, endDate: Date) {
    const conn = await getConnection();
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      await conn.query(`
        INSERT IGNORE INTO availability_slots (id, property_id, slot_date, status)
        VALUES (?, ?, ?, 'available')
      `, [crypto.randomUUID(), propertyId, dateStr]);
    }
  }

  /**
   * Returns a list of busy dates for a property
   */
  static async getBusyDates(propertyId: string, month: Date) {
    const conn = await getConnection();
    const start = format(startOfMonth(month), 'yyyy-MM-dd');
    const end = format(endOfMonth(addMonths(month, 1)), 'yyyy-MM-dd');

    const [rows]: any = await conn.query(`
      SELECT slot_date 
      FROM availability_slots 
      WHERE property_id = ? 
      AND status != 'available'
      AND slot_date BETWEEN ? AND ?
    `, [propertyId, start, end]);

    return rows.map((r: any) => new Date(r.slot_date));
  }

  /**
   * Blocks slots for a specific booking
   */
  static async blockSlots(propertyId: string, start: Date, end: Date, bookingId: string) {
    const conn = await getConnection();
    const days = eachDayOfInterval({ start, end: addDays(end, -1) }); // Checkout day is usually free for next guest
    
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      await conn.query(`
        UPDATE availability_slots 
        SET status = 'reserved', booking_id = ? 
        WHERE property_id = ? AND slot_date = ?
      `, [bookingId, propertyId, dateStr]);
    }
  }
}
