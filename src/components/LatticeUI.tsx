import React, { useState } from 'react';
import { Database, ShieldCheck, Activity, Send, Cpu, Newspaper, Menu, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LatticeTab, Identity } from '@shared/types';
import { RegistryPublish } from './RegistryPublish';
import { RegistryLedger } from './RegistryLedger';
import { SchemaManager } from './SchemaManager';
import { SystemSpecs } from './SystemSpecs';
import { ConsensusFeed } from './ConsensusFeed';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
export function LatticeUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState<LatticeTab>(LatticeTab.INTEL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const unitCount = useLiveQuery(() => db.reports.count()) ?? 0;
  const logs = useLiveQuery(() => db.sentinel_logs.orderBy('timestamp').reverse().limit(30).toArray()) ?? [];
  const tabs = [
    { id: LatticeTab.INTEL, label: 'Intelligence', icon: Newspaper, color: 'text-blue-500' },
    { id: LatticeTab.PUBLISH, label: 'Publish', icon: Send, color: 'text-emerald-500' },
    { id: LatticeTab.LEDGER, label: 'Ledger', icon: Database, color: 'text-slate-400' },
    { id: LatticeTab.SCHEMAS, label: 'Schemas', icon: ShieldCheck, color: 'text-purple-500' },
    { id: LatticeTab.AUDIT, label: 'Audit', icon: Activity, color: 'text-amber-500' },
  ];
  return (
    <div className="flex h-screen bg-[#020205] text-slate-300 font-mono text-[10px] overflow-hidden selection:bg-emerald-500/20 antialiased">
      {/* Col 1: Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#040408]/95 border-r border-slate-900 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse" />
              <span className="font-bold tracking-[0.2em] uppercase text-emerald-500">Node_Online</span>
            </div>
            <div className="space-y-1.5">
              <h1 className="text-sm font-black italic uppercase text-white tracking-tighter">Meta-Lattice v1.0</h1>
              <p className="text-slate-600 uppercase tracking-tight text-[8px] truncate">DID: {identity.nodeId}</p>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-bold uppercase tracking-tighter text-[10px] group",
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-600 hover:text-slate-400"
                )}
              >
                <tab.icon className={cn("size-4 transition-colors", activeTab === tab.id ? tab.color : "text-slate-800 group-hover:text-slate-600")} />
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="ml-auto size-3 opacity-30" />}
              </button>
            ))}
          </nav>
          <div className="p-8 border-t border-slate-900 bg-black/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-700 text-[8px] uppercase tracking-widest font-bold">Registry_Sync</span>
              <span className="text-emerald-500 font-black">100%</span>
            </div>
            <div className="h-0.5 bg-slate-900 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-emerald-600 shadow-[0_0_8px_#10b981]" />
            </div>
          </div>
        </div>
      </aside>
      {/* Col 2: Primary Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative border-r border-slate-900 bg-black/10">
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-6 bg-[#040408]/80 backdrop-blur-md md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Menu className="size-5 text-slate-400" onClick={() => setIsSidebarOpen(true)} />
            <span className="text-[11px] font-black uppercase italic text-white tracking-tighter">Lattice_V1</span>
          </div>
          <Zap className="size-5 text-emerald-500" />
        </header>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === LatticeTab.INTEL && <ConsensusFeed />}
              {activeTab === LatticeTab.PUBLISH && <RegistryPublish />}
              {activeTab === LatticeTab.LEDGER && <RegistryLedger />}
              {activeTab === LatticeTab.SCHEMAS && <div className="p-10 max-w-7xl mx-auto"><SchemaManager /></div>}
              {activeTab === LatticeTab.AUDIT && <div className="p-10 max-w-7xl mx-auto"><SystemSpecs /></div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {/* Col 3: Diagnostic Stream */}
      <aside className="w-[300px] bg-[#040408]/60 flex flex-col shrink-0 overflow-hidden z-30">
        <header className="p-8 border-b border-slate-900 flex items-center justify-between bg-black/40">
          <span className="text-slate-600 font-bold uppercase tracking-[0.2em]">Diagnostic_Bus</span>
          <Activity className="size-3 text-emerald-500 animate-pulse" />
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
           <div className="grid grid-cols-1 gap-4">
             <DiagCard label="Entity_Count" value={unitCount.toString()} status="READY" />
             <DiagCard label="Validation" value="AJV_v8_PROD" status="ACTIVE" />
             <DiagCard label="Storage" value="Dexie::ROOM_DB" status="HEALTHY" />
           </div>
           <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
               <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Protocol_Logs</span>
               <div className="size-1.5 rounded-full bg-emerald-500" />
             </div>
             <div className="bg-black/50 rounded-2xl border border-slate-900 p-4 space-y-2 h-[450px] overflow-y-auto font-mono text-[8px]">
               {logs.map(log => (
                 <div key={log.id} className="flex gap-2 group">
                   <span className="text-slate-800 shrink-0">[{format(log.timestamp, 'HH:mm:ss')}]</span>
                   <span className={cn(
                     "truncate uppercase",
                     log.severity === 'CRITICAL' ? "text-rose-500 font-bold" : "text-emerald-500/80 group-hover:text-emerald-400"
                   )}>{log.event}</span>
                 </div>
               ))}
               {logs.length === 0 && (
                 <div className="py-20 text-center text-slate-800 uppercase italic tracking-widest">Stream_Empty</div>
               )}
             </div>
           </div>
        </div>
      </aside>
    </div>
  );
}
function DiagCard({ label, value, status }: { label: string, value: string, status: string }) {
  return (
    <div className="p-5 rounded-3xl bg-black/40 border border-slate-900 space-y-3 hover:border-slate-800 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[7px]">{label}</span>
        <div className="size-1.5 rounded-full bg-emerald-500/50" />
      </div>
      <div className="flex items-end justify-between gap-4">
        <span className="text-slate-300 font-black italic tracking-tighter text-[11px] truncate">{value}</span>
        <span className="text-[7px] text-slate-800 uppercase font-mono">{status}</span>
      </div>
    </div>
  );
}