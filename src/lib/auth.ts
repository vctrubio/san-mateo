import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { createPool } from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL ?? "mysql://root:@localhost:3306/san_mateo";

const authBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const database = createPool({
  uri: databaseUrl,
  timezone: "Z",
});

export const auth = betterAuth({
  appName: "Finca San Mateo",
  baseURL: authBaseURL,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "san-mateo-development-secret-change-me-before-production",
  database,
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
});