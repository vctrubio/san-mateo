import { getConnection } from "../../db/client";

export type PropertySummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  property_type: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  base_price_cents: number;
  min_nights: number;
  cover_photo_key: string | null;
};

export async function getPropertySummaries(): Promise<PropertySummary[]> {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      `SELECT
        p.id,
        p.slug,
        p.name,
        p.description,
        p.property_type,
        p.max_guests,
        p.bedrooms,
        p.beds,
        p.bathrooms,
        p.base_price_cents,
        p.min_nights,
        ph.storage_key AS cover_photo_key
      FROM properties p
      LEFT JOIN property_photos ph ON ph.property_id = p.id AND ph.is_cover = TRUE
      WHERE p.status = 'active' AND p.deleted_at IS NULL
      ORDER BY p.base_price_cents DESC`
    )) as [PropertySummary[], unknown];

    return rows;
  } finally {
    await conn.end();
  }
}

export type PropertyAmenityMap = Record<string, string[]>;

export async function getAllPropertyAmenities(): Promise<PropertyAmenityMap> {
  const conn = await getConnection();
  try {
    const [rows] = (await conn.query(
      `SELECT p.slug, a.label
       FROM properties p
       JOIN property_amenities pa ON p.id = pa.property_id
       JOIN amenities a ON a.id = pa.amenity_id
       WHERE p.deleted_at IS NULL`
    )) as [Array<{ slug: string; label: string }>, unknown];

    const map: PropertyAmenityMap = {};
    rows.forEach(row => {
      if (!map[row.slug]) map[row.slug] = [];
      map[row.slug].push(row.label);
    });
    return map;
  } finally {
    await conn.end();
  }
}
