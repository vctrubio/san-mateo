CREATE DATABASE IF NOT EXISTS san_mateo;
USE san_mateo;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `verification`;
DROP TABLE IF EXISTS `account`;
DROP TABLE IF EXISTS `session`;
DROP TABLE IF EXISTS `user`;

DROP VIEW IF EXISTS v_guest_summary;
DROP VIEW IF EXISTS v_property_status_today;
DROP VIEW IF EXISTS v_booking_payment_status;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS booking_events;
DROP TABLE IF EXISTS stripe_webhook_events;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS booking_fees;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS property_fees;
DROP TABLE IF EXISTS fee_types;
DROP TABLE IF EXISTS property_amenities;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS property_photos;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS fincas;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `user` (
    id              VARCHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    emailVerified   BOOLEAN NOT NULL DEFAULT FALSE,
    image           TEXT,
    role            VARCHAR(32) NOT NULL DEFAULT 'user',
    banned          BOOLEAN NOT NULL DEFAULT FALSE,
    banReason       TEXT,
    banExpires      DATETIME NULL,
    createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_role ON `user`(role);

CREATE TABLE `session` (
    id              VARCHAR(36) PRIMARY KEY,
    expiresAt       DATETIME NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ipAddress       TEXT,
    userAgent       TEXT,
    userId          VARCHAR(36) NOT NULL,
    impersonatedBy  VARCHAR(36),
    FOREIGN KEY (userId) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_userId ON `session`(userId);

CREATE TABLE `account` (
    id                      VARCHAR(36) PRIMARY KEY,
    accountId               VARCHAR(255) NOT NULL,
    providerId              VARCHAR(255) NOT NULL,
    userId                  VARCHAR(36) NOT NULL,
    accessToken             TEXT,
    refreshToken            TEXT,
    idToken                 TEXT,
    accessTokenExpiresAt    DATETIME NULL,
    refreshTokenExpiresAt   DATETIME NULL,
    scope                   TEXT,
    password                TEXT,
    createdAt               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE INDEX idx_account_userId ON `account`(userId);

CREATE TABLE `verification` (
    id          VARCHAR(36) PRIMARY KEY,
    identifier  VARCHAR(255) NOT NULL,
    value       TEXT NOT NULL,
    expiresAt   DATETIME NOT NULL,
    createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_identifier ON `verification`(identifier);

CREATE TABLE fincas (
    id                VARCHAR(36) PRIMARY KEY,
    slug              VARCHAR(255) UNIQUE NOT NULL,
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    address_line1     VARCHAR(255) NOT NULL,
    address_line2     VARCHAR(255),
    city              VARCHAR(255) NOT NULL,
    region            VARCHAR(255),
    country           CHAR(2) NOT NULL,
    postal_code       VARCHAR(50),
    latitude          DECIMAL(9,6),
    longitude         DECIMAL(9,6),
    timezone          VARCHAR(50) NOT NULL DEFAULT 'Europe/Madrid',
    google_place_id   VARCHAR(255),
    contact_email     VARCHAR(255),
    contact_phone     VARCHAR(50),
    website_url       VARCHAR(255),
    check_in_time     TIME NOT NULL DEFAULT '15:00:00',
    check_out_time    TIME NOT NULL DEFAULT '11:00:00',
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at        DATETIME NULL
);

CREATE TABLE properties (
    id                 VARCHAR(36) PRIMARY KEY,
    finca_id           VARCHAR(36) NOT NULL,
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
    currency           CHAR(3) NOT NULL DEFAULT 'EUR',
    min_nights         INT NOT NULL DEFAULT 1,
    deposit_percentage INT NOT NULL DEFAULT 50,
    balance_due_days_before_checkin INT NOT NULL DEFAULT 14,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at         DATETIME NULL,
    FOREIGN KEY (finca_id) REFERENCES fincas(id) ON DELETE RESTRICT
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
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE amenities (
    id       VARCHAR(36) PRIMARY KEY,
    `key`    VARCHAR(255) UNIQUE NOT NULL,
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
    `key`    VARCHAR(255) UNIQUE NOT NULL,
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
    currency        CHAR(3) NOT NULL DEFAULT 'EUR',
    is_optional     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    position        INT NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id),
    CHECK (
        (calculation = 'percentage' AND percentage_bps IS NOT NULL)
        OR (calculation <> 'percentage')
    )
);

CREATE TABLE guests (
    id                 VARCHAR(36) PRIMARY KEY,
    email              VARCHAR(255) UNIQUE NOT NULL,
    first_name         VARCHAR(255),
    last_name          VARCHAR(255),
    phone              VARCHAR(50),
    country            CHAR(2),
    preferred_language CHAR(2) DEFAULT 'en',
    stripe_customer_id VARCHAR(255) UNIQUE,
    notes              TEXT,
    user_id            VARCHAR(255) UNIQUE,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id                             VARCHAR(36) PRIMARY KEY,
    reference                      VARCHAR(50) UNIQUE NOT NULL,
    property_id                    VARCHAR(36) NOT NULL,
    guest_id                       VARCHAR(36) NOT NULL,
    check_in                       DATE NOT NULL,
    check_out                      DATE NOT NULL,
    nights                         INT NOT NULL,
    num_adults                     INT NOT NULL DEFAULT 1,
    num_children                   INT NOT NULL DEFAULT 0,
    num_infants                    INT NOT NULL DEFAULT 0,

    currency                       CHAR(3) NOT NULL,
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
    balance_due_at                 DATETIME,

    status                         VARCHAR(50) NOT NULL DEFAULT 'pending',
    source                         VARCHAR(50) NOT NULL DEFAULT 'direct',
    guest_message                  TEXT,
    admin_notes                    TEXT,
    cancelled_at                   DATETIME,
    cancellation_reason            TEXT,
    confirmed_at                   DATETIME,
    created_at                     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    CHECK (check_out > check_in),
    CHECK (num_adults >= 1),
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
    currency          CHAR(3) NOT NULL,
    is_optional       BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin_override BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (property_fee_id) REFERENCES property_fees(id) ON DELETE SET NULL
);

CREATE TABLE payments (
    id                       VARCHAR(36) PRIMARY KEY,
    booking_id               VARCHAR(36) NOT NULL,
    kind                     VARCHAR(50) NOT NULL,
    amount_cents             INT NOT NULL,
    currency                 CHAR(3) NOT NULL,
    status                   VARCHAR(50) NOT NULL DEFAULT 'pending',
    due_at                   DATETIME,
    paid_at                  DATETIME,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id         VARCHAR(255),
    stripe_payment_method    VARCHAR(255),
    stripe_last_error        TEXT,
    created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);

CREATE TABLE booking_events (
    id         VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload    JSON NOT NULL,
    actor_type VARCHAR(50),
    actor_id   VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id                  VARCHAR(36) PRIMARY KEY,
    booking_id          VARCHAR(36) NOT NULL UNIQUE,
    property_id         VARCHAR(36) NOT NULL,
    guest_id            VARCHAR(36) NOT NULL,
    rating_overall      INT NOT NULL,
    rating_cleanliness  INT,
    rating_accuracy     INT,
    rating_location     INT,
    rating_value        INT,
    public_comment      TEXT,
    private_feedback    TEXT,
    host_reply          TEXT,
    host_replied_at     DATETIME,
    host_replied_by     VARCHAR(255),
    status              VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    CHECK (rating_overall BETWEEN 1 AND 5)
);

CREATE TABLE stripe_webhook_events (
    id           VARCHAR(255) PRIMARY KEY,
    type         VARCHAR(255) NOT NULL,
    payload      JSON NOT NULL,
    processed_at DATETIME,
    error        TEXT,
    received_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_finca ON properties(finca_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_photos_property ON property_photos(property_id, position);
CREATE INDEX idx_property_fees_active ON property_fees(property_id, is_active);
CREATE INDEX idx_bookings_property_dates ON bookings(property_id, check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_booking_fees_booking ON booking_fees(booking_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_booking_events_booking ON booking_events(booking_id, created_at);
CREATE INDEX idx_reviews_property_published ON reviews(property_id, status);
CREATE INDEX idx_reviews_guest ON reviews(guest_id);

CREATE VIEW v_booking_payment_status AS
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

CREATE VIEW v_property_status_today AS
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
          AND CURRENT_DATE BETWEEN b.check_in AND DATE_SUB(b.check_out, INTERVAL 1 DAY)
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

CREATE VIEW v_guest_summary AS
SELECT
    g.id AS guest_id,
    g.email,
    g.first_name,
    g.last_name,
    SUM(CASE WHEN b.status IN ('completed', 'checked_out') THEN 1 ELSE 0 END) AS stays_completed,
    SUM(CASE WHEN b.status IN ('confirmed', 'checked_in') THEN 1 ELSE 0 END) AS stays_upcoming,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS stays_cancelled,
    COALESCE(SUM(CASE WHEN b.status IN ('completed', 'checked_out') THEN b.total_cents ELSE 0 END), 0) AS lifetime_spend_cents,
    ROUND(AVG(CASE WHEN r.status = 'published' THEN r.rating_overall ELSE NULL END), 2) AS avg_rating_given,
    MAX(b.check_out) AS last_stay_ended_on
FROM guests g
LEFT JOIN bookings b ON b.guest_id = g.id
LEFT JOIN reviews r ON r.guest_id = g.id
GROUP BY g.id, g.email, g.first_name, g.last_name;
