import React, { useState } from 'react';
import { Terminal, Network, Settings, Shield, Activity, HardDrive, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SentinelTab, Identity } from '@shared/types';
import { SentinelForm } from './SentinelForm';
import { NodeGraph } from './NodeGraph';
import { SystemSpecs } from './SystemSpecs';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
export function SentinelUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState<SentinelTab>(SentinelTab.TERMINAL);
  const reports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray()) ?? [];
  const logs = useLiveQuery(() => db.sentinel_logs.orderBy('timestamp').reverse().limit(20).toArray()) ?? [];
  return (
    <div className="flex h-screen bg-[#020205] text-slate-300 font-mono text-[10px] overflow-hidden">
      {/* Sidebar - Col 1 */}
      <aside className="w-[240px] border-r border-slate-900 flex flex-col shrink-0 bg-[#040408]">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-bold tracking-widest uppercase text-emerald-500">[PRIVACY_ACTIVE]</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-xs font-black italic uppercase text-white">Sentinel_Core</h1>
            <p className="text-slate-600 uppercase tracking-tighter">Node: {identity.nodeId}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <TabButton active={activeTab === SentinelTab.TERMINAL} onClick={() => setActiveTab(SentinelTab.TERMINAL)} icon={Terminal} label="Terminal" />
          <TabButton active={activeTab === SentinelTab.MESH} onClick={() => setActiveTab(SentinelTab.MESH)} icon={Network} label="Mesh_Network" />
          <TabButton active={activeTab === SentinelTab.SPECS} onClick={() => setActiveTab(SentinelTab.SPECS)} icon={Settings} label="System_Specs" />
        </nav>
        <div className="p-6 border-t border-slate-900 bg-black/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 uppercase">Registry_V4</span>
            <span className="text-blue-500 font-bold">STABLE</span>
          </div>
          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full animate-pulse" />
          </div>
        </div>
      </aside>
      {/* Main Content - Col 2 & 3 Wrapper */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-10 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-10">
            {activeTab === SentinelTab.TERMINAL && (
              <>
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex gap-4 items-start">
                  <Shield className="size-4 text-amber-500 shrink-0" />
                  <p className="text-amber-200/70 italic uppercase leading-relaxed">
                    Safety Protocol: Geo-jitter variance enforced at ±0.0045 (~500m). SHA-256 residency proof active. No raw location data reaches regional ingress.
                  </p>
                </div>
                <SentinelForm />
                <div className="space-y-4">
                  <h2 className="text-slate-500 uppercase tracking-widest px-2">Local_Observation_Feed</h2>
                  <div className="space-y-3">
                    {reports.map(r => (
                      <div key={r.id} className="p-5 rounded-3xl bg-[#08080C] border border-slate-900 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                        <div className="space-y-1">
                          <h3 className="text-white font-bold uppercase italic">{r.title}</h3>
                          <p className="text-slate-500 truncate max-w-md">{r.street}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600 uppercase tracking-tighter">{format(r.createdAt, 'HH:mm:ss')}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded border font-bold",
                            r.status === 'LOCAL' ? "text-blue-500 border-blue-500/20 bg-blue-500/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                          )}>{r.status}</span>
                        </div>
                      </div>
                    ))}
                    {reports.length === 0 && (
                      <div className="py-20 text-center border border-dashed border-slate-900 rounded-3xl text-slate-700 uppercase">Awaiting_Ingress_Data</div>
                    )}
                  </div>
                </div>
              </>
            )}
            {activeTab === SentinelTab.MESH && <NodeGraph />}
            {activeTab === SentinelTab.SPECS && <SystemSpecs />}
          </div>
        </div>
        {/* Diag - Col 3 */}
        <aside className="w-[320px] border-l border-slate-900 bg-[#040408] flex flex-col shrink-0 overflow-hidden">
          <header className="p-6 border-b border-slate-900 flex items-center justify-between">
            <span className="text-slate-500 uppercase tracking-widest">Diagnostic_Stream</span>
            <Activity className="size-3 text-blue-500" />
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <DiagCard icon={HardDrive} label="Dexie_Storage" value="V4_ACTIVE" status="Optimal" />
            <DiagCard icon={Wifi} label="Mesh_Peers" value="TELEMETRY_MESH" status="Syncing" />
            <div className="pt-4 space-y-2">
              <span className="text-[8px] text-slate-700 uppercase tracking-[0.2em] px-2 font-bold">Audit_Log_24H</span>
              <div className="bg-black rounded-2xl border border-slate-900 p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-2 text-[9px]">
                    <span className="text-slate-700 shrink-0">[{format(log.timestamp, 'HH:mm')}]</span>
                    <span className={cn(
                      "uppercase truncate",
                      log.severity === 'CRITICAL' ? "text-rose-500" : "text-emerald-500"
                    )}>{log.event}</span>
                  </div>
                ))}
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
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase",
        active ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:text-slate-400"
      )}
    >
      <Icon className={cn("size-4", active ? "text-blue-500" : "text-slate-700")} />
      <span>{label}</span>
    </button>
  );
}
function DiagCard({ icon: Icon, label, value, status }: { icon: any, label: string, value: string, status: string }) {
  return (
    <div className="p-4 rounded-2xl bg-black border border-slate-900 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-3 text-slate-600" />
          <span className="text-slate-500 uppercase">{label}</span>
        </div>
        <div className="size-1.5 rounded-full bg-emerald-500" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-white font-bold italic truncate">{value}</span>
        <span className="text-[8px] text-slate-700 uppercase">{status}</span>
      </div>
    </div>
  );
}