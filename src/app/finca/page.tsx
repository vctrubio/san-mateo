import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Home, MapPin, Users } from "lucide-react";
import PropertyAvailability from "@/components/PropertyAvailability";
import BookingLookup from "@/components/BookingLookup";
import { Suspense } from "react";
import { getPropertySummaries } from "@/services/PropertyService";

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

const fallbackImages: Record<string, string> = {
  levante: "/images/levante.png",
  estrecho: "/images/estrecho.png",
  marea: "/images/marea.png",
  cala: "/images/cala.png",
};

export default async function FincaPage() {
  const properties = await getPropertySummaries();

  return (
    <main className="min-h-screen bg-[#F5F2ED]">
      <section className="px-6 pt-16 pb-10 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Finca overview</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900">
              Book directly from the estate inventory.
            </h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              Explore each property, then reserve a stay using the availability flow below. Booking confirmations
              appear immediately in the admin dashboards.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean"
            >
              Back to landing
            </Link>
            <Link
              href="/user"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean"
            >
              Guest surface
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean"
            >
              Admin dashboard
            </Link>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg md:grid-cols-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Estate</p>
              <p className="mt-2 text-xl font-bold">Finca San Mateo</p>
              <p className="text-sm text-slate-300">Tarifa, ES</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Inventory</p>
              <p className="mt-2 text-xl font-bold">{properties.length} active stays</p>
              <p className="text-sm text-slate-300">Direct booking enabled</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Mode</p>
              <p className="mt-2 text-xl font-bold text-slate-50">Testing flow</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {properties.map((property) => {
            const cover = property.cover_photo_key?.startsWith("images/")
              ? `/${property.cover_photo_key}`
              : fallbackImages[property.slug] ?? "/images/levante.png";

            return (
              <Link
                key={property.id}
                href={`/finca/${property.slug}`}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div className="relative h-48">
                  <Image
                    src={cover}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">{property.property_type}</p>
                    <h2 className="text-xl font-bold text-slate-900">{property.name}</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {property.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sleeps {property.max_guests}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-slate-400" />
                      <span>{property.bedrooms} bd · {property.beds} beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      <span>{property.min_nights}+ nights</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatMoney(property.base_price_cents)}/night</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

        </div>
      </section>

      <section className="bg-white border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 py-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <PropertyAvailability />
          <Suspense fallback={null}>
            <BookingLookup />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
