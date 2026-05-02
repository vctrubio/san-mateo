import { getConnection } from "../../db/client";

export type AdminPaymentRow = {
  id: string;
  booking_id: string;
  reference: string;
  property_name: string;
  guest_email: string;
  kind: string;
  amount_cents: number;
  currency: string;
  status: string;
  due_at: string | null;
  paid_at: string | null;
};

export async function getAdminPayments() {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      `SELECT
        p.id,
        p.booking_id,
        b.reference,
        pr.name AS property_name,
        g.email AS guest_email,
        p.kind,
        p.amount_cents,
        p.currency,
        p.status,
        p.due_at,
        p.paid_at
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      JOIN properties pr ON pr.id = b.property_id
      JOIN guests g ON g.id = b.guest_id
      ORDER BY p.created_at DESC`
    )) as [AdminPaymentRow[], unknown];

    return rows;
  } finally {
    await conn.end();
  }
}
