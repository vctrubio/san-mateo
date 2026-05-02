import crypto from 'crypto';
import { getConnection } from './client';

type PropertySeed = {
  id: string;
  slug: string;
  name: string;
  description: string;
  propertyType: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  basePriceCents: number;
  mapX: number;
  mapY: number;
  mapZ: number;
  minNights: number;
  depositPercentage: number;
  balanceDueDaysBeforeCheckin: number;
};

const makeId = () => crypto.randomUUID();

async function main() {
  const conn = await getConnection();
  console.log('🌱 Seeding database with a full working estate...');

  try {
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of [
      'reviews',
      'booking_events',
      'stripe_webhook_events',
      'payments',
      'booking_fees',
      'bookings',
      'property_fees',
      'property_amenities',
      'amenities',
      'property_photos',
      'properties',
      'guests',
      'fincas',
      'fee_types',
    ]) {
      await conn.execute(`DELETE FROM ${table}`);
    }
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

    const fincaId = makeId();
    await conn.execute(
      `INSERT INTO fincas (
        id, slug, name, description, address_line1, address_line2, city, region, country,
        postal_code, latitude, longitude, timezone, google_place_id, contact_email,
        contact_phone, website_url, check_in_time, check_out_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fincaId,
        'finca-san-mateo',
        'Finca San Mateo',
        'A coastal estate with a simple, polished booking experience: browse, book, pay, and review from one model.',
        'Carretera Nacional 340, Km 75',
        'Casa Blanca',
        'Tarifa',
        'Andalucia',
        'ES',
        '11380',
        36.0469,
        -5.6318,
        'Europe/Madrid',
        'place_san_mateo_demo',
        'hello@fincasanmateo.test',
        '+34 956 000 123',
        'https://sanmateo.test',
        '15:00:00',
        '11:00:00',
      ]
    );

    const propertySeeds: PropertySeed[] = [
      {
        id: makeId(),
        slug: 'levante',
        name: 'Levante',
        description: 'The flagship villa with the biggest footprint, the strongest views, and the clearest admin story.',
        propertyType: 'villa',
        maxGuests: 6,
        bedrooms: 3,
        beds: 4,
        bathrooms: 2.5,
        basePriceCents: 125000,
        mapX: -14,
        mapY: 3,
        mapZ: 8,
        minNights: 3,
        depositPercentage: 50,
        balanceDueDaysBeforeCheckin: 14,
      },
      {
        id: makeId(),
        slug: 'estrecho',
        name: 'Estrecho',
        description: 'A two-bedroom residence for medium-stay bookings and the clearest payment-status demo.',
        propertyType: 'residence',
        maxGuests: 4,
        bedrooms: 2,
        beds: 3,
        bathrooms: 2,
        basePriceCents: 92000,
        mapX: -2,
        mapY: 1,
        mapZ: 11,
        minNights: 2,
        depositPercentage: 50,
        balanceDueDaysBeforeCheckin: 10,
      },
      {
        id: makeId(),
        slug: 'marea',
        name: 'Marea',
        description: 'A compact retreat that makes the guest view feel small and personal.',
        propertyType: 'retreat',
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        basePriceCents: 64000,
        mapX: 12,
        mapY: 0,
        mapZ: 6,
        minNights: 2,
        depositPercentage: 100,
        balanceDueDaysBeforeCheckin: 0,
      },
      {
        id: makeId(),
        slug: 'cala',
        name: 'Cala',
        description: 'The smallest bungalow, useful for showing the simpler user journey and lighter housekeeping load.',
        propertyType: 'bungalow',
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        basePriceCents: 58000,
        mapX: 19,
        mapY: -2,
        mapZ: 2,
        minNights: 2,
        depositPercentage: 50,
        balanceDueDaysBeforeCheckin: 7,
      },
    ];

    for (const property of propertySeeds) {
      await conn.execute(
        `INSERT INTO properties (
          id, finca_id, slug, name, description, property_type, status, map_x, map_y, map_z,
          max_guests, bedrooms, beds, bathrooms, base_price_cents, currency, min_nights,
          deposit_percentage, balance_due_days_before_checkin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          property.id,
          fincaId,
          property.slug,
          property.name,
          property.description,
          property.propertyType,
          'active',
          property.mapX,
          property.mapY,
          property.mapZ,
          property.maxGuests,
          property.bedrooms,
          property.beds,
          property.bathrooms,
          property.basePriceCents,
          'EUR',
          property.minNights,
          property.depositPercentage,
          property.balanceDueDaysBeforeCheckin,
        ]
      );
    }

    const amenitySeeds = [
      ['wifi', 'WiFi', 'comfort', 'wifi'],
      ['pool', 'Pool', 'outdoor', 'waves'],
      ['kitchen', 'Kitchen', 'living', 'chef-hat'],
      ['sea-view', 'Sea View', 'view', 'mountain-sun'],
      ['parking', 'Parking', 'practical', 'car-front'],
      ['bbq', 'BBQ', 'outdoor', 'flame'],
      ['ac', 'Air Conditioning', 'comfort', 'snowflake'],
      ['washer', 'Washer', 'practical', 'washing-machine'],
    ] as const;

    const amenityIds = new Map<string, string>();
    for (const [key, label, category, icon] of amenitySeeds) {
      const id = makeId();
      amenityIds.set(key, id);
      await conn.execute(
        'INSERT INTO amenities (id, `key`, label, category, icon) VALUES (?, ?, ?, ?, ?)',
        [id, key, label, category, icon]
      );
    }

    const propertyAmenityMap: Record<string, string[]> = {
      levante: ['wifi', 'pool', 'kitchen', 'sea-view', 'parking', 'bbq', 'ac', 'washer'],
      estrecho: ['wifi', 'kitchen', 'sea-view', 'parking', 'ac', 'washer'],
      marea: ['wifi', 'sea-view', 'kitchen', 'ac'],
      cala: ['wifi', 'parking', 'bbq', 'ac'],
    };

    for (const property of propertySeeds) {
      for (const key of propertyAmenityMap[property.slug]) {
        const amenityId = amenityIds.get(key);
        if (!amenityId) {
          continue;
        }
        await conn.execute(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
          [property.id, amenityId]
        );
      }
    }

    const feeTypeSeeds = [
      ['cleaning', 'Cleaning Fee', true],
      ['arrival', 'Late Arrival Fee', true],
      ['service', 'Service Fee', true],
      ['tourist-tax', 'Tourist Tax', false],
    ] as const;

    const feeTypeIds = new Map<string, string>();
    for (const [key, label, taxable] of feeTypeSeeds) {
      const id = makeId();
      feeTypeIds.set(key, id);
      await conn.execute(
        'INSERT INTO fee_types (id, `key`, label, taxable) VALUES (?, ?, ?, ?)',
        [id, key, label, taxable]
      );
    }

    const propertyFeeRows = [
      { slug: 'levante', name: 'Standard cleaning', calculation: 'flat', amount_cents: 28000, fee_type_key: 'cleaning' },
      { slug: 'levante', name: 'Late arrival support', calculation: 'flat', amount_cents: 12000, fee_type_key: 'arrival' },
      { slug: 'estrecho', name: 'Standard cleaning', calculation: 'flat', amount_cents: 22000, fee_type_key: 'cleaning' },
      { slug: 'estrecho', name: 'Service fee', calculation: 'flat', amount_cents: 15000, fee_type_key: 'service' },
      { slug: 'marea', name: 'Standard cleaning', calculation: 'flat', amount_cents: 15000, fee_type_key: 'cleaning' },
      { slug: 'cala', name: 'Standard cleaning', calculation: 'flat', amount_cents: 14000, fee_type_key: 'cleaning' },
    ] as const;

    const propertyFeeIds = new Map<string, Array<{ id: string; name: string; calculation: string; amount_cents: number; fee_type_key: string }>>();
    for (const row of propertyFeeRows) {
      const property = propertySeeds.find((item) => item.slug === row.slug);
      if (!property) continue;
      const id = makeId();
      const rows = propertyFeeIds.get(property.slug) ?? [];
      rows.push({ id, name: row.name, calculation: row.calculation, amount_cents: row.amount_cents, fee_type_key: row.fee_type_key });
      propertyFeeIds.set(property.slug, rows);
      const feeTypeId = feeTypeIds.get(row.fee_type_key);
      if (!feeTypeId) {
        continue;
      }
      await conn.execute(
        `INSERT INTO property_fees (
          id, property_id, fee_type_id, name, calculation, amount_cents, currency,
          is_optional, is_active, position
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          property.id,
          feeTypeId,
          row.name,
          row.calculation,
          row.amount_cents,
          'EUR',
          false,
          true,
          rows.length - 1,
        ]
      );
    }

    for (const property of propertySeeds) {
      await conn.execute(
        `INSERT INTO property_photos (
          id, property_id, storage_key, caption, alt_text, position, is_cover, width_px, height_px, blurhash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          makeId(),
          property.id,
          `property/${property.slug}/cover.jpg`,
          `${property.name} exterior`,
          `${property.name} cover image`,
          0,
          true,
          2400,
          1600,
          'L9A8%?xut7WBD%RjRjRjRjRjRjRj',
        ]
      );
    }

    const guestSeeds = [
      {
        id: makeId(),
        email: 'amelia@example.com',
        firstName: 'Amelia',
        lastName: 'Carver',
        phone: '+44 7700 900111',
        country: 'GB',
        preferredLanguage: 'en',
        stripeCustomerId: 'cus_demo_001',
      },
      {
        id: makeId(),
        email: 'diego@example.com',
        firstName: 'Diego',
        lastName: 'Ruiz',
        phone: '+34 600 111 222',
        country: 'ES',
        preferredLanguage: 'es',
        stripeCustomerId: 'cus_demo_002',
      },
      {
        id: makeId(),
        email: 'nora@example.com',
        firstName: 'Nora',
        lastName: 'Peters',
        phone: '+49 151 222 3333',
        country: 'DE',
        preferredLanguage: 'de',
        stripeCustomerId: 'cus_demo_003',
      },
    ] as const;

    for (const guest of guestSeeds) {
      await conn.execute(
        `INSERT INTO guests (
          id, email, first_name, last_name, phone, country, preferred_language,
          stripe_customer_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          guest.id,
          guest.email,
          guest.firstName,
          guest.lastName,
          guest.phone,
          guest.country,
          guest.preferredLanguage,
          guest.stripeCustomerId,
          'Seeded guest for dashboard illustration',
        ]
      );
    }

    await conn.execute(
      `INSERT INTO \`user\` (
        id, name, email, emailVerified, role, banned
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        role = VALUES(role),
        banned = VALUES(banned)`,
      [
        "user_admin_seed",
        "San Mateo Admin",
        "admin@sanmateo.test",
        true,
        "admin",
        false,
      ]
    );

    await conn.execute(
      `INSERT INTO \`account\` (
        id, accountId, providerId, userId, password
      ) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        password = VALUES(password)`,
      [
        "account_admin_seed",
        "admin@sanmateo.test",
        "credential",
        "user_admin_seed",
        "2fc5aa496e04f89963c2cd1d7826a159:aaadc8d0544f5c6673f43b3af4548a74da2a4d18eb6c6cf850c391ef4b06acc1250a3f9db439e7ac93de60b0f3246c7c03e3d9bfd1a1b8f5ac2c08c3609cdf67",
      ]
    );

    type BookingSeed = {
      reference: string;
      propertySlug: string;
      guestEmail: string;
      checkIn: string;
      checkOut: string;
      nights: number;
      numAdults: number;
      numChildren: number;
      numInfants: number;
      status: string;
      source: string;
      nightlyRateCents: number;
      accommodationCents: number;
      feesCents: number;
      taxesCents: number;
      discountCents: number;
      losDiscountCents: number;
      losDiscountName: string | null;
      totalCents: number;
      depositPercentage: number;
      depositCents: number;
      balanceCents: number;
      balanceDueAt: string;
      paymentState: string;
      bookingEvents: string[];
      review?: {
        overall: number;
        cleanliness: number;
        accuracy: number;
        location: number;
        value: number;
        comment: string;
        privateFeedback: string;
        status: string;
      };
    };

    const bookingSeeds: BookingSeed[] = [
      {
        reference: 'INF-2026-0001',
        propertySlug: 'levante',
        guestEmail: 'amelia@example.com',
        checkIn: '2026-05-12',
        checkOut: '2026-05-19',
        nights: 7,
        numAdults: 4,
        numChildren: 1,
        numInfants: 0,
        status: 'confirmed',
        source: 'direct',
        nightlyRateCents: 125000,
        accommodationCents: 875000,
        feesCents: 40000,
        taxesCents: 0,
        discountCents: 25000,
        losDiscountCents: 25000,
        losDiscountName: '7+ nights',
        totalCents: 890000,
        depositPercentage: 50,
        depositCents: 445000,
        balanceCents: 445000,
        balanceDueAt: '2026-04-28 12:00:00',
        paymentState: 'partial',
        bookingEvents: ['booking.created', 'booking.confirmed'],
      },
      {
        reference: 'INF-2026-0002',
        propertySlug: 'estrecho',
        guestEmail: 'diego@example.com',
        checkIn: '2026-03-03',
        checkOut: '2026-03-07',
        nights: 4,
        numAdults: 2,
        numChildren: 0,
        numInfants: 0,
        status: 'completed',
        source: 'admin',
        nightlyRateCents: 92000,
        accommodationCents: 368000,
        feesCents: 37000,
        taxesCents: 0,
        discountCents: 18000,
        losDiscountCents: 18000,
        losDiscountName: '4 nights stay',
        totalCents: 387000,
        depositPercentage: 50,
        depositCents: 193500,
        balanceCents: 193500,
        balanceDueAt: '2026-02-18 12:00:00',
        paymentState: 'paid',
        bookingEvents: ['booking.created', 'booking.confirmed', 'booking.checked_out', 'booking.completed'],
        review: {
          overall: 5,
          cleanliness: 5,
          accuracy: 5,
          location: 4,
          value: 5,
          comment: 'The admin flow felt instant and the place matched the photos.',
          privateFeedback: 'Great candidate for a recurring winter stay.',
          status: 'published',
        },
      },
      {
        reference: 'INF-2026-0003',
        propertySlug: 'marea',
        guestEmail: 'nora@example.com',
        checkIn: '2026-07-08',
        checkOut: '2026-07-11',
        nights: 3,
        numAdults: 2,
        numChildren: 0,
        numInfants: 0,
        status: 'pending',
        source: 'direct',
        nightlyRateCents: 64000,
        accommodationCents: 192000,
        feesCents: 15000,
        taxesCents: 0,
        discountCents: 0,
        losDiscountCents: 0,
        losDiscountName: null,
        totalCents: 207000,
        depositPercentage: 100,
        depositCents: 207000,
        balanceCents: 0,
        balanceDueAt: '2026-07-08 00:00:00',
        paymentState: 'unpaid',
        bookingEvents: ['booking.created'],
      },
    ];

    const bookingIds = new Map<string, string>();

    for (const bookingSeed of bookingSeeds) {
      const property = propertySeeds.find((item) => item.slug === bookingSeed.propertySlug);
      const guest = guestSeeds.find((item) => item.email === bookingSeed.guestEmail);

      if (!property || !guest) {
        throw new Error(`Missing seed dependency for ${bookingSeed.reference}`);
      }

      const bookingId = makeId();
      bookingIds.set(bookingSeed.reference, bookingId);

      await conn.execute(
        `INSERT INTO bookings (
          id, reference, property_id, guest_id, check_in, check_out, nights,
          num_adults, num_children, num_infants, currency, nightly_rate_cents,
          accommodation_cents, fees_cents, taxes_cents, discount_cents,
          length_of_stay_discount_cents, length_of_stay_discount_name,
          total_cents, deposit_percentage, deposit_cents, balance_cents,
          balance_due_at, status, source, guest_message, admin_notes,
          cancelled_at, cancellation_reason, confirmed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          bookingSeed.reference,
          property.id,
          guest.id,
          bookingSeed.checkIn,
          bookingSeed.checkOut,
          bookingSeed.nights,
          bookingSeed.numAdults,
          bookingSeed.numChildren,
          bookingSeed.numInfants,
          'EUR',
          bookingSeed.nightlyRateCents,
          bookingSeed.accommodationCents,
          bookingSeed.feesCents,
          bookingSeed.taxesCents,
          bookingSeed.discountCents,
          bookingSeed.losDiscountCents,
          bookingSeed.losDiscountName,
          bookingSeed.totalCents,
          bookingSeed.depositPercentage,
          bookingSeed.depositCents,
          bookingSeed.balanceCents,
          bookingSeed.balanceDueAt,
          bookingSeed.status,
          bookingSeed.source,
          bookingSeed.status === 'pending' ? 'Please confirm the dates and guest count.' : null,
          bookingSeed.status === 'completed' ? 'Converted into the public dashboard story.' : 'Held for preview.',
          null,
          null,
          bookingSeed.status === 'completed' ? '2026-03-07 11:15:00' : bookingSeed.status === 'confirmed' ? '2026-04-22 10:00:00' : null,
        ]
      );

      const feeRows = propertyFeeIds.get(property.slug) ?? [];
      for (const feeRow of feeRows) {
        await conn.execute(
          `INSERT INTO booking_fees (
            id, booking_id, property_fee_id, fee_type_key, name, calculation,
            amount_cents, percentage_bps, currency, is_optional, is_admin_override
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            makeId(),
            bookingId,
            feeRow.id,
            feeRow.fee_type_key,
            feeRow.name,
            feeRow.calculation,
            feeRow.amount_cents,
            null,
            'EUR',
            false,
            false,
          ]
        );
      }

      const depositSucceeded = bookingSeed.paymentState !== 'unpaid';
      const balanceSucceeded = bookingSeed.paymentState === 'paid';

      await conn.execute(
        `INSERT INTO payments (
          id, booking_id, kind, amount_cents, currency, status, due_at,
          paid_at, stripe_payment_intent_id, stripe_charge_id, stripe_payment_method
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          makeId(),
          bookingId,
          'deposit',
          bookingSeed.depositCents,
          'EUR',
          depositSucceeded ? 'succeeded' : 'pending',
          bookingSeed.balanceDueAt,
          depositSucceeded ? '2026-04-22 09:40:00' : null,
          `pi_${bookingSeed.reference.replace(/-/g, '').toLowerCase()}_deposit`,
          depositSucceeded ? `ch_${bookingSeed.reference.replace(/-/g, '').toLowerCase()}_deposit` : null,
          depositSucceeded ? 'card' : null,
        ]
      );

      await conn.execute(
        `INSERT INTO payments (
          id, booking_id, kind, amount_cents, currency, status, due_at,
          paid_at, stripe_payment_intent_id, stripe_charge_id, stripe_payment_method
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          makeId(),
          bookingId,
          'balance',
          bookingSeed.balanceCents,
          'EUR',
          balanceSucceeded ? 'succeeded' : 'pending',
          bookingSeed.status === 'completed' ? '2026-03-06 12:00:00' : bookingSeed.balanceDueAt,
          balanceSucceeded ? '2026-03-07 10:10:00' : null,
          `pi_${bookingSeed.reference.replace(/-/g, '').toLowerCase()}_balance`,
          balanceSucceeded ? `ch_${bookingSeed.reference.replace(/-/g, '').toLowerCase()}_balance` : null,
          balanceSucceeded ? 'card' : null,
        ]
      );

      for (const eventType of bookingSeed.bookingEvents) {
        await conn.execute(
          'INSERT INTO booking_events (id, booking_id, event_type, payload, actor_type, actor_id) VALUES (?, ?, ?, ?, ?, ?)',
          [
            makeId(),
            bookingId,
            eventType,
            JSON.stringify({ reference: bookingSeed.reference, property: property.slug }),
            eventType.includes('booking') ? 'admin' : 'system',
            eventType.includes('booking') ? 'user_demo_1' : null,
          ]
        );
      }

      if (bookingSeed.review) {
        await conn.execute(
          `INSERT INTO reviews (
            id, booking_id, property_id, guest_id, rating_overall, rating_cleanliness,
            rating_accuracy, rating_location, rating_value, public_comment,
            private_feedback, host_reply, host_replied_at, host_replied_by, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            makeId(),
            bookingId,
            property.id,
            guest.id,
            bookingSeed.review.overall,
            bookingSeed.review.cleanliness,
            bookingSeed.review.accuracy,
            bookingSeed.review.location,
            bookingSeed.review.value,
            bookingSeed.review.comment,
            bookingSeed.review.privateFeedback,
            'Thanks for staying with us. See you next season.',
            '2026-03-08 09:00:00',
            'user_demo_1',
            bookingSeed.review.status,
          ]
        );
      }
    }

    await conn.execute(
      `INSERT INTO stripe_webhook_events (id, type, payload, processed_at, error) VALUES (?, ?, ?, ?, ?)`,
      [
        'evt_demo_001',
        'payment_intent.succeeded',
        JSON.stringify({ reference: 'INF-2026-0002', bookingId: bookingIds.get('INF-2026-0002') }),
        '2026-03-07 10:10:00',
        null,
      ]
    );

    console.log('✅ Seed completed successfully.');
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error('❌ Error during seed:', error);
  process.exitCode = 1;
});
