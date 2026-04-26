'use client';

import React from 'react';
import { Database, Table, Link2, Key, ChevronRight } from 'lucide-react';

const schema = [
  {
    name: 'fincas',
    fields: [
      { name: 'id', type: 'UUID', primary: true },
      { name: 'name', type: 'VARCHAR' },
      { name: 'slug', type: 'VARCHAR', unique: true },
      { name: 'city', type: 'VARCHAR' },
    ]
  },
  {
    name: 'properties',
    fields: [
      { name: 'id', type: 'UUID', primary: true },
      { name: 'finca_id', type: 'UUID', foreign: 'fincas.id' },
      { name: 'name', type: 'VARCHAR' },
      { name: 'max_guests', type: 'INT' },
      { name: 'base_price_cents', type: 'INT' },
    ]
  },
  {
    name: 'bookings',
    fields: [
      { name: 'id', type: 'UUID', primary: true },
      { name: 'reference', type: 'VARCHAR', unique: true },
      { name: 'property_id', type: 'UUID', foreign: 'properties.id' },
      { name: 'guest_id', type: 'UUID', foreign: 'guests.id' },
      { name: 'check_in', type: 'DATE' },
      { name: 'check_out', type: 'DATE' },
      { name: 'status', type: 'ENUM' },
    ]
  },
  {
    name: 'availability_slots',
    fields: [
      { name: 'id', type: 'UUID', primary: true },
      { name: 'property_id', type: 'UUID', foreign: 'properties.id' },
      { name: 'slot_date', type: 'DATE' },
      { name: 'status', type: 'VARCHAR' },
      { name: 'booking_id', type: 'UUID', foreign: 'bookings.id' },
    ]
  }
];

export default function DebugSchema() {
  return (
    <section className="py-24 px-4 bg-[#F5F2ED] border-t border-slate-200">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 mb-16">
          <Database className="w-4 h-4 text-ocean" />
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">MySQL Relational Schema</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {schema.map((table) => (
            <div key={table.name} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <Table className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{table.name}</h4>
              </div>
              <div className="space-y-3">
                {table.fields.map((field) => (
                  <div key={field.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      {field.primary && <Key className="w-3 h-3 text-amber-500" />}
                      {field.foreign && <Link2 className="w-3 h-3 text-ocean" />}
                      <span className={`text-[11px] font-mono ${field.primary ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{field.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">{field.type}</span>
                  </div>
                ))}
              </div>
              {table.fields.some(f => f.foreign) && (
                <div className="mt-6 pt-4 border-t border-slate-50">
                  <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest block mb-2">Relations</span>
                  {table.fields.filter(f => f.foreign).map(f => (
                    <div key={f.name} className="flex items-center gap-2 text-[10px] text-ocean font-bold uppercase">
                      <ChevronRight className="w-3 h-3" />
                      {f.foreign}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-white/50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest text-center">
            Database Engine: MySQL 8.0 • Strategy: Atomic Transactions • Consistency: Acid
          </p>
        </div>
      </div>
    </section>
  );
}
