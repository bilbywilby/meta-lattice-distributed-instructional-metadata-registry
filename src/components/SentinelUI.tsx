import React, { useState } from 'react';
import { Terminal, Network, Settings, Shield, Activity, HardDrive, List, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SentinelTab, Identity } from '@shared/types';
import { SentinelForm } from './SentinelForm';
import { NodeGraph } from './NodeGraph';
import { SystemSpecs } from './SystemSpecs';
import { RegistryBrowser } from './RegistryBrowser';
import { SchemaManager } from './SchemaManager';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
export function SentinelUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState<SentinelTab>(SentinelTab.TERMINAL);
  const reports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray()) ?? [];
  const logs = useLiveQuery(() => db.sentinel_logs.orderBy('timestamp').reverse().limit(25).toArray()) ?? [];
  const schemaCount = useLiveQuery(() => db.registry_schemas.count()) ?? 0;
  return (
    <div className="flex h-screen bg-[#020205] text-slate-300 font-mono text-[10px] overflow-hidden selection:bg-blue-500/20">
      {/* Sidebar - Navigation - Fixed Width */}
      <aside className="w-[240px] border-r border-slate-900 flex flex-col shrink-0 bg-[#040408]/90 backdrop-blur-md z-30">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
            <span className="font-bold tracking-[0.2em] uppercase text-emerald-500">Live_Network</span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-sm font-black italic uppercase text-white tracking-tighter">Sentinel_v4</h1>
            <p className="text-slate-600 uppercase tracking-tight text-[9px] truncate">Node_ID: {identity.nodeId}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          <TabButton active={activeTab === SentinelTab.TERMINAL} onClick={() => setActiveTab(SentinelTab.TERMINAL)} icon={Terminal} label="Uplink_Terminal" />
          <TabButton active={activeTab === SentinelTab.REGISTRY} onClick={() => setActiveTab(SentinelTab.REGISTRY)} icon={List} label="Metadata_Ledger" />
          <TabButton active={activeTab === SentinelTab.MESH} onClick={() => setActiveTab(SentinelTab.MESH)} icon={Network} label="Mesh_Topology" />
          <TabButton active={activeTab === SentinelTab.SCHEMAS} onClick={() => setActiveTab(SentinelTab.SCHEMAS)} icon={ShieldCheck} label="Schema_Engine" />
          <TabButton active={activeTab === SentinelTab.SPECS} onClick={() => setActiveTab(SentinelTab.SPECS)} icon={Settings} label="System_Config" />
        </nav>
        <div className="p-8 border-t border-slate-900 bg-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-600 uppercase tracking-widest text-[8px]">Edge_Registry</span>
            <span className="text-blue-500 font-bold">READY</span>
          </div>
          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
            />
          </div>
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === SentinelTab.TERMINAL && (
                <div className="max-w-4xl mx-auto px-8 py-12 space-y-12">
                  <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex gap-5 items-start">
                    <Shield className="size-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-blue-200/80 font-bold uppercase tracking-widest text-[9px]">Ingress_Protocol_Active</p>
                      <p className="text-slate-500 italic leading-relaxed text-[10px]">
                        Geo-jitter (±0.0045) enforced. Identity obfuscation layer SHA-256 addresses enabled. Regional peering established.
                      </p>
                    </div>
                  </div>
                  <SentinelForm />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-slate-400 font-bold uppercase tracking-[0.2em]">Recent_Node_Activity</h2>
                      <span className="text-[8px] text-slate-600 uppercase">{reports.length} Global_Signals</span>
                    </div>
                    <div className="space-y-3">
                      {reports.slice(0, 6).map(r => (
                        <div key={r.id} className="p-6 rounded-3xl bg-[#08080C] border border-slate-900 flex justify-between items-center group hover:border-blue-500/40 hover:bg-[#0A0A12] transition-all duration-300">
                          <div className="space-y-1.5">
                            <h3 className="text-slate-200 font-bold uppercase italic tracking-tight">{r.title}</h3>
                            <div className="flex items-center gap-3 text-slate-600 text-[9px]">
                              <span className="truncate max-w-[200px]">{r.street}</span>
                              <span className="opacity-30">/</span>
                              <span className="font-mono text-blue-500/60">{r.geohash}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-slate-600 tabular-nums">{format(r.createdAt, 'HH:mm:ss')}</span>
                            <span className={cn(
                              "px-3 py-1 rounded-lg border text-[9px] font-black tracking-widest",
                              r.status === 'LOCAL' ? "text-blue-500 border-blue-500/20 bg-blue-500/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                            )}>{r.status}</span>
                          </div>
                        </div>
                      ))}
                      {reports.length === 0 && (
                        <div className="py-24 text-center border border-dashed border-slate-900 rounded-4xl text-slate-700 uppercase tracking-widest font-bold">
                          Awaiting_Data_Packet_Ingress...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === SentinelTab.REGISTRY && <RegistryBrowser />}
              {activeTab === SentinelTab.MESH && <div className="max-w-5xl mx-auto px-8 py-12"><NodeGraph /></div>}
              {activeTab === SentinelTab.SCHEMAS && <div className="max-w-5xl mx-auto px-8 py-12"><SchemaManager /></div>}
              {activeTab === SentinelTab.SPECS && <div className="max-w-5xl mx-auto px-8 py-12"><SystemSpecs /></div>}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Diagnostic Stream - Col 3 - Persistent */}
        <aside className="w-[320px] border-l border-slate-900 bg-[#040408]/60 backdrop-blur-lg flex flex-col shrink-0 overflow-hidden z-30">
          <header className="p-8 border-b border-slate-900 flex items-center justify-between">
            <span className="text-slate-500 font-bold uppercase tracking-[0.2em]">Diagnostic_Stream</span>
            <Activity className="size-4 text-blue-500 animate-pulse" />
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <DiagCard icon={HardDrive} label="Local_IndexedDB" value="DEXIE_V4_OK" status="Synchronized" />
            <DiagCard icon={List} label="Ledger_Registry" value={`${reports.length} ENTITIES`} status="Ledger Healthy" />
            <DiagCard icon={ShieldCheck} label="Security_Schemas" value={`${schemaCount} ENFORCED`} status="Validation Active" />
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Live_Audit_Log</span>
                <span className="size-1.5 rounded-full bg-blue-500" />
              </div>
              <div className="bg-black/40 rounded-3xl border border-slate-900 p-4 space-y-3 max-h-[450px] overflow-y-auto font-mono text-[9px]">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-3 group">
                    <span className="text-slate-700 shrink-0">[{format(log.timestamp, 'HH:mm:ss')}]</span>
                    <span className={cn(
                      "uppercase truncate transition-colors",
                      log.severity === 'CRITICAL' ? "text-rose-500 font-bold" : "text-emerald-500 group-hover:text-white"
                    )}>{log.event}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="py-12 text-center text-slate-800 uppercase italic">Stream_Empty</div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold uppercase tracking-tighter text-[10px]",
        active ? "bg-slate-900 text-white shadow-xl ring-1 ring-white/5" : "text-slate-600 hover:text-slate-300 hover:bg-white/5"
      )}
    >
      <Icon className={cn("size-4 transition-colors", active ? "text-blue-500" : "text-slate-800")} />
      <span>{label}</span>
    </button>
  );
}
function DiagCard({ icon: Icon, label, value, status }: { icon: any, label: string, value: string, status: string }) {
  return (
    <div className="p-5 rounded-3xl bg-black/40 border border-slate-900 space-y-3 hover:border-slate-800 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className="size-3.5 text-slate-700" />
          <span className="text-slate-600 font-bold uppercase tracking-widest text-[8px]">{label}</span>
        </div>
        <div className="size-2 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
      </div>
      <div className="flex items-end justify-between gap-4">
        <span className="text-slate-200 font-black italic tracking-tighter truncate text-[11px]">{value}</span>
        <span className="text-[8px] text-slate-700 uppercase font-mono shrink-0">{status}</span>
      </div>
    </div>
  );
}