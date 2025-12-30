import React, { useState } from 'react';
import { Search, Database, ChevronRight, Eye, ShieldCheck, Download } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EntityInspector } from './EntityInspector';
export function RegistryLedger() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const units = useLiveQuery(() => db.reports.toArray()) ?? []; // Mocked using reports for now
  const filtered = units.filter(u => 
    u.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-2 border-emerald-500 pl-6">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">Registry_Ledger</h2>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Total_Canonical_Entities: {units.length}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3.5 size-4 text-slate-600" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search_Metadata_Registry..."
            className="w-full bg-[#040408] border border-slate-900 rounded-2xl pl-12 h-11 text-[11px] font-mono text-slate-300 outline-none focus:border-emerald-500/50"
          />
        </div>
      </header>
      <div className="bg-[#040408] border border-slate-900 rounded-4xl overflow-hidden shadow-2xl">
        <table className="w-full border-collapse">
          <thead className="bg-black text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-900">
            <tr>
              <th className="text-left p-6">Entity_Title</th>
              <th className="text-left p-6">Version</th>
              <th className="text-left p-6">Author_Node</th>
              <th className="text-left p-6">Timestamp</th>
              <th className="text-right p-6">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/50">
            {filtered.map(unit => (
              <tr key={unit.id} className="group hover:bg-emerald-500/5 transition-all">
                <td className="p-6">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[11px] font-black text-slate-200 uppercase tracking-tight">{unit.title}</span>
                    <span className="text-[9px] font-mono text-slate-700 truncate max-w-[200px]">{unit.id}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold">1.0.0</span>
                </td>
                <td className="p-6 text-[10px] font-mono text-slate-500 uppercase">
                  did:lattice:{unit.id.slice(0, 6)}
                </td>
                <td className="p-6 text-[10px] font-mono text-slate-600">
                  {format(unit.createdAt, 'MMM dd HH:mm:ss')}
                </td>
                <td className="p-6 text-right">
                   <div className="flex justify-end gap-2">
                     <button 
                        onClick={() => setInspectingId(unit.id)}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-400/30 transition-all active:scale-95"
                     >
                        <Eye className="size-4" />
                     </button>
                     <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 transition-all active:scale-95">
                        <Download className="size-4" />
                     </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-32 text-center text-slate-800 font-bold uppercase tracking-[0.3em] italic">
            Ledger_Empty // Registry_Await_Broadcast
          </div>
        )}
      </div>
      {inspectingId && (
        <EntityInspector id={inspectingId} onClose={() => setInspectingId(null)} />
      )}
    </div>
  );
}