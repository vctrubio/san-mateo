import { getConnection } from "../../db/client";

export type AdminGuestRow = {
  guest_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  stays_completed: number;
  stays_upcoming: number;
  stays_cancelled: number;
  lifetime_spend_cents: number;
  avg_rating_given: number | null;
  last_stay_ended_on: string | null;
  notes?: string | null;
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

export async function getAdminGuestById(guestId: string): Promise<AdminGuestDetail> {
  const conn = await getConnection();

  try {
    const [guestRows] = (await conn.query(
      `SELECT v.*, g.notes
       FROM v_guest_summary v
       JOIN guests g ON g.id = v.guest_id
       WHERE v.guest_id = ?
       LIMIT 1`,
      [guestId]
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
       WHERE b.guest_id = ?
       ORDER BY b.created_at DESC`,
      [guestId]
    )) as [Array<{ id: string; reference: string; status: string; check_in: string; check_out: string; total_cents: number; property_name: string }>, unknown];

    const [reviewRows] = (await conn.query(
      `SELECT id, rating_overall, public_comment, status, created_at
       FROM reviews
       WHERE guest_id = ?
       ORDER BY created_at DESC`,
      [guestId]
    )) as [Array<{ id: string; rating_overall: number; public_comment: string | null; status: string; created_at: string }>, unknown];

    return { guest, bookings: bookingRows, reviews: reviewRows };
  } finally {
    await conn.end();
  }
}
