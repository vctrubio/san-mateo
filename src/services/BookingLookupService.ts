import { getConnection } from "../../db/client";

export type BookingStatusRecord = {
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  total_cents: number;
  property_name: string;
  property_slug: string;
  guest_name: string | null;
  guest_email: string;
  payment_state: string | null;
  paid_cents: number | null;
  outstanding_cents: number | null;
  created_at: string;
};

export async function getBookingByReference(reference: string) {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      `SELECT
        b.reference,
        b.status,
        b.check_in,
        b.check_out,
        b.total_cents,
        b.created_at,
        p.name AS property_name,
        p.slug AS property_slug,
        u.name AS guest_name,
        u.email AS guest_email,
        v.payment_state,
        v.paid_cents,
        v.outstanding_cents
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN "user" u ON u.id = b.user_id
      LEFT JOIN v_booking_payment_status v ON v.booking_id = b.id
      WHERE b.reference = ?
      LIMIT 1`,
      [reference]
    )) as [BookingStatusRecord[], unknown];

    return rows[0] ?? null;
  } finally {
    await conn.end();
  }
}
