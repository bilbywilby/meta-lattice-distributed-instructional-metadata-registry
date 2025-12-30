import React, { useState, useEffect } from "react";
import { ShieldCheck, Fingerprint, Ghost, Zap, Trash2, Cpu, EyeOff, Activity, Clock, Shield, Wifi, WifiOff, RefreshCcw, Radio } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { cn } from "@/lib/utils";
import { wipeSession, db, addLog, clearAllLogs } from "@/lib/db";
import { Identity, SentinelLog } from "@shared/types";
import { format } from "date-fns";
import { useOutboxSync } from "@/hooks/use-outbox";
import { SentinelInput } from "@/components/SentinelInput";
import { LocalFeed } from "@/components/LocalFeed";
export function PrivacyUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState("SENTINEL");
  const { queueSize, isSyncing, isOnline } = useOutboxSync();
  const [pruneCountdown, setPruneCountdown] = useState(60);
  useEffect(() => {
    const timer = setInterval(() => {
      setPruneCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <aside className="w-64 border-r border-slate-900 bg-[#040408] flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Radio className="text-[#020205] size-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-sm tracking-tighter text-white uppercase">LV HUB beta</span>
              <span className="text-[9px] text-emerald-500 font-mono font-bold animate-pulse">ACTIVE_NODE_V3</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">ID_HASH</span>
              <span className="text-sky-500 font-bold">{identity.nodeId}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">REGIONAL_NODES</span>
              <span className="text-slate-300 font-bold">1,244</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavBtn icon={Activity} label="Sentinel Input" active={activeTab === "SENTINEL"} onClick={() => setActiveTab("SENTINEL")} />
          <NavBtn icon={Zap} label="Regional Feed" active={activeTab === "FEED"} onClick={() => setActiveTab("FEED")} />
          <NavBtn icon={Activity} label="Event Logs" active={activeTab === "LOGS"} onClick={() => setActiveTab("LOGS")} />
          <NavBtn icon={Fingerprint} label="Key Vault" active={activeTab === "KEYS"} onClick={() => setActiveTab("KEYS")} />
        </nav>
        <div className="p-4 border-t border-slate-900 space-y-2">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-xl mb-4">
             <span className="text-[9px] font-mono text-slate-500 uppercase">Auto_Prune</span>
             <span className="text-[9px] font-mono text-emerald-500 font-bold">{pruneCountdown}s</span>
          </div>
          <button
            onClick={wipeSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all font-mono text-[10px] font-bold uppercase tracking-wider"
          >
            <Trash2 className="size-3" /> Burn_Identity
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 bg-[#020205]">
        <header className="h-16 border-b border-slate-900 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase",
              isOnline ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}>
              {isOnline ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {queueSize > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-full text-[10px] font-mono font-bold uppercase">
                {isSyncing && <RefreshCcw className="size-3 animate-spin" />}
                Outbox: {queueSize}
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            LEHIGH_VALLEY_REGIONAL_HUB_OS // v0.6.0-BETA
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12">
              {activeTab === "SENTINEL" && <SentinelInput />}
              {activeTab === "FEED" && <LocalFeed />}
              {activeTab === "LOGS" && <SystemLogView />}
              {activeTab === "KEYS" && <KeyManagerView identity={identity} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
function NavBtn({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-xl font-mono text-[11px] font-bold uppercase transition-all duration-200",
        active ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
function SystemLogView() {
  const logs = useLiveQuery(() => db.sentinel_logs.orderBy('timestamp').reverse().limit(50).toArray());
  return (
    <div className="space-y-6">
      <header className="border-l-2 border-emerald-500 pl-6">
        <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">System_Log</h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Live_Event_Stream // ephemeral_24h_retention</p>
      </header>
      <div className="rounded-2xl border border-slate-900 bg-[#040408] overflow-hidden">
        <div className="grid grid-cols-[140px_1fr_100px] gap-4 px-4 py-3 border-b border-slate-900 bg-slate-900/30 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          <span>Timestamp</span>
          <span>Event_Payload</span>
          <span>Severity</span>
        </div>
        <div className="divide-y divide-slate-900 max-h-[600px] overflow-y-auto font-mono">
          {logs?.map((log) => (
            <div key={log.id} className="grid grid-cols-[140px_1fr_100px] gap-4 px-4 py-3 items-center hover:bg-slate-900/20 transition-colors">
              <span className="text-[10px] text-slate-500">{format(log.timestamp, "HH:mm:ss.SSS")}</span>
              <span className="text-[11px] text-slate-300 truncate">{log.event}</span>
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full text-center border",
                log.severity === 'CRITICAL' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                log.severity === 'WARNING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              )}>
                {log.severity}
              </span>
            </div>
          ))}
          {(!logs || logs.length === 0) && (
            <div className="p-12 text-center text-slate-600 text-[10px] uppercase tracking-widest">No_System_Events_Captured</div>
          )}
        </div>
      </div>
    </div>
  );
}
function KeyManagerView({ identity }: { identity: Identity }) {
  return (
    <div className="space-y-8">
      <header className="border-l-2 border-emerald-500 pl-6">
        <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Key_Manager</h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">SSI_Identity // Local_Vault</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#08080C] border border-slate-900">
           <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
              <Shield className="size-5 text-emerald-500" />
           </div>
           <h3 className="text-sm font-mono font-bold text-white uppercase mb-2">Node_Signature</h3>
           <p className="text-[11px] text-slate-500 font-mono leading-relaxed">Generated during device provisioning. This key never leaves the local sandbox.</p>
        </div>
        <div className="p-6 rounded-3xl bg-[#08080C] border border-slate-900">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Public_Fingerprint</span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">{identity.nodeId}</span>
          </div>
          <div className="h-32 overflow-y-auto bg-black/50 rounded-xl p-4 border border-slate-800">
            <code className="text-[10px] text-slate-400 break-all font-mono leading-relaxed">
              {identity.publicKey}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}