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

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export type DashboardStats = {
  properties_active: number;
  bookings_total: number;
  bookings_pending: number;
  bookings_confirmed: number;
  revenue_total_cents: number;
  revenue_collected_cents: number;
  guests_total: number;
  occupied_today: number;
};

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const conn = await getConnection();
  try {
    const [rows] = (await conn.query(
      `SELECT
        (SELECT COUNT(*) FROM properties WHERE status = 'active' AND deleted_at IS NULL) AS properties_active,
        (SELECT COUNT(*) FROM bookings) AS bookings_total,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS bookings_pending,
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') AS bookings_confirmed,
        (SELECT COALESCE(SUM(total_cents),0) FROM bookings WHERE status IN ('confirmed','checked_in','checked_out','completed')) AS revenue_total_cents,
        (SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE status = 'succeeded') AS revenue_collected_cents,
        (SELECT COUNT(*) FROM guests) AS guests_total,
        (SELECT COUNT(*) FROM v_property_status_today WHERE is_occupied_today = TRUE) AS occupied_today`
    )) as [DashboardStats[], unknown];
    return rows[0];
  } finally {
    await conn.end();
  }
}

// ─── Analytics stats ──────────────────────────────────────────────────────────

export type PropertyOccupancyRow = {
  name: string;
  slug: string;
  nights_booked: number;
  total_nights_available: number;
  occupancy_pct: number;
};

export type MonthlyRevenueRow = {
  month: string;
  bookings: number;
  revenue_cents: number;
};

export type AnalyticsStats = {
  totalRevenue: number;
  collectedRevenue: number;
  outstandingRevenue: number;
  propertyOccupancy: PropertyOccupancyRow[];
  monthlyRevenue: MonthlyRevenueRow[];
};

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const conn = await getConnection();
  try {
    const [totals] = (await conn.query(
      `SELECT
        COALESCE(SUM(b.total_cents),0) AS total,
        COALESCE(SUM(p.paid),0) AS collected
      FROM bookings b
      LEFT JOIN (
        SELECT booking_id, SUM(amount_cents) AS paid FROM payments WHERE status = 'succeeded' GROUP BY booking_id
      ) p ON p.booking_id = b.id
      WHERE b.status IN ('confirmed','checked_in','checked_out','completed')`
    )) as [Array<{ total: number; collected: number }>, unknown];

    const [occRows] = (await conn.query(
      `SELECT
        p.name, p.slug,
        COALESCE(COUNT(b.id), 0) AS nights_booked,
        (CURRENT_DATE - p.created_at::date) AS total_nights_available,
        ROUND(COALESCE(COUNT(b.id),0) * 100.0 / GREATEST((CURRENT_DATE - p.created_at::date),1), 1) AS occupancy_pct
      FROM properties p
      LEFT JOIN bookings b ON b.property_id = p.id
        AND b.status IN ('confirmed','checked_in','checked_out','completed')
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, p.name, p.slug, p.created_at
      ORDER BY occupancy_pct DESC`
    )) as [PropertyOccupancyRow[], unknown];

    const [monthRows] = (await conn.query(
      `SELECT
        TO_CHAR(check_in, 'YYYY-MM') AS month,
        COUNT(*) AS bookings,
        SUM(total_cents) AS revenue_cents
      FROM bookings
      WHERE status IN ('confirmed','checked_in','checked_out','completed')
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12`
    )) as [MonthlyRevenueRow[], unknown];

    const t = totals[0] ?? { total: 0, collected: 0 };
    return {
      totalRevenue: t.total,
      collectedRevenue: t.collected,
      outstandingRevenue: t.total - t.collected,
      propertyOccupancy: occRows,
      monthlyRevenue: monthRows.reverse(),
    };
  } finally {
    await conn.end();
  }
}

