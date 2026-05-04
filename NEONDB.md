# Finca San Mateo - Neon PostgreSQL Migration Summary

This document outlines the architectural changes, migrations, and compatibility layers implemented to transition the application from a local MySQL database to a managed Neon PostgreSQL database.

## 1. Core Database Migration (`mysql2` → `pg`)
- **Driver Swap:** Replaced the `mysql2` driver with the `pg` (Node-Postgres) package and configured a connection pool connecting directly to the Neon connection string (`postgresql://neondb_owner:...`).
- **Schema Translation:** Converted `db/schema.sql` entirely from MySQL DDL to PostgreSQL DDL.
  - Replaced `TINYINT(1)` with `BOOLEAN`.
  - Replaced `DATETIME` with `TIMESTAMP`.
  - Replaced `INT AUTO_INCREMENT` with `SERIAL` (or relied on UUIDs as primary keys).
- **Better Auth Case Sensitivity:** Because PostgreSQL folds unquoted identifiers to lowercase, all camelCase columns required by Better Auth (e.g., `emailVerified`, `accountId`) were wrapped in double quotes (e.g., `"emailVerified"`) across the DDL and manual SQL queries to prevent "column does not exist" errors.

## 2. Guest vs. User Consolidation (The "Identity Merge")
We have fundamentally simplified the platform's identity model by removing the legacy `guests` table entirely.
- **The Problem:** Previously, "Guests" were temporary records for bookings, while "Users" were authenticated accounts. This created fragmented data and complex joins.
- **The Solution:** We now treat **everyone** as a User. 
- **Database Impact:** The `guests` table was dropped. All foreign keys in `bookings`, `reviews`, etc., now point directly to the `"user"` table.
- **Data Integrity:** Historical guest metadata (names, emails) was merged into the `"user"` table during the refactor. Booking-specific guest counts (adults/children) are now stored in a JSON `guests` column in the `bookings` table.

## 3. Neon Auth Integration
As per the [Neon Auth Overview](https://neon.com/docs/auth/overview), we have aligned our architecture with Neon's managed authentication service (powered by Better Auth).

- **Managed Identity:** Neon Auth stores users, sessions, and configuration directly in your Neon database (typically in the `neon_auth` schema).
- **Branch-Awareness:** One of the primary benefits of Neon Auth is that when you branch your database, your **auth state branches with it**. This ensures that test users created in a preview branch do not pollute production.
- **Compatibility:** Our current `"user"` table in the `public` schema is 100% compatible with Neon Auth. If we transition to the fully managed service, Neon Auth will simply manage these records (or their equivalents in `neon_auth.users`) for us.
- **Current State:** We are currently using **Better Auth** pointing to our own tables. This gives us full control while staying perfectly aligned for a future "zero-config" switch to managed Neon Auth.

## 4. The Compatibility Wrapper (`db/client.ts`)
To avoid rewriting hundreds of inline SQL queries across the entire Next.js application, we built a robust compatibility wrapper around the `pg` connection pool. 

- **Placeholder Translation:** Automatically translates MySQL `?` placeholders into PostgreSQL `$1`, `$2` indexed placeholders at runtime using a regex parser.
- **Backtick Stripping:** Translates MySQL backticks (\`) into PostgreSQL double quotes (`"`).
- **Format Preservation:** Wraps query results to match the array destructuring `[rows, fields]` that the Next.js components and services expect from `mysql2`.
- **Transaction Support:** Upgraded the wrapper to provide `.beginTransaction()`, `.commit()`, and `.rollback()` functions using a dedicated Postgres `PoolClient` (critical for `BookingService.ts`).

## 5. Application-Level SQL Refactoring
Several advanced queries required manual refactoring to comply with PostgreSQL's stricter type checking and function library:

- **Date Functions:** 
  - Replaced MySQL's `DATEDIFF(NOW(), date)` with PostgreSQL date subtraction: `(CURRENT_DATE - created_at::date)`.
  - Replaced MySQL's `DATE_FORMAT(date, '%Y-%m')` with PostgreSQL's `TO_CHAR(date, 'YYYY-MM')`.
- **Boolean Coercion:** 
  - Fixed strict typing errors where integers were compared to booleans. Updated conditions like `is_occupied_today = 1` to `is_occupied_today = TRUE`.
  - Explicitly cast views returning booleans to integers (`is_occupied_today::int`) where the frontend components expected a numeric `1` or `0`.

## 6. Seeding and Mock Data
- **Conflict Handling:** Replaced all instances of MySQL's `INSERT IGNORE` and `ON DUPLICATE KEY UPDATE` with PostgreSQL's `ON CONFLICT (...) DO NOTHING` and `ON CONFLICT (...) DO UPDATE SET ...`.
- **Admin Seeding:** Configured `db/seed.ts` to idempotently seed the estate, properties, and an admin user (`admin@sanmateo.test`).
- **Dynamic Testing (`mock.ts`):** Completely refactored the Next.js Server Action responsible for the "Testing Portal" fast-login. The `/sign-in` page can now successfully generate 20 mock users and their associated bookings natively into Neon Postgres.

## 7. Authentication & Environment Integration
- **Neon MCP Client:** Integrated the Neon MCP server locally to allow AI agents direct contextual access to the database schema and query engine.
- **Better Auth:** The system currently relies on the local `better-auth` configuration which is fully pointed at the Neon Postgres DB. 
- **Next Steps (Neon Auth):** We've laid the groundwork and installed `@neondatabase/auth`. To transition from local auth hosting to managed Neon Auth, we just need to provide the `NEON_AUTH_BASE_URL` and swap the adapters. Currently, the local auth acts as a 1:1 identical proxy for what Neon Auth will do.

## 8. Architecture Modernization (Post-Migration)
After the database migration to Neon PostgreSQL, we further optimized the application's data architecture to leverage PostgreSQL's robust JSON support and streamline authentication flows:

- **JSON Configuration & Estate Refactor:** The legacy `fincas` table—which stored only a single row for the "San Mateo" estate—was entirely dropped. Estate configuration and localized metadata were extracted into a centralized, static `finca.json` file in the project root. This simplifies the database relationships, removes the need for `finca_id` foreign keys on `properties`, and makes the codebase highly portable for deploying identical stacks for different estates.
- **User Centralization:** The legacy `guests` table was entirely removed. The system was modernized to associate all `bookings`, `reviews`, and `booking_events` directly to the Better Auth `"user"` table via a `user_id` foreign key.
- **JSON Column Storage:** Guest metadata (such as the number of adults, children, infants, and pets) was consolidated into a structured JSON `guests` column on the `bookings` table, avoiding unnecessary columns and relational complexity.
- **Currency Simplification:** All redundant `currency` columns were dropped across the entire schema (e.g., in `bookings`, `payments`, `property_fees`). The platform now enforces a strict `EUR` standard to drastically simplify financial queries and frontend formatting logic.
