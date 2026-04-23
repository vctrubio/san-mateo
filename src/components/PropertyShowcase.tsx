'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users } from 'lucide-react';

type Property = {
  id: string;
  name: string;
  subtitle: string;
  capacity: number;
  image: string;
  ratio: string;
};

const properties = [
  {
    id: 'levante',
    name: 'Levante',
    subtitle: 'The Villa',
    capacity: 6,
    image: '/images/levante.png',
    ratio: 'col-span-2 md:col-span-4',
  },
  {
    id: 'estrecho',
    name: 'Estrecho',
    subtitle: 'The Residence',
    capacity: 4,
    image: '/images/estrecho.png',
    ratio: 'col-span-1 md:col-span-2',
  },
  {
    id: 'marea',
    name: 'Marea',
    subtitle: 'The Retreat',
    capacity: 2,
    image: '/images/marea.png',
    ratio: 'col-span-1 md:col-span-2',
  },
  {
    id: 'cala',
    name: 'Cala',
    subtitle: 'The Bungalow',
    capacity: 2,
    image: '/images/cala.png',
    ratio: 'col-span-1 md:col-span-2',
  },
];

function ShowcaseHeader() {
  return (
    <div className="flex flex-col items-center mb-20 text-center">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xs font-mono uppercase tracking-[0.3em] text-ocean mb-4"
      >
        Residences
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter max-w-2xl text-balance"
      >
        Discover where you want to stay.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-slate-500 max-w-lg text-lg leading-relaxed"
      >
        Four distinct homes, one coastal estate. Pick the space that fits your pace.
      </motion.p>
    </div>
  );
}

function PropertyCard({ p, index }: { p: Property; index: number }) {
  return (
    <motion.div
      key={p.id}
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className={`relative aspect-[4/5] md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden group cursor-pointer ${p.ratio}`}
    >
      {/* Background Image */}
      <Image
        src={p.image}
        alt={p.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 opacity-80" />

      {/* Content Top */}
      <div className="absolute top-8 left-8 right-8 flex flex-col gap-1">
        <motion.h3 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tighter">
          {p.name}
        </motion.h3>
        <span className="text-xs md:text-sm font-mono text-white/70 uppercase tracking-[0.3em]">
          {p.subtitle}
        </span>
      </div>

      {/* Content Bottom */}
      <div className="absolute bottom-8 left-8 flex items-center gap-2">
        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
          <Users className="w-4 h-4 text-white" />
          <span className="text-xs font-mono text-white uppercase tracking-widest">
            Sleeps {p.capacity}
          </span>
        </div>
      </div>

      {/* Hover Effect Reveal */}
      <div className="absolute inset-0 border-[1px] border-white/0 group-hover:border-white/20 transition-all duration-500 rounded-3xl m-4 pointer-events-none" />
    </motion.div>
  );
}

function PropertyGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
      {properties.map((p, index) => (
        <PropertyCard key={p.id} p={p} index={index} />
      ))}
    </div>
  );
}

export default function PropertyShowcase() {
  return (
    <section className="py-24 px-4 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <ShowcaseHeader />
        <PropertyGrid />
      </div>
    </section>
  );
}
