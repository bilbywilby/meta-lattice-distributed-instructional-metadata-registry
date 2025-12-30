import React, { useState } from 'react';
import { Activity, Network, List, Settings, Search, RefreshCw, Shield } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addLog } from '@/lib/db';
import { NodeGraph } from './NodeGraph';
import { SystemSpecs } from './SystemSpecs';
import { SchemaManager } from './SchemaManager';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
export function IntelModule() {
  const [subTab, setSubTab] = useState<'TOPOLOGY' | 'LEDGER' | 'SCHEMAS' | 'SPECS'>('TOPOLOGY');
  const [searchTerm, setSearchTerm] = useState("");
  const reports = useLiveQuery(() => db.reports.toArray()) ?? [];
  const [isSyncing, setIsSyncing] = useState(false);
  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.geohash.includes(searchTerm)
  );
  const handleGlobalSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/reports');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        await db.transaction('rw', db.reports, async () => {
          for (const report of data.data) {
            await db.reports.put(report);
          }
        });
        await addLog("GLOBAL_SYNC_COMPLETED", "INFO", { count: data.data.length });
      }
    } catch (err) {
      await addLog("GLOBAL_SYNC_FAILED", "CRITICAL", { error: String(err) });
    } finally {
      setIsSyncing(false);
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="size-6 text-emerald-500" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Registry_Intel</h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <SubTabBtn active={subTab === 'TOPOLOGY'} onClick={() => setSubTab('TOPOLOGY')} icon={Network} label="Topology" />
          <SubTabBtn active={subTab === 'LEDGER'} onClick={() => setSubTab('LEDGER')} icon={List} label="Ledger" />
          <SubTabBtn active={subTab === 'SCHEMAS'} onClick={() => setSubTab('SCHEMAS')} icon={Shield} label="Schemas" />
          <SubTabBtn active={subTab === 'SPECS'} onClick={() => setSubTab('SPECS')} icon={Settings} label="Specs" />
        </div>
      </header>
      <main className="min-h-[600px]">
        {subTab === 'TOPOLOGY' && (
          <div className="space-y-4">
            <NodeGraph />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <IntelStat label="Active Nodes" value={reports.length.toString()} />
              <IntelStat label="Network Health" value="99.8%" />
              <IntelStat label="Last Sync" value="Just Now" />
            </div>
          </div>
        )}
        {subTab === 'LEDGER' && (
          <div className="bg-[#040408] border border-slate-900 rounded-3xl overflow-hidden flex flex-col h-[600px]">
            <header className="p-4 border-b border-slate-900 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-600" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by title or geohash..."
                  className="w-full bg-black border border-slate-800 rounded-xl pl-10 h-10 text-xs font-mono text-slate-300 outline-none focus:border-emerald-500/50"
                />
              </div>
              <button 
                onClick={handleGlobalSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase hover:bg-emerald-500 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={cn("size-3", isSyncing && "animate-spin")} />
                Sync_Global
              </button>
            </header>
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-slate-950 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-900">
                  <tr>
                    <th className="text-left p-4">Node_ID / Title</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Geohash</th>
                    <th className="text-left p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredReports.map(r => (
                    <tr key={r.id} className="text-xs font-mono text-slate-400 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-bold uppercase">{r.title}</span>
                          <span className="text-[9px] text-slate-600">{r.id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold border",
                          r.status === 'LOCAL' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{r.geohash}</td>
                      <td className="p-4 text-[10px]">{format(r.createdAt, 'HH:mm:ss')}</td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-slate-700 uppercase font-mono text-[10px] tracking-widest">
                        No_Registry_Entries_Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {subTab === 'SCHEMAS' && <SchemaManager />}
        {subTab === 'SPECS' && <SystemSpecs />}
      </main>
    </div>
  );
}
function SubTabBtn({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all",
        active ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
      )}
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}
function IntelStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-[#040408] border border-slate-900">
      <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-white italic">{value}</p>
    </div>
  );
}