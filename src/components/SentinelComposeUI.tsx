import React, { useState } from 'react';
import { Terminal, Network, Settings, Shield, Activity, HardDrive, List, ShieldCheck, Fingerprint, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SentinelTab, Identity } from '@shared/types';
import { SentinelForm } from './SentinelForm';
import { RegistryBrowser } from './RegistryBrowser';
import { NodeGraph } from './NodeGraph';
import { SchemaManager } from './SchemaManager';
import { SystemSpecs } from './SystemSpecs';
import { KMPLogicStudio } from './KMPLogicStudio';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
export function SentinelComposeUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState<SentinelTab | 'KMP'>(SentinelTab.TERMINAL);
  const reports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray()) ?? [];
  const logs = useLiveQuery(() => db.sentinel_logs.orderBy('timestamp').reverse().limit(30).toArray()) ?? [];
  return (
    <div className="flex h-screen bg-[#020205] text-slate-300 font-mono text-[10px] overflow-hidden selection:bg-blue-500/20 antialiased">
      {/* Col 1: Collapsible Sidebar (Android Nav parity) */}
      <aside className="w-[200px] border-r border-slate-900 flex flex-col shrink-0 bg-[#040408]/95 z-30">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold tracking-widest text-slate-500">SENTINEL_V3</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-[11px] font-black uppercase text-white tracking-tighter">Carbon_Uplink</h1>
            <p className="text-[8px] text-slate-700 truncate">Hilt::Node_{identity.nodeId}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <NavBtn active={activeTab === SentinelTab.TERMINAL} onClick={() => setActiveTab(SentinelTab.TERMINAL)} icon={Terminal} label="Terminal" />
          <NavBtn active={activeTab === SentinelTab.REGISTRY} onClick={() => setActiveTab(SentinelTab.REGISTRY)} icon={List} label="Ledger" />
          <NavBtn active={activeTab === SentinelTab.MESH} onClick={() => setActiveTab(SentinelTab.MESH)} icon={Network} label="Mesh" />
          <NavBtn active={activeTab === SentinelTab.SCHEMAS} onClick={() => setActiveTab(SentinelTab.SCHEMAS)} icon={ShieldCheck} label="Schemas" />
          <NavBtn active={activeTab === 'KMP'} onClick={() => setActiveTab('KMP')} icon={Fingerprint} label="KMP_Bridge" />
          <NavBtn active={activeTab === SentinelTab.SPECS} onClick={() => setActiveTab(SentinelTab.SPECS)} icon={Settings} label="Specs" />
        </nav>
        <div className="p-6 border-t border-slate-900 bg-black/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-700 uppercase text-[7px]">Android_Sync</span>
            <span className="text-blue-500 font-bold">READY</span>
          </div>
          <div className="h-0.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="w-full h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          </div>
        </div>
      </aside>
      {/* Col 2: Main Sentinel Content (Form/Ledger) */}
      <main className="flex-1 flex flex-col overflow-hidden relative border-r border-slate-900 bg-black/20">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full"
            >
              {activeTab === SentinelTab.TERMINAL && (
                <div className="max-w-3xl mx-auto px-10 py-12 space-y-12">
                  <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl flex gap-4 items-start">
                    <Info className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-amber-500 font-bold uppercase tracking-widest text-[8px]">Privacy_Explainer (v0.8.2)</p>
                      <p className="text-slate-600 leading-relaxed text-[10px]">
                        Ingress utilizes 500m Jitter. Cross-streets are SHA256 hashed locally before transmission. Raw address text is wiped post-commit.
                      </p>
                    </div>
                  </div>
                  <SentinelForm />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Uplink_Queue</h2>
                      <span className="text-[8px] text-slate-700">{reports.length} Signals_Local</span>
                    </div>
                    <div className="space-y-2">
                      {reports.slice(0, 5).map(r => (
                        <div key={r.id} className="p-4 rounded-2xl bg-[#040408] border border-slate-900 flex justify-between items-center group hover:border-blue-500/40">
                          <div className="space-y-1">
                            <span className="text-slate-300 font-bold uppercase truncate block">{r.title}</span>
                            <span className="text-slate-600 text-[8px] tabular-nums font-mono">{r.geohash} // {format(r.createdAt, 'HH:mm:ss')}</span>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded border text-[8px] font-bold",
                            r.status === 'LOCAL' ? "text-blue-500 border-blue-500/20 bg-blue-500/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                          )}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === SentinelTab.REGISTRY && <RegistryBrowser />}
              {activeTab === SentinelTab.MESH && <div className="p-10"><NodeGraph /></div>}
              {activeTab === SentinelTab.SCHEMAS && <div className="p-10"><SchemaManager /></div>}
              {activeTab === 'KMP' && <div className="p-10"><KMPLogicStudio /></div>}
              {activeTab === SentinelTab.SPECS && <div className="p-10"><SystemSpecs /></div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {/* Col 3: Diagnostic Panel (Persistent Stats/Logs) */}
      <aside className="w-[300px] bg-[#040408]/60 flex flex-col shrink-0 overflow-hidden z-30">
        <header className="p-6 border-b border-slate-900 flex items-center justify-between">
          <span className="text-slate-600 font-bold uppercase tracking-[0.2em]">Diagnostic_Bus</span>
          <Activity className="size-3 text-blue-500 animate-pulse" />
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
           <DiagStat label="Storage_Engine" value="ROOM_DB_V4" status="OK" />
           <DiagStat label="Ledger_Size" value={`${reports.length} Entities`} status="Synced" />
           <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
               <span className="text-[8px] text-slate-700 font-bold uppercase">Log_Stream</span>
               <div className="size-1.5 rounded-full bg-blue-500" />
             </div>
             <div className="bg-black/50 rounded-2xl border border-slate-900 p-4 space-y-2 h-[400px] overflow-y-auto font-mono text-[8px]">
               {logs.map(log => (
                 <div key={log.id} className="flex gap-2">
                   <span className="text-slate-800 shrink-0">[{format(log.timestamp, 'HH:mm:ss')}]</span>
                   <span className={cn(
                     "truncate uppercase",
                     log.severity === 'CRITICAL' ? "text-rose-500 font-bold" : "text-blue-500/80"
                   )}>{log.event}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </aside>
    </div>
  );
}
function NavBtn({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase text-[9px]",
        active ? "bg-slate-900 text-white shadow-xl ring-1 ring-white/5" : "text-slate-700 hover:text-slate-400"
      )}
    >
      <Icon className={cn("size-3.5", active ? "text-blue-500" : "text-slate-800")} />
      <span>{label}</span>
    </button>
  );
}
function DiagStat({ label, value, status }: { label: string, value: string, status: string }) {
  return (
    <div className="p-4 rounded-2xl bg-black border border-slate-900 space-y-2">
      <div className="flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-blue-500/30" />
        <span className="text-slate-700 font-bold uppercase text-[7px] tracking-widest">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-slate-300 font-black italic tracking-tighter text-[10px]">{value}</span>
        <span className="text-[7px] text-slate-800 uppercase font-mono">{status}</span>
      </div>
    </div>
  );
}