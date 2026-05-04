DROP VIEW IF EXISTS v_guest_summary CASCADE;
DROP VIEW IF EXISTS v_property_status_today CASCADE;
DROP VIEW IF EXISTS v_booking_payment_status CASCADE;

DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS booking_events CASCADE;
DROP TABLE IF EXISTS stripe_webhook_events CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_fees CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS property_fees CASCADE;
DROP TABLE IF EXISTS fee_types CASCADE;
DROP TABLE IF EXISTS property_amenities CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS property_photos CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS fincas CASCADE;

CREATE TABLE "user" (
    id              VARCHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    "emailVerified"   BOOLEAN NOT NULL DEFAULT FALSE,
    image           TEXT,
    role            VARCHAR(32) NOT NULL DEFAULT 'user',
    banned          BOOLEAN NOT NULL DEFAULT FALSE,
    "banReason"       TEXT,
    "banExpires"      TIMESTAMP NULL,
    "createdAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_role ON "user"(role);

CREATE TABLE "session" (
    id              VARCHAR(36) PRIMARY KEY,
    "expiresAt"       TIMESTAMP NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    "createdAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress"       TEXT,
    "userAgent"       TEXT,
    "userId"          VARCHAR(36) NOT NULL,
    "impersonatedBy"  VARCHAR(36),
    FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_userId ON "session"("userId");

CREATE TABLE "account" (
    id                      VARCHAR(36) PRIMARY KEY,
    "accountId"               VARCHAR(255) NOT NULL,
    "providerId"              VARCHAR(255) NOT NULL,
    "userId"                  VARCHAR(36) NOT NULL,
    "accessToken"             TEXT,
    "refreshToken"            TEXT,
    "idToken"                 TEXT,
    "accessTokenExpiresAt"    TIMESTAMP NULL,
    "refreshTokenExpiresAt"   TIMESTAMP NULL,
    scope                   TEXT,
    password                TEXT,
    "createdAt"               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_account_userId ON "account"("userId");

CREATE TABLE "verification" (
    id          VARCHAR(36) PRIMARY KEY,
    identifier  VARCHAR(255) NOT NULL,
    value       TEXT NOT NULL,
    "expiresAt"   TIMESTAMP NOT NULL,
    "createdAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_identifier ON "verification"(identifier);

CREATE TABLE properties (
    id                 VARCHAR(36) PRIMARY KEY,
    slug               VARCHAR(255) UNIQUE NOT NULL,
    name               VARCHAR(255) NOT NULL,
    description        TEXT,
    property_type      VARCHAR(50) NOT NULL,
    status             VARCHAR(50) NOT NULL DEFAULT 'draft',
    map_x              DECIMAL(10,4),
    map_y              DECIMAL(10,4),
    map_z              DECIMAL(10,4),
    max_guests         INT NOT NULL CHECK (max_guests > 0),
    bedrooms           INT NOT NULL DEFAULT 0,
    beds               INT NOT NULL DEFAULT 0,
    bathrooms          DECIMAL(3,1) NOT NULL DEFAULT 0,
    base_price_cents   INT NOT NULL CHECK (base_price_cents >= 0),
    min_nights         INT NOT NULL DEFAULT 1,
    deposit_percentage INT NOT NULL DEFAULT 50,
    balance_due_days_before_checkin INT NOT NULL DEFAULT 14,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at         TIMESTAMP NULL
);

CREATE TABLE property_photos (
    id           VARCHAR(36) PRIMARY KEY,
    property_id  VARCHAR(36) NOT NULL,
    storage_key  VARCHAR(255) NOT NULL,
    caption      VARCHAR(255),
    alt_text     VARCHAR(255),
    position     INT NOT NULL DEFAULT 0,
    is_cover     BOOLEAN NOT NULL DEFAULT FALSE,
    width_px     INT,
    height_px    INT,
    blurhash     VARCHAR(255),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE amenities (
    id       VARCHAR(36) PRIMARY KEY,
    "key"    VARCHAR(255) UNIQUE NOT NULL,
    label    VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    icon     VARCHAR(255)
);

CREATE TABLE property_amenities (
    property_id VARCHAR(36) NOT NULL,
    amenity_id  VARCHAR(36) NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

CREATE TABLE fee_types (
    id       VARCHAR(36) PRIMARY KEY,
    "key"    VARCHAR(255) UNIQUE NOT NULL,
    label    VARCHAR(255) NOT NULL,
    taxable  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE property_fees (
    id              VARCHAR(36) PRIMARY KEY,
    property_id     VARCHAR(36) NOT NULL,
    fee_type_id     VARCHAR(36) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    calculation     VARCHAR(50) NOT NULL,
    amount_cents    INT NOT NULL DEFAULT 0,
    percentage_bps  INT,
    is_optional     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    position        INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id),
    CHECK (
        (calculation = 'percentage' AND percentage_bps IS NOT NULL)
        OR (calculation <> 'percentage')
    )
);

CREATE TABLE bookings (
    id                             VARCHAR(36) PRIMARY KEY,
    reference                      VARCHAR(50) UNIQUE NOT NULL,
    property_id                    VARCHAR(36) NOT NULL,
    user_id                        VARCHAR(36) NOT NULL,
    check_in                       DATE NOT NULL,
    check_out                      DATE NOT NULL,
    nights                         INT NOT NULL,
    guests                         JSON NOT NULL,

    nightly_rate_cents             INT NOT NULL,
    accommodation_cents            INT NOT NULL,
    fees_cents                     INT NOT NULL DEFAULT 0,
    taxes_cents                    INT NOT NULL DEFAULT 0,
    discount_cents                 INT NOT NULL DEFAULT 0,
    length_of_stay_discount_cents  INT NOT NULL DEFAULT 0,
    length_of_stay_discount_name   VARCHAR(255),
    total_cents                    INT NOT NULL,

    deposit_percentage             INT NOT NULL DEFAULT 50,
    deposit_cents                  INT NOT NULL,
    balance_cents                  INT NOT NULL,
    balance_due_at                 TIMESTAMP,

    status                         VARCHAR(50) NOT NULL DEFAULT 'pending',
    source                         VARCHAR(50) NOT NULL DEFAULT 'direct',
    guest_message                  TEXT,
    admin_notes                    TEXT,
    cancelled_at                   TIMESTAMP,
    cancellation_reason            TEXT,
    confirmed_at                   TIMESTAMP,
    created_at                     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    CHECK (check_out > check_in),
    CHECK (nights > 0)
);

CREATE TABLE booking_fees (
    id                VARCHAR(36) PRIMARY KEY,
    booking_id        VARCHAR(36) NOT NULL,
    property_fee_id   VARCHAR(36),
    fee_type_key      VARCHAR(255) NOT NULL,
    name              VARCHAR(255) NOT NULL,
    calculation       VARCHAR(50) NOT NULL,
    amount_cents      INT NOT NULL,
    percentage_bps    INT,
    is_optional       BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin_override BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (property_fee_id) REFERENCES property_fees(id) ON DELETE SET NULL
);

CREATE TABLE payments (
    id                       VARCHAR(36) PRIMARY KEY,
    booking_id               VARCHAR(36) NOT NULL,
    kind                     VARCHAR(50) NOT NULL,
    amount_cents             INT NOT NULL,
    status                   VARCHAR(50) NOT NULL DEFAULT 'pending',
    due_at                   TIMESTAMP,
    paid_at                  TIMESTAMP,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id         VARCHAR(255),
    stripe_payment_method    VARCHAR(255),
    stripe_last_error        TEXT,
    created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);

CREATE TABLE booking_events (
    id         VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload    JSON NOT NULL,
    actor_type VARCHAR(50),
    actor_id   VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id                  VARCHAR(36) PRIMARY KEY,
    booking_id          VARCHAR(36) NOT NULL UNIQUE,
    property_id         VARCHAR(36) NOT NULL,
    user_id             VARCHAR(36) NOT NULL,
    rating_overall      INT NOT NULL,
    rating_cleanliness  INT,
    rating_accuracy     INT,
    rating_location     INT,
    rating_value        INT,
    public_comment      TEXT,
    private_feedback    TEXT,
    host_reply          TEXT,
    host_replied_at     TIMESTAMP,
    host_replied_by     VARCHAR(255),
    status              VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    CHECK (rating_overall BETWEEN 1 AND 5)
);

CREATE TABLE stripe_webhook_events (
    id           VARCHAR(255) PRIMARY KEY,
    type         VARCHAR(255) NOT NULL,
    payload      JSON NOT NULL,
    processed_at TIMESTAMP,
    error        TEXT,
    received_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_photos_property ON property_photos(property_id, position);
CREATE INDEX idx_property_fees_active ON property_fees(property_id, is_active);
CREATE INDEX idx_bookings_property_dates ON bookings(property_id, check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_booking_fees_booking ON booking_fees(booking_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_booking_events_booking ON booking_events(booking_id, created_at);
CREATE INDEX idx_reviews_property_published ON reviews(property_id, status);
CREATE INDEX idx_reviews_user ON reviews(user_id);

CREATE OR REPLACE VIEW v_booking_payment_status AS
SELECT
    b.id AS booking_id,
    b.total_cents,
    COALESCE(SUM(p.amount_cents), 0) AS paid_cents,
    b.total_cents - COALESCE(SUM(p.amount_cents), 0) AS outstanding_cents,
    CASE
        WHEN COALESCE(SUM(p.amount_cents), 0) >= b.total_cents THEN 'paid'
        WHEN COALESCE(SUM(p.amount_cents), 0) > 0 THEN 'partial'
        ELSE 'unpaid'
    END AS payment_state
FROM bookings b
LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'succeeded'
GROUP BY b.id, b.total_cents;

CREATE OR REPLACE VIEW v_property_status_today AS
SELECT
    p.id AS property_id,
    p.slug,
    p.name,
    p.status,
    EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.property_id = p.id
          AND b.status IN ('confirmed', 'checked_in')
          AND CURRENT_DATE BETWEEN b.check_in AND (b.check_out - INTERVAL '1 day')
    ) AS is_occupied_today,
    (
        SELECT MIN(b.check_in)
        FROM bookings b
        WHERE b.property_id = p.id
          AND b.status IN ('pending', 'confirmed')
          AND b.check_in >= CURRENT_DATE
    ) AS next_booking_date
FROM properties p
WHERE p.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_guest_summary AS
SELECT
    u.id AS user_id,
    u.email,
    u.name AS full_name,
    SUM(CASE WHEN b.status IN ('completed', 'checked_out') THEN 1 ELSE 0 END) AS stays_completed,
    SUM(CASE WHEN b.status IN ('confirmed', 'checked_in') THEN 1 ELSE 0 END) AS stays_upcoming,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS stays_cancelled,
    COALESCE(SUM(CASE WHEN b.status IN ('completed', 'checked_out') THEN b.total_cents ELSE 0 END), 0) AS lifetime_spend_cents,
    ROUND(AVG(CASE WHEN r.status = 'published' THEN r.rating_overall ELSE NULL END), 2) AS avg_rating_given,
    MAX(b.check_out) AS last_stay_ended_on
FROM "user" u
LEFT JOIN bookings b ON b.user_id = u.id
LEFT JOIN reviews r ON r.user_id = u.id
WHERE EXISTS (SELECT 1 FROM bookings WHERE user_id = u.id)
GROUP BY u.id, u.email, u.name;
