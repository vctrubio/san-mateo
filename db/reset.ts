import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { getConnection } from './client';

async function main() {
  // Connect without a specific database to allow creation
  let url = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/san_mateo';
  // If it has a DB selected, drop back to server-level connection
  const baseUrl = url.substring(0, url.lastIndexOf('/'));
  
  const conn = await mysql.createConnection(baseUrl);
  
  console.log('🔌 Connected to MySQL. Dropping/creating schema...');
  
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split schema into individual statements
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await conn.query(statement);
    } catch (err) {
      console.error(`Error executing statement:\n${statement}`);
      console.error(err);
    }
  }

  console.log('✅ Schema reset complete.');
  await conn.end();
}

main().catch(console.error);
