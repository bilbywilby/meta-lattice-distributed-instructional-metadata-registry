import React, { useState } from 'react';
import { Search, List, Activity, ShieldCheck, ChevronRight, Eye } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Report } from '@shared/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EntityInspector } from './EntityInspector';
export function RegistryBrowser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const reports = useLiveQuery(() => db.reports.toArray()) ?? [];
  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.geohash.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-2 border-blue-500 pl-6">
          <div>
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Registry_Browser</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">
              Metadata_Ledger // Entries: {reports.length}
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-600" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search_Ledger..."
              className="w-full bg-[#040408] border border-slate-900 rounded-xl pl-10 h-10 text-xs font-mono text-slate-300 focus:border-blue-500/50 outline-none"
            />
          </div>
        </header>
        <div className="bg-[#040408] border border-slate-900 rounded-3xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-black text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-900">
              <tr>
                <th className="text-left p-4">Identifier_Title</th>
                <th className="text-left p-4">Geohash</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Timestamp</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filtered.map(r => (
                <tr key={r.id} className="group hover:bg-blue-500/5 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200 uppercase truncate max-w-[200px]">{r.title}</span>
                      <span className="text-[9px] font-mono text-slate-600 truncate">{r.id}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-400 uppercase">{r.geohash}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold border",
                      r.status === 'LOCAL' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-500">{format(r.createdAt, 'HH:mm:ss')}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setInspectingId(r.id)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-500 transition-all active:scale-95"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center font-mono text-xs text-slate-700 uppercase">
                    No_Entities_Matching_Search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {inspectingId && (
          <EntityInspector 
            id={inspectingId} 
            onClose={() => setInspectingId(null)} 
          />
        )}
      </div>
    </div>
  );
}