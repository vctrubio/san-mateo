import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { pool } from "../../db/client";

const authBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  appName: "Finca San Mateo",
  baseURL: authBaseURL,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "san-mateo-development-secret-change-me-before-production",
  database: pool,
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
