'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Users, X, Check, Wifi, Star, ArrowLeft, MoveRight } from 'lucide-react';
import PropertyAvailability from '@/components/PropertyAvailability';

const properties = [
  {
    id: 'levante',
    name: 'Levante',
    subtitle: 'The Villa',
    capacity: 6,
    image: '/images/levante.png',
    ratio: 'col-span-2 md:col-span-4',
    description: 'Our flagship villa. A masterpiece of coastal architecture featuring expansive living spaces and direct access to the estate gardens.',
    features: ['Private Terrace', 'Fully Equipped Kitchen', 'Starlink WiFi', 'Master Suite']
  },
  {
    id: 'estrecho',
    name: 'Estrecho',
    subtitle: 'The Residence',
    capacity: 4,
    image: '/images/estrecho.png',
    ratio: 'col-span-1 md:col-span-2',
    description: 'Perfect for families or groups. A spacious residence with views across the Strait of Gibraltar.',
    features: ['Ocean Views', 'Outdoor Dining Area', 'Fireplace', '2 Bedrooms']
  },
  {
    id: 'marea',
    name: 'Marea',
    subtitle: 'The Retreat',
    capacity: 2,
    image: '/images/marea.png',
    ratio: 'col-span-1 md:col-span-2',
    description: 'An intimate retreat for couples. Minimalist design meets the raw beauty of the Tarifa coast.',
    features: ['Minimalist Design', 'King Bed', 'Coffee Station', 'Sun Deck']
  },
  {
    id: 'cala',
    name: 'Cala',
    subtitle: 'The Bungalow',
    capacity: 2,
    image: '/images/cala.png',
    ratio: 'col-span-1 md:col-span-2',
    description: 'Cosy and secluded. A charming bungalow perfect for solo travelers or a quiet getaway.',
    features: ['Secluded Location', 'Garden Access', 'Compact Kitchen', 'Modern Bath']
  },
];

export default function PropertyShowcase() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [bookingMode, setBookingMode] = useState(false);

  const handleOpenModal = (p: any) => {
    setSelectedProperty(p);
    setBookingMode(false);
  };

  return (
    <section className="py-24 px-4 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono uppercase tracking-[0.3em] text-ocean mb-4"
          >
            The Collection
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter max-w-2xl text-balance"
          >
            Discover your sanctuary at Finca San Mateo
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-slate-500 max-w-lg text-lg leading-relaxed"
          >
            Four unique properties, one coastal estate. Choose the space that speaks to your rhythm.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
          {properties.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              onClick={() => handleOpenModal(p)}
              className={`relative aspect-[4/5] md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden group cursor-pointer ${p.ratio}`}
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 opacity-80" />
              <div className="absolute top-8 left-8 right-8 flex flex-col gap-1">
                <h3 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tighter">{p.name}</h3>
                <span className="text-xs md:text-sm font-mono text-white/70 uppercase tracking-[0.3em]">{p.subtitle}</span>
              </div>
              <div className="absolute bottom-8 left-8 flex items-center gap-2">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-xs font-mono text-white uppercase tracking-widest">Sleeps {p.capacity}</span>
                </div>
              </div>
              <div className="absolute inset-0 border-[1px] border-white/0 group-hover:border-white/20 transition-all duration-500 rounded-3xl m-4 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Property Peek & Live Booking Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProperty(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[850px] z-[1001]"
            >
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-6 right-6 z-50 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-slate-800 hover:text-slate-900 transition-all border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left: Beautiful Hero Image */}
              <div className="relative w-full md:w-1/2 h-64 md:h-auto shrink-0 select-none">
                <Image 
                  src={selectedProperty.image} 
                  alt={selectedProperty.name} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute bottom-8 left-8 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-4 h-4 fill-white" />
                    <span className="text-sm font-bold uppercase tracking-widest">Guest Favorite</span>
                  </div>
                </div>
              </div>

              {/* Right: Info OR Availability Flow */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-start overflow-y-auto">
                <AnimatePresence mode="wait">
                  {!bookingMode ? (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col justify-between h-full"
                    >
                      <div>
                        <span className="text-xs font-mono text-ocean uppercase tracking-[0.4em] block mb-2">The Selection</span>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter uppercase mb-4 leading-none">{selectedProperty.name}</h3>
                        <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6">{selectedProperty.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                            <h4 className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-2">Capacity</h4>
                            <div className="flex items-center gap-2.5">
                              <Users className="w-4 h-4 text-ocean shrink-0" />
                              <span className="font-bold text-slate-900 uppercase text-xs">Sleeps {selectedProperty.capacity} Guests</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                            <h4 className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-2">Connectivity</h4>
                            <div className="flex items-center gap-2.5">
                              <Wifi className="w-4 h-4 text-ocean shrink-0" />
                              <span className="font-bold text-slate-900 uppercase text-xs">Starlink 5G</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-[9px] font-mono text-slate-300 uppercase tracking-widest mb-3">Property Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {selectedProperty.features.map((f: string) => (
                              <div key={f} className="flex items-center gap-2.5">
                                <div className="w-4.5 h-4.5 bg-sky-50 rounded-full flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 text-ocean" />
                                </div>
                                <span className="text-xs text-slate-600 font-medium">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-50 mt-auto">
                        <Link
                          href={`/finca/${selectedProperty.id}`}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-slate-200 text-slate-700 hover:text-ocean hover:border-ocean hover:bg-slate-50 transition-all duration-300 font-bold uppercase tracking-[0.2em] text-xs"
                        >
                          <span>Full Property details</span>
                          <MoveRight className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => setBookingMode(true)}
                          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-ocean hover:shadow-xl hover:shadow-ocean/20 hover:-translate-y-0.5 transition-all duration-300 select-none flex items-center justify-center gap-2"
                        >
                          <span>Book this space</span>
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="booking"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col h-full"
                    >
                      <button
                        onClick={() => setBookingMode(false)}
                        className="flex items-center gap-2.5 text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] hover:text-ocean transition-colors mb-6 text-left select-none"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>Go back to property details</span>
                      </button>

                      <div className="flex-1 overflow-y-auto pr-1">
                        <PropertyAvailability preselectedSlug={selectedProperty.id} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
