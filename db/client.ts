import mysql from 'mysql2/promise';

export async function getConnection() {
  const connectionUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/san_mateo';
  return mysql.createConnection(connectionUrl);
}

export async function getPool() {
  const connectionUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/san_mateo';
  return mysql.createPool(connectionUrl);
}
