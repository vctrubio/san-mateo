import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/san_mateo';

const pgPool = new Pool({
  connectionString,
  max: 10,
});

function wrapQueryable(target: any) {
  return {
    query: async (sqlText: string, params: any[] = []) => {
      let paramIndex = 1;
      const pgSql = sqlText.replace(/\?/g, () => `$${paramIndex++}`).replace(/`/g, '"');
      if (pgSql.includes('SET FOREIGN_KEY_CHECKS')) return [[], []];
      const result = await target.query(pgSql, params);
      return [result.rows, result.fields];
    },
    execute: async (sqlText: string, params: any[] = []) => {
      let paramIndex = 1;
      const pgSql = sqlText.replace(/\?/g, () => `$${paramIndex++}`).replace(/`/g, '"');
      if (pgSql.includes('SET FOREIGN_KEY_CHECKS')) return [[], []];
      const result = await target.query(pgSql, params);
      return [result.rows, result.fields];
    }
  };
}

export const pool = {
  ...wrapQueryable(pgPool),
  end: () => pgPool.end(),
};

export const getConnection = async () => {
  const client = await pgPool.connect();
  const wrapped = wrapQueryable(client);
  return {
    ...wrapped,
    beginTransaction: async () => { await client.query('BEGIN'); },
    commit: async () => { await client.query('COMMIT'); },
    rollback: async () => { await client.query('ROLLBACK'); },
    release: () => client.release(),
    end: () => client.release(), // mysql2 connection.end() alias
  };
};

