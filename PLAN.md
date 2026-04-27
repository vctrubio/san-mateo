# Implementation Plan

This is the living checklist for turning the current prototype into the full working product described in `ARCHITECTURE.md` and `booking-plan.md`.

## 1. Foundation

- [x] Align the database schema with the target estate and booking model
- [x] Replace the placeholder availability slot model with derived availability views
- [x] Add seed data for a realistic estate, properties, guests, bookings, payments, and reviews
- [x] Update the schema visualizer so it shows the desired app shape
- [x] Update the database preview so it reflects the operational model

## 2. App Surfaces

- [x] Add a public `/user` route for the guest-facing experience
- [x] Add an `/admin` dashboard overview route
- [x] Add initial admin subroutes for properties, bookings, guests, and analytics
- [x] Add landing-page links into the admin and user experiences
- [ ] Add admin route protection with Better Auth session checks
- [x] Add admin route protection with Better Auth session checks
- [x] Add role-based access control for admin-only routes
- [x] Add a proper authenticated login flow for admins

## 3. Domain and Services

- [ ] Create the domain folder structure described in the architecture doc
- [ ] Implement `Money` and `DateRange` as core value objects
- [ ] Implement booking state transitions as a real state machine
- [ ] Add pricing logic as the single source of truth for quotes
- [ ] Add availability logic as a derived query, not stored state
- [ ] Add payment domain and gateway abstractions
- [ ] Add booking repository and payment repository layers
- [ ] Add service modules for quote, create, confirm, cancel, and webhook handling

## 4. Public User Flow

- [ ] Build public property detail pages under `/properties/[slug]`
- [ ] Show live availability and quote calculations on public property pages
- [ ] Add booking creation flow for guest reservations
- [ ] Add booking reference lookup for guest self-service
- [ ] Add review submission flow for completed stays
- [ ] Add a guest summary view or account-style booking history page
- [ ] Update the Three.js world to link directly into public property routes

## 5. Admin Dashboard

- [ ] Build the real `/admin/properties` listing with status and availability strips
- [ ] Build the real `/admin/properties/[slug]` detail page
- [ ] Show rate plans, fees, blackout periods, and calendar blocks in admin
- [ ] Build the real `/admin/bookings` filtered list view
- [ ] Build the real `/admin/bookings/[id]` booking detail view
- [ ] Build the real `/admin/guests` list and guest profile pages
- [ ] Build the real `/admin/payments` view
- [ ] Build the real `/admin/analytics` dashboard with occupancy and revenue summaries

## 6. APIs and Actions

- [ ] Add booking quote API
- [ ] Add property availability API
- [ ] Add booking creation API or server action
- [ ] Add booking lookup API by reference
- [ ] Add review submission API
- [ ] Add Stripe webhook API with idempotency handling
- [ ] Add route caching for the map properties endpoint

## 7. Payments and Webhooks

- [ ] Wire deposit PaymentIntent creation into booking creation
- [ ] Store payment lifecycle events in the database
- [ ] Confirm bookings after successful deposit payments
- [ ] Handle balance due scheduling and collection
- [ ] Add refund and cancellation handling rules
- [ ] Add Stripe event logging and retry safety

## 8. Reviews and Guest History

- [ ] Allow guests to submit reviews for completed stays
- [ ] Allow admin replies to reviews
- [ ] Show guest lifetime summary in the admin dashboard
- [ ] Show published reviews on public property pages
- [ ] Link guest records to Better Auth users when applicable

## 9. Hardening

- [ ] Add route-level loading and error states
- [ ] Add input validation for booking forms and API payloads
- [ ] Add tests for pricing, availability, and booking state transitions
- [ ] Add smoke tests for admin and user routes
- [ ] Run a full lint and typecheck pass across the repository
- [ ] Update documentation if the architecture changes again

## 10. Current Status

- [x] Prototype data model replaced with a fuller estate and booking schema
- [x] Placeholder schema panel replaced with the intended relational model
- [x] Database preview changed to an operational dashboard summary
- [x] `/admin` overview added
- [x] `/user` guest route added
- [x] Admin route tree skeleton added
- [x] Landing page now links into admin and user views
- [x] Better Auth server/client auth setup added
- [x] Next.js auth route handler added
- [x] Development role switch flow added to `/user`

## 11. Next Best Step

- [ ] Add authenticated admin session gating and role checks
- [ ] Replace the admin placeholder pages with live database-backed pages
- [ ] Build the public property detail route and connect the quote/availability flow
