'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Users, X, Check, Wifi, Star } from 'lucide-react';

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
              onClick={() => setSelectedProperty(p)}
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

      {/* Property Peek Modal */}
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
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[800px]"
            >
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-6 right-6 z-50 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Left: Image */}
              <div className="relative w-full md:w-1/2 h-64 md:h-auto shrink-0">
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

              {/* Right: Info */}
              <div className="flex-1 p-8 md:p-16 flex flex-col justify-center overflow-y-auto">
                <div className="mb-8">
                  <span className="text-xs font-mono text-ocean uppercase tracking-[0.4em] block mb-4">The Selection</span>
                  <h3 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter uppercase mb-4">{selectedProperty.name}</h3>
                  <p className="text-slate-500 text-lg leading-relaxed">{selectedProperty.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div>
                    <h4 className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mb-4">Capacity</h4>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-ocean" />
                      <span className="font-bold text-slate-900 uppercase text-sm">Sleeps {selectedProperty.capacity}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mb-4">Connectivity</h4>
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5 text-ocean" />
                      <span className="font-bold text-slate-900 uppercase text-sm">Starlink 5G</span>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <h4 className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mb-6">Property Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProperty.features.map((f: string) => (
                      <div key={f} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-sky-50 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-ocean" />
                        </div>
                        <span className="text-sm text-slate-600">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedProperty(null);
                    const el = document.getElementById('availability-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-6 bg-slate-900 text-white rounded-3xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-ocean transition-all duration-300"
                >
                  Book this space
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
