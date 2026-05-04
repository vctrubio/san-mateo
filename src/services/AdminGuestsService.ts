import { getConnection } from "../../db/client";

export type AdminGuestRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  stays_completed: number;
  stays_upcoming: number;
  stays_cancelled: number;
  lifetime_spend_cents: number;
  avg_rating_given: number | null;
  last_stay_ended_on: string | null;
};

export type AdminGuestDetail = {
  guest: AdminGuestRow | null;
  bookings: Array<{
    id: string;
    reference: string;
    status: string;
    check_in: string;
    check_out: string;
    total_cents: number;
    property_name: string;
  }>;
  reviews: Array<{
    id: string;
    rating_overall: number;
    public_comment: string | null;
    status: string;
    created_at: string;
  }>;
};

export async function getAdminGuests() {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      `SELECT * FROM v_guest_summary
       ORDER BY lifetime_spend_cents DESC`
    )) as [AdminGuestRow[], unknown];

    return rows;
  } finally {
    await conn.end();
  }
}

export async function getAdminGuestById(userId: string): Promise<AdminGuestDetail> {
  const conn = await getConnection();

  try {
    const [guestRows] = (await conn.query(
      `SELECT v.*
       FROM v_guest_summary v
       WHERE v.user_id = ?
       LIMIT 1`,
      [userId]
    )) as [AdminGuestRow[], unknown];

    const guest = guestRows[0] ?? null;

    if (!guest) {
      return { guest: null, bookings: [], reviews: [] };
    }

    const [bookingRows] = (await conn.query(
      `SELECT
        b.id,
        b.reference,
        b.status,
        b.check_in,
        b.check_out,
        b.total_cents,
        p.name AS property_name
       FROM bookings b
       JOIN properties p ON p.id = b.property_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    )) as [Array<{ id: string; reference: string; status: string; check_in: string; check_out: string; total_cents: number; property_name: string }>, unknown];

    const [reviewRows] = (await conn.query(
      `SELECT id, rating_overall, public_comment, status, created_at
       FROM reviews
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    )) as [Array<{ id: string; rating_overall: number; public_comment: string | null; status: string; created_at: string }>, unknown];

    return { guest, bookings: bookingRows, reviews: reviewRows };
  } finally {
    await conn.end();
  }
}
