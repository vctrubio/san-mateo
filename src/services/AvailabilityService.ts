import { getConnection } from '../../db/client';
import { addDays, eachDayOfInterval, endOfMonth, format, max, min, startOfDay, startOfMonth } from 'date-fns';

export class AvailabilityService {
  /**
   * Returns whether a property is available for a date range.
   */
  static async isAvailable(propertyId: string, startDate: Date, endDate: Date) {
    const conn = await getConnection();

    try {
      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');

      const [rows]: any = await conn.query(
        `SELECT COUNT(*) AS conflict_count
         FROM bookings
         WHERE property_id = ?
           AND status IN ('pending', 'confirmed', 'checked_in')
           AND check_in < ?
           AND check_out > ?`,
        [propertyId, end, start]
      );

      return rows[0].conflict_count === 0;
    } finally {
      await conn.end();
    }
  }

  /**
   * Returns a list of busy dates for a property
   */
  static async getBusyDates(propertyId: string, month: Date) {
    const conn = await getConnection();
    const monthStart = startOfDay(startOfMonth(month));
    const monthEnd = startOfDay(endOfMonth(month));

    try {
      const [rows]: any = await conn.query(
        `SELECT check_in, check_out
         FROM bookings
         WHERE property_id = ?
           AND status IN ('pending', 'confirmed', 'checked_in')
           AND check_in <= ?
           AND check_out >= ?`,
        [propertyId, format(monthEnd, 'yyyy-MM-dd'), format(monthStart, 'yyyy-MM-dd')]
      );

      const busyDates = new Set<number>();

      for (const row of rows) {
        const bookingStart = startOfDay(new Date(row.check_in));
        const bookingEnd = startOfDay(addDays(new Date(row.check_out), -1));
        const rangeStart = max([bookingStart, monthStart]);
        const rangeEnd = min([bookingEnd, monthEnd]);

        if (rangeStart > rangeEnd) continue;

        const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
        for (const day of days) {
          busyDates.add(day.getTime());
        }
      }

      return Array.from(busyDates).map((ts) => new Date(ts));
    } finally {
      await conn.end();
    }
  }
}
