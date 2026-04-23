CREATE DATABASE IF NOT EXISTS san_mateo;
USE san_mateo;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS fincas;

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
    contact_email     VARCHAR(255),
    contact_phone     VARCHAR(50),
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at        DATETIME NULL
);

CREATE TABLE properties (
    id                VARCHAR(36) PRIMARY KEY,
    finca_id          VARCHAR(36) NOT NULL,
    slug              VARCHAR(255) UNIQUE NOT NULL,
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    property_type     VARCHAR(50) NOT NULL,
    status            VARCHAR(50) NOT NULL DEFAULT 'draft',
    max_guests        INT NOT NULL CHECK (max_guests > 0),
    bedrooms          INT NOT NULL DEFAULT 0,
    beds              INT NOT NULL DEFAULT 0,
    bathrooms         DECIMAL(3,1) NOT NULL DEFAULT 0,
    base_price_cents  INT NOT NULL CHECK (base_price_cents >= 0),
    currency          CHAR(3) NOT NULL DEFAULT 'EUR',
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at        DATETIME NULL,
    FOREIGN KEY (finca_id) REFERENCES fincas(id) ON DELETE RESTRICT
);

CREATE TABLE guests (
    id                 VARCHAR(36) PRIMARY KEY,
    email              VARCHAR(255) UNIQUE NOT NULL,
    first_name         VARCHAR(255),
    last_name          VARCHAR(255),
    phone              VARCHAR(50),
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
    num_adults                     INT NOT NULL DEFAULT 1,
    num_children                   INT NOT NULL DEFAULT 0,
    
    currency                       CHAR(3) NOT NULL,
    nightly_rate_cents             INT NOT NULL,
    accommodation_cents            INT NOT NULL,
    fees_cents                     INT NOT NULL DEFAULT 0,
    total_cents                    INT NOT NULL,

    status                         VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    created_at                     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT
);
