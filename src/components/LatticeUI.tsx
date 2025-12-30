import React, { useState } from 'react';
import { Terminal, Database, ShieldCheck, Activity, Layers, Send, Book, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LatticeTab, Identity } from '@shared/types';
import { RegistryPublish } from './RegistryPublish';
import { RegistryLedger } from './RegistryLedger';
import { SchemaManager } from './SchemaManager';
import { SystemSpecs } from './SystemSpecs';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
export function LatticeUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState<LatticeTab>(LatticeTab.PUBLISH);
  const unitCount = useLiveQuery(() => db.reports.count()) ?? 0; // Temporarily using reports table for ledger
  const logs = useLiveQuery(() => db.sentinel_logs.orderBy('timestamp').reverse().limit(30).toArray()) ?? [];
  return (
    <div className="flex h-screen bg-[#020205] text-slate-300 font-mono text-[10px] overflow-hidden selection:bg-emerald-500/20">
      {/* Col 1: Navigation Sidebar */}
      <aside className="w-[240px] border-r border-slate-900 flex flex-col shrink-0 bg-[#040408]/90 z-30">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
            <span className="font-bold tracking-[0.2em] uppercase text-emerald-500">Node_Online</span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-sm font-black italic uppercase text-white tracking-tighter">Lattice_v1.0</h1>
            <p className="text-slate-600 uppercase tracking-tight text-[9px] truncate">DID: {identity.nodeId}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          <TabButton active={activeTab === LatticeTab.PUBLISH} onClick={() => setActiveTab(LatticeTab.PUBLISH)} icon={Send} label="Unit_Publish" />
          <TabButton active={activeTab === LatticeTab.LEDGER} onClick={() => setActiveTab(LatticeTab.LEDGER)} icon={Database} label="Registry_Ledger" />
          <TabButton active={activeTab === LatticeTab.SCHEMAS} onClick={() => setActiveTab(LatticeTab.SCHEMAS)} icon={ShieldCheck} label="Schema_Engine" />
          <TabButton active={activeTab === LatticeTab.AUDIT} onClick={() => setActiveTab(LatticeTab.AUDIT)} icon={Activity} label="System_Audit" />
        </nav>
        <div className="p-8 border-t border-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-[8px] uppercase">Lattice_Sync</span>
            <span className="text-emerald-500 font-bold">100%</span>
          </div>
          <div className="h-0.5 bg-slate-900 w-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-emerald-600 shadow-[0_0_8px_#10b981]" />
          </div>
        </div>
      </aside>
      {/* Col 2: Content View */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="p-8 md:p-12 lg:p-16"
            >
              {activeTab === LatticeTab.PUBLISH && <RegistryPublish />}
              {activeTab === LatticeTab.LEDGER && <RegistryLedger />}
              {activeTab === LatticeTab.SCHEMAS && <SchemaManager />}
              {activeTab === LatticeTab.AUDIT && <SystemSpecs />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {/* Col 3: Diagnostic Stream */}
      <aside className="w-[300px] border-l border-slate-900 bg-[#040408]/60 flex flex-col shrink-0 z-30">
        <header className="p-6 border-b border-slate-900 flex items-center justify-between">
          <span className="text-slate-500 font-bold uppercase tracking-[0.2em]">Diagnostic_Stream</span>
          <Cpu className="size-4 text-emerald-500" />
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[9px]">
           <DiagCard label="Total_Units" value={unitCount.toString()} />
           <DiagCard label="Validation_TPS" value="4.2" />
           <div className="space-y-2 mt-6">
             <div className="px-2 text-slate-600 font-bold uppercase tracking-widest text-[8px]">Protocol_Events</div>
             <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-slate-900/50">
               {logs.map(log => (
                 <div key={log.id} className="flex gap-2 text-slate-500">
                   <span className="text-slate-700">[{format(log.timestamp, 'HH:mm')}]</span>
                   <span className={cn(
                     "truncate",
                     log.severity === 'CRITICAL' ? "text-rose-500" : "text-emerald-500/80"
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
function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold uppercase tracking-tighter text-[10px]",
        active ? "bg-slate-900 text-white shadow-xl" : "text-slate-600 hover:text-slate-400"
      )}
    >
      <Icon className={cn("size-4", active ? "text-emerald-500" : "text-slate-800")} />
      <span>{label}</span>
    </button>
  );
}
function DiagCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-black border border-slate-900 flex items-center justify-between">
      <span className="text-slate-600 uppercase font-bold text-[8px]">{label}</span>
      <span className="text-emerald-400 font-black italic">{value}</span>
    </div>
  );
}