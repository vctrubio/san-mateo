import { getConnection } from "../../db/client";

export type BookingStatusSummary = {
  status: string;
  count: number;
};

export type BookingSnapshotRow = {
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  total_cents: number;
  property_name: string;
  guest_email: string;
  payment_state: string | null;
};

export type BookingSnapshot = {
  statusSummary: BookingStatusSummary[];
  recentBookings: BookingSnapshotRow[];
  pendingRequests: BookingSnapshotRow[];
};

export async function getAdminBookingSnapshot(): Promise<BookingSnapshot> {
  const conn = await getConnection();

  try {
    const [statusRows] = (await conn.query(
      "SELECT status, COUNT(*) AS count FROM bookings GROUP BY status ORDER BY count DESC"
    )) as [BookingStatusSummary[], unknown];

    const [recentRows] = (await conn.query(
      `SELECT b.reference, b.status, b.check_in, b.check_out, b.total_cents,
        p.name AS property_name, g.email AS guest_email,
        v.payment_state
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN guests g ON g.id = b.guest_id
      LEFT JOIN v_booking_payment_status v ON v.booking_id = b.id
      ORDER BY b.created_at DESC
      LIMIT 6`
    )) as [BookingSnapshotRow[], unknown];

    const [pendingRows] = (await conn.query(
      `SELECT b.reference, b.status, b.check_in, b.check_out, b.total_cents,
        p.name AS property_name, g.email AS guest_email,
        v.payment_state
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN guests g ON g.id = b.guest_id
      LEFT JOIN v_booking_payment_status v ON v.booking_id = b.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT 6`
    )) as [BookingSnapshotRow[], unknown];

    return {
      statusSummary: statusRows,
      recentBookings: recentRows,
      pendingRequests: pendingRows,
    };
  } finally {
    await conn.end();
  }
}
