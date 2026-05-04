import fs from 'fs';
import path from 'path';
import { getConnection } from './client';

async function main() {
  const conn = await getConnection();
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Split into individual statements based on semicolon and newlines (very basic split)
    const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await conn.execute(statement);
      }
    }
    console.log('Schema successfully applied.');
  } catch (error) {
    console.error('Error applying schema:', error);
  } finally {
    await conn.end();
  }
}

main();
