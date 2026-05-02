import { getConnection } from "../../db/client";

export type AdminBookingRow = {
  id: string;
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

export type AdminBookingDetail = {
  booking: AdminBookingRow | null;
  fees: Array<{ id: string; name: string; calculation: string; amount_cents: number; currency: string }>;
  payments: Array<{ id: string; kind: string; amount_cents: number; currency: string; status: string; paid_at: string | null }>; 
  events: Array<{ id: string; event_type: string; actor_type: string | null; created_at: string }>; 
};

export async function getAdminBookings() {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      `SELECT
        b.id,
        b.reference,
        b.status,
        b.check_in,
        b.check_out,
        b.total_cents,
        b.created_at,
        p.name AS property_name,
        p.slug AS property_slug,
        CONCAT_WS(' ', g.first_name, g.last_name) AS guest_name,
        g.email AS guest_email,
        v.payment_state,
        v.paid_cents,
        v.outstanding_cents
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN guests g ON g.id = b.guest_id
      LEFT JOIN v_booking_payment_status v ON v.booking_id = b.id
      ORDER BY b.created_at DESC`
    )) as [AdminBookingRow[], unknown];

    return rows;
  } finally {
    await conn.end();
  }
}

export async function getAdminBookingById(id: string): Promise<AdminBookingDetail> {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      `SELECT
        b.id,
        b.reference,
        b.status,
        b.check_in,
        b.check_out,
        b.total_cents,
        b.created_at,
        p.name AS property_name,
        p.slug AS property_slug,
        CONCAT_WS(' ', g.first_name, g.last_name) AS guest_name,
        g.email AS guest_email,
        v.payment_state,
        v.paid_cents,
        v.outstanding_cents
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN guests g ON g.id = b.guest_id
      LEFT JOIN v_booking_payment_status v ON v.booking_id = b.id
      WHERE b.id = ?
      LIMIT 1`,
      [id]
    )) as [AdminBookingRow[], unknown];

    const booking = rows[0] ?? null;

    if (!booking) {
      return { booking: null, fees: [], payments: [], events: [] };
    }

    const [feeRows] = (await conn.query(
      `SELECT id, name, calculation, amount_cents, currency
       FROM booking_fees
       WHERE booking_id = ?
       ORDER BY created_at ASC`,
      [booking.id]
    )) as [Array<{ id: string; name: string; calculation: string; amount_cents: number; currency: string }>, unknown];

    const [paymentRows] = (await conn.query(
      `SELECT id, kind, amount_cents, currency, status, paid_at
       FROM payments
       WHERE booking_id = ?
       ORDER BY created_at ASC`,
      [booking.id]
    )) as [Array<{ id: string; kind: string; amount_cents: number; currency: string; status: string; paid_at: string | null }>, unknown];

    const [eventRows] = (await conn.query(
      `SELECT id, event_type, actor_type, created_at
       FROM booking_events
       WHERE booking_id = ?
       ORDER BY created_at DESC`,
      [booking.id]
    )) as [Array<{ id: string; event_type: string; actor_type: string | null; created_at: string }>, unknown];

    return { booking, fees: feeRows, payments: paymentRows, events: eventRows };
  } finally {
    await conn.end();
  }
}
