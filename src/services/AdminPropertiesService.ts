import { getConnection } from "../../db/client";

export type AdminPropertyRow = {
  id: string;
  slug: string;
  name: string;
  property_type: string;
  status: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  base_price_cents: number;
  min_nights: number;
  booking_count: number;
  is_occupied_today: number;
  next_booking_date: string | null;
  cover_photo_key: string | null;
};

export type AdminPropertyDetail = {
  property: AdminPropertyRow | null;
  amenities: Array<{ id: string; label: string; category: string | null }>;
  fees: Array<{ id: string; name: string; calculation: string; amount_cents: number; currency: string }>; 
  photos: Array<{ id: string; storage_key: string; caption: string | null; is_cover: number }>; 
};

export async function getAdminProperties() {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      `SELECT
        p.id,
        p.slug,
        p.name,
        p.property_type,
        p.status,
        p.max_guests,
        p.bedrooms,
        p.bathrooms,
        p.base_price_cents,
        p.min_nights,
        COALESCE(bs.booking_count, 0) AS booking_count,
        COALESCE(ps.is_occupied_today, 0) AS is_occupied_today,
        ps.next_booking_date,
        ph.storage_key AS cover_photo_key
      FROM properties p
      LEFT JOIN v_property_status_today ps ON ps.property_id = p.id
      LEFT JOIN (
        SELECT property_id, COUNT(*) AS booking_count
        FROM bookings
        GROUP BY property_id
      ) bs ON bs.property_id = p.id
      LEFT JOIN property_photos ph ON ph.property_id = p.id AND ph.is_cover = TRUE
      WHERE p.deleted_at IS NULL
      ORDER BY p.status DESC, p.base_price_cents DESC`
    )) as [AdminPropertyRow[], unknown];

    return rows;
  } finally {
    await conn.end();
  }
}

export async function getAdminPropertyBySlug(slug: string): Promise<AdminPropertyDetail> {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      `SELECT
        p.id,
        p.slug,
        p.name,
        p.property_type,
        p.status,
        p.max_guests,
        p.bedrooms,
        p.bathrooms,
        p.base_price_cents,
        p.min_nights,
        COALESCE(bs.booking_count, 0) AS booking_count,
        COALESCE(ps.is_occupied_today, 0) AS is_occupied_today,
        ps.next_booking_date,
        ph.storage_key AS cover_photo_key
      FROM properties p
      LEFT JOIN v_property_status_today ps ON ps.property_id = p.id
      LEFT JOIN (
        SELECT property_id, COUNT(*) AS booking_count
        FROM bookings
        GROUP BY property_id
      ) bs ON bs.property_id = p.id
      LEFT JOIN property_photos ph ON ph.property_id = p.id AND ph.is_cover = TRUE
      WHERE p.slug = ?
      LIMIT 1`,
      [slug]
    )) as [AdminPropertyRow[], unknown];

    const property = rows[0] ?? null;

    if (!property) {
      return { property: null, amenities: [], fees: [], photos: [] };
    }

    const [amenityRows] = (await conn.query(
      `SELECT a.id, a.label, a.category
       FROM property_amenities pa
       JOIN amenities a ON a.id = pa.amenity_id
       WHERE pa.property_id = ?
       ORDER BY a.category, a.label`,
      [property.id]
    )) as [Array<{ id: string; label: string; category: string | null }>, unknown];

    const [feeRows] = (await conn.query(
      `SELECT id, name, calculation, amount_cents, currency
       FROM property_fees
       WHERE property_id = ? AND is_active = TRUE
       ORDER BY position ASC`,
      [property.id]
    )) as [Array<{ id: string; name: string; calculation: string; amount_cents: number; currency: string }>, unknown];

    const [photoRows] = (await conn.query(
      `SELECT id, storage_key, caption, is_cover
       FROM property_photos
       WHERE property_id = ?
       ORDER BY is_cover DESC, position ASC`,
      [property.id]
    )) as [Array<{ id: string; storage_key: string; caption: string | null; is_cover: number }>, unknown];

    return { property, amenities: amenityRows, fees: feeRows, photos: photoRows };
  } finally {
    await conn.end();
  }
}
