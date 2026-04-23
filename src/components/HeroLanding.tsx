import React from 'react';

export default function HeroLanding() {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center px-4 bg-background relative overflow-hidden">
      {/* Subtle coastal background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100/30 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sand/30 rounded-full -ml-48 -mb-48 blur-3xl opacity-30" />
      
      <div className="relative z-10 inline-flex flex-col items-center group">
        {/* Line 1: San Mateo - Bold and Tight */}
        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-slate-900 leading-[0.8] uppercase">
          San Mateo
        </h1>
        
        {/* Line 2: FINCA - The XS connector with lines */}
        <div className="w-full flex items-center justify-between gap-4 my-4 md:my-6">
          <div className="h-px bg-slate-200 grow" />
          <span className="text-[10px] md:text-xs font-mono tracking-[1em] text-slate-400 uppercase pl-[1em]">
            FINCA
          </span>
          <div className="h-px bg-slate-200 grow" />
        </div>
        
        {/* Line 3: Tarifa - Tracked out to match the width of Line 1 */}
        <h2 className="text-6xl md:text-9xl font-bold tracking-[0.28em] text-slate-900 leading-[0.8] uppercase ml-[0.28em]">
          Tarifa
        </h2>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em]">Explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-slate-200 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
