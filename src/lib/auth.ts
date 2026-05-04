import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

const authBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/san_mateo';

export const auth = betterAuth({
  appName: "Finca San Mateo",
  baseURL: authBaseURL,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "san-mateo-development-secret-change-me-before-production",
  database: new Pool({ connectionString: dbUrl, max: 10 }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
