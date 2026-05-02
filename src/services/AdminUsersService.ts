import { getConnection } from "../../db/client";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: number;
  createdAt: string;
  sessions: number;
  lastActiveAt: string | null;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const conn = await getConnection();

  try {
    const [rows] = (await conn.query(
      "SELECT u.id, u.name, u.email, u.role, u.banned, u.createdAt, "
        + "COUNT(s.id) AS sessions, MAX(s.updatedAt) AS lastActiveAt "
        + "FROM `user` u "
        + "LEFT JOIN `session` s ON s.userId = u.id "
        + "GROUP BY u.id, u.name, u.email, u.role, u.banned, u.createdAt "
        + "ORDER BY u.createdAt DESC"
    )) as [AdminUser[], unknown];

    return rows;
  } finally {
    await conn.end();
  }
}
