import React from 'react';
import { getPool } from '../../db/client';
import { Database, Home, Users, Euro } from 'lucide-react';

export default async function DebugDatabasePanel() {
  let properties: any[] = [];
  let finca: any = null;
  let error: string | null = null;

  try {
    const pool = await getPool();
    const [fincaRows]: any = await pool.query('SELECT * FROM fincas LIMIT 1');
    const [propertyRows]: any = await pool.query('SELECT * FROM properties ORDER BY max_guests DESC');
    
    finca = fincaRows[0];
    properties = propertyRows;
  } catch (err: any) {
    console.error('Database fetch error:', err);
    error = err.message;
  }

  return (
    <section className="p-8 bg-sand/20 border-t border-slate-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-4 h-4 text-ocean" />
          <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400">
            Live Database Sync
          </h2>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-600 text-xs font-mono">
            Error connecting to MySQL: {error}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Finca Info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{finca?.name}</h3>
                  <p className="text-sm text-slate-500 font-mono">{finca?.city}, {finca?.country}</p>
                </div>
                <span className="px-3 py-1 bg-sky-100 text-ocean text-[10px] font-mono uppercase tracking-wider rounded-full">
                  Primary Estate
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl italic leading-relaxed">
                "{finca?.description}"
              </p>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((p) => (
                <div key={p.id} className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-ocean/30 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-sand rounded-lg">
                        <Home className="w-4 h-4 text-ocean" />
                      </div>
                      <h4 className="font-bold text-slate-800">{p.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{p.slug}</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-tight">
                    {p.description}
                  </p>

                  <div className="flex items-center gap-6 border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-mono text-slate-600">Sleeps {p.max_guests}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-mono text-slate-600">
                        {(p.base_price_cents / 100).toLocaleString('en-EU')}
                        <span className="text-[10px] ml-0.5 opacity-60">/night</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <div className="px-4 py-2 bg-slate-900 rounded-full flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">
                  MySQL Connection: Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
