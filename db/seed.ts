import { getConnection } from './client';
import crypto from 'crypto';

async function main() {
  const conn = await getConnection();
  console.log('🌱 Seeding database with official properties...');

  // 1. Finca
  const fincaId = crypto.randomUUID();
  await conn.query(`
    INSERT INTO fincas (id, slug, name, description, address_line1, city, country, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    fincaId,
    'finca-san-mateo',
    'Finca San Mateo',
    'A luxury coastal retreat in the windy capital of the world.',
    'Carretera Nacional 340, Km 75',
    'Tarifa',
    'ES',
    36.0469,
    -5.6318
  ]);

  // 2. Official Properties
  const properties = [
    { name: 'Levante', desc: 'The Villa', capacity: 6, price: 120000 },
    { name: 'Estrecho', desc: 'The Residence', capacity: 4, price: 85000 },
    { name: 'Marea', desc: 'The Retreat', capacity: 2, price: 45000 },
    { name: 'Cala', desc: 'The Bungalow', capacity: 2, price: 35000 },
  ];

  for (const p of properties) {
    const id = crypto.randomUUID();
    const slug = p.name.toLowerCase();
    await conn.query(`
      INSERT INTO properties (id, finca_id, slug, name, description, property_type, status, max_guests, bedrooms, bathrooms, base_price_cents)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, 
      fincaId, 
      slug, 
      p.name, 
      p.desc, 
      'villa', 
      'active', 
      p.capacity, 
      Math.ceil(p.capacity / 2), 
      Math.ceil(p.capacity / 2), 
      p.price
    ]);
  }

  // 3. Guest
  const guestId = crypto.randomUUID();
  await conn.query(`
    INSERT INTO guests (id, email, first_name, last_name)
    VALUES (?, ?, ?, ?)
  `, [guestId, 'guest@example.com', 'Coastal', 'Traveler']);

  console.log('✅ Seeding complete.');
  await conn.end();
}

main().catch(console.error);
