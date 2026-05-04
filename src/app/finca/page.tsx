import Link from "next/link";
import Image from "next/image";
import { 
  Check, 
  X,
  Wifi, 
  Wind, 
  Car, 
  Users, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Sun,
  ArrowRight,
  Database,
  LayoutGrid
} from "lucide-react";
import PropertyAvailability from "@/components/PropertyAvailability";
import BookingLookup from "@/components/BookingLookup";
import { Suspense } from "react";
import { getPropertySummaries, getAllPropertyAmenities } from "@/services/PropertyService";

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

const propertyExtras: Record<string, { rooms: string; terrace: string; highlight: string }> = {
  levante: { rooms: "120m²", terrace: "80m²", highlight: "Panoramic sea views" },
  estrecho: { rooms: "85m²", terrace: "45m²", highlight: "Sunset orientation" },
  marea: { rooms: "45m²", terrace: "20m²", highlight: "Cozy retreat" },
  cala: { rooms: "35m²", terrace: "15m²", highlight: "Modern bungalow" },
};

const allAmenityLabels = [
  "WiFi", "Pool", "Kitchen", "Sea View", "Parking", "BBQ", "Air Conditioning", "Washer"
];

const sharedInfrastructure = [
  { icon: Wind, label: "Air Conditioning", description: "Full climate control" },
  { icon: Wifi, label: "Starlink WiFi", description: "High-speed satellite" },
  { icon: Car, label: "Private Parking", description: "Secure on-site" },
];

export default async function FincaPage() {
  const [properties, amenityMap] = await Promise.all([
    getPropertySummaries(),
    getAllPropertyAmenities()
  ]);

  return (
    <main className="min-h-screen bg-[#F5F2ED] font-sans selection:bg-ocean selection:text-white">
      {/* Dev Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <Database className="w-4 h-4 text-ocean" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50">Developer View / Estate Brainstorm</span>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="text-[10px] font-mono uppercase tracking-widest hover:text-ocean transition-colors">Admin Dashboard</Link>
          <Link href="/debug" className="text-[10px] font-mono uppercase tracking-widest hover:text-ocean transition-colors">Debug Tools</Link>
        </div>
      </div>

      {/* Raw Hero */}
      <section className="relative h-[50vh] flex items-center bg-slate-900 overflow-hidden">
        <Image
          src="/images/levante.png"
          alt="Finca San Mateo"
          fill
          className="object-cover opacity-40 grayscale"
          priority
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-8 opacity-90">
            SAN <br />MATEO
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/20 pt-8">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Area</p>
              <p className="text-2xl font-bold text-white uppercase italic">4 Hectares</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Access</p>
              <p className="text-2xl font-bold text-white uppercase italic">200m Dunes</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Town</p>
              <p className="text-2xl font-bold text-white uppercase italic">10km Tarifa</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-2xl font-bold text-white uppercase italic">Live</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Mega Table */}
      <section className="px-6 py-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Estate Inventory</h2>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-2">Comparison Matrix / Amenities / Specs</p>
            </div>
            <div className="hidden md:flex gap-2">
              {sharedInfrastructure.map(infra => (
                <div key={infra.label} className="px-4 py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2">
                  <infra.icon className="w-3 h-3 text-ocean" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{infra.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-mono text-[11px]">
                <thead>
                  <tr className="bg-slate-900 text-white/70 uppercase tracking-[0.2em]">
                    <th className="p-6 border-r border-white/10 sticky left-0 bg-slate-900 z-10">Property</th>
                    <th className="p-6 border-r border-white/10">Type</th>
                    <th className="p-6 border-r border-white/10">Capacity</th>
                    <th className="p-6 border-r border-white/10">Layout (B/B/B)</th>
                    <th className="p-6 border-r border-white/10">Space (Int/Ext)</th>
                    <th className="p-6 border-r border-white/10 bg-ocean/20 text-ocean-light font-bold">Base Rate</th>
                    {allAmenityLabels.map(label => (
                      <th key={label} className="p-6 border-r border-white/10 text-center min-w-[100px]">{label}</th>
                    ))}
                    <th className="p-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map((property) => {
                    const extras = propertyExtras[property.slug] || { rooms: "-", terrace: "-", highlight: "" };
                    const propertyAmenities = amenityMap[property.slug] || [];
                    
                    return (
                      <tr key={property.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-6 border-r border-slate-100 font-bold text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                          {property.name.toUpperCase()}
                        </td>
                        <td className="p-6 border-r border-slate-100 text-slate-400">
                          {property.property_type.toUpperCase()}
                        </td>
                        <td className="p-6 border-r border-slate-100">
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">GUESTS: {property.max_guests}</span>
                        </td>
                        <td className="p-6 border-r border-slate-100">
                          {property.bedrooms}BD / {property.beds}B / {property.bathrooms}BA
                        </td>
                        <td className="p-6 border-r border-slate-100">
                          {extras.rooms} / {extras.terrace}
                        </td>
                        <td className="p-6 border-r border-slate-100 font-bold text-ocean">
                          {formatMoney(property.base_price_cents)}
                        </td>
                        {allAmenityLabels.map(label => {
                          const hasAmenity = propertyAmenities.includes(label);
                          return (
                            <td key={label} className="p-6 border-r border-slate-100 text-center">
                              {hasAmenity ? (
                                <div className="flex justify-center">
                                  <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center opacity-20">
                                  <X className="w-3 h-3 text-slate-300" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-6">
                          <Link
                            href={`/finca/${property.slug}`}
                            className="p-2 hover:bg-ocean hover:text-white rounded-lg transition-all inline-block"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Block (Fixed Bottom for easy testing) */}
      <section className="bg-white border-t-4 border-slate-900">
        <div className="max-w-[1400px] mx-auto px-6 py-20 grid gap-20 lg:grid-cols-[1fr_400px]">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded bg-ocean flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Direct Booking Engine</h2>
            </div>
            <PropertyAvailability />
          </div>
          
          <div className="space-y-8">
            <Suspense fallback={null}>
              <div className="rounded-3xl border-2 border-slate-900 p-1">
                <BookingLookup />
              </div>
            </Suspense>
            
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200">
              <h3 className="font-bold text-sm uppercase tracking-widest mb-6">Dev Notes</h3>
              <ul className="space-y-3">
                {[
                  "Availability is derived from live bookings",
                  "Rates are raw DB cents / 100",
                  "Auth role: admin required for detail edits",
                  "Search is reference-based (SM-XXXX)"
                ].map(note => (
                  <li key={note} className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <div className="w-1 h-1 rounded-full bg-ocean" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Nav */}
      <footer className="bg-slate-900 py-10 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">
          <span>Finca San Mateo / v0.1.0-alpha</span>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-ocean transition-colors text-white/60 font-bold">Production Landing</Link>
            <span>&copy; 2026 Developer Edition</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
