import fs from 'fs';
import path from 'path';
import { pool } from './client';

async function main() {
  console.log('🔌 Connected to PostgreSQL. Applying schema...');
  
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Postgres driver can execute multiple statements separated by semicolons in one go.
  try {
    await pool.query(schemaSql);
  } catch (err) {
    console.error('Error executing schema:');
    console.error(err);
  }

  console.log('✅ Schema reset complete.');
  await pool.end();
}

main().catch(console.error);

