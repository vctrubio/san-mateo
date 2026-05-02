import mysql from 'mysql2/promise';

const connectionUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/san_mateo';

export async function getConnection() {
  return mysql.createConnection(connectionUrl);
}

// Singleton pool for Better Auth and other shared queries
export const pool = mysql.createPool({
  uri: connectionUrl,
  connectionLimit: 10,
  timezone: '+00:00' // Use UTC
});

