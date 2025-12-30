import React, { useState, useEffect } from "react";
import { ShieldCheck, Fingerprint, Ghost, Zap, Trash2, Cpu, EyeOff, Activity, Clock, Shield } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { cn } from "@/lib/utils";
import { wipeSession, db, addLog, clearAllLogs } from "@/lib/db";
import { Identity, SentinelLog } from "@shared/types";
import { format } from "date-fns";
export function PrivacyUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState("SYSTEM_LOG");
  const [pruneCountdown, setPruneCountdown] = useState(60);
  useEffect(() => {
    const timer = setInterval(() => {
      setPruneCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r border-slate-900 bg-[#040408] flex flex-col">
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <ShieldCheck className="text-[#020205] size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-xs tracking-tighter text-white uppercase">TheValleyHub</span>
              <span className="text-[9px] text-slate-500 font-mono">SECURE_NODE_V5</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">NODE_ID</span>
              <span className="text-sky-500 font-bold">{identity.nodeId}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">PRUNE_IN</span>
              <span className="text-emerald-500 font-bold">{pruneCountdown}s</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavBtn icon={Activity} label="System Log" active={activeTab === "SYSTEM_LOG"} onClick={() => setActiveTab("SYSTEM_LOG")} />
          <NavBtn icon={Fingerprint} label="Key Manager" active={activeTab === "KEY_MGR"} onClick={() => setActiveTab("KEY_MGR")} />
          <NavBtn icon={EyeOff} label="Metadata Masks" active={activeTab === "MASKS"} onClick={() => setActiveTab("MASKS")} />
        </nav>
        <div className="p-4 border-t border-slate-900 space-y-2">
          <button
            onClick={() => clearAllLogs().then(() => addLog("MANUAL_LOG_PURGE", "WARNING"))}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-all font-mono text-[10px] font-bold uppercase"
          >
            Clear_Logs
          </button>
          <button
            onClick={wipeSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all font-mono text-[10px] font-bold uppercase"
          >
            <Trash2 className="size-3" /> Wipe_Session
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-[#020205]">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {activeTab === "SYSTEM_LOG" && <SystemLogView />}
          {activeTab === "KEY_MGR" && <KeyManagerView identity={identity} />}
          {activeTab === "MASKS" && <MetadataMasksView />}
        </div>
      </main>
    </div>
  );
}
function SystemLogView() {
  const logs = useLiveQuery(() => db.sentinel_logs.orderBy('timestamp').reverse().limit(50).toArray());
  return (
    <div className="space-y-6">
      <header className="border-l-2 border-sky-500 pl-6">
        <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">System_Log</h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Live_Event_Stream // 50_Most_Recent</p>
      </header>
      <div className="rounded-2xl border border-slate-900 bg-[#040408] overflow-hidden">
        <div className="grid grid-cols-[140px_1fr_100px] gap-4 px-4 py-2 border-b border-slate-900 bg-slate-900/30 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
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
                "bg-sky-500/10 text-sky-500 border-sky-500/20"
              )}>
                {log.severity}
              </span>
            </div>
          ))}
          {(!logs || logs.length === 0) && (
            <div className="p-8 text-center text-slate-600 text-[10px] uppercase tracking-widest">No_Logs_Found</div>
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
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Cryptographic_Identity_Sealed</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TerminalCard 
          title="Public Key (SPKI)" 
          desc="Extracted during initialization. This is your public identity string used for node verification."
          icon={Shield}
        />
        <div className="p-6 rounded-3xl bg-[#08080C] border border-slate-900">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Hex_Fingerprint</span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">{identity.nodeId}</span>
          </div>
          <div className="h-32 overflow-y-auto bg-black/50 rounded-xl p-4 border border-slate-800">
            <code className="text-[10px] text-slate-400 break-all font-mono leading-relaxed">
              {identity.publicKey}
            </code>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4">
        <Clock className="size-5 text-emerald-500 shrink-0 mt-1" />
        <div>
          <h4 className="text-xs font-mono font-bold text-emerald-500 uppercase mb-1">Created_At</h4>
          <p className="text-[11px] text-slate-400 font-mono">{format(new Date(identity.createdAt), "PPP p")}</p>
        </div>
      </div>
    </div>
  );
}
function MetadataMasksView() {
  const [masks, setMasks] = useState([
    { id: 'UA', label: "User-Agent Spoofing", active: true, code: "UA_SPOOF_V2" },
    { id: 'IP', label: "IP Obfuscation", active: false, code: "ROUTE_REGEN" },
    { id: 'PL', label: "Payload Nonce", active: true, code: "HASH_NONCE_0X" },
  ]);
  const toggleMask = (id: string) => {
    setMasks(prev => prev.map(m => {
      if (m.id === id) {
        const newState = !m.active;
        addLog(`MASK_STATE_CHANGE: ${m.label} -> ${newState ? 'ACTIVE' : 'STANDBY'}`, 'INFO');
        return { ...m, active: newState };
      }
      return m;
    }));
  };
  return (
    <div className="space-y-6">
      <header className="border-l-2 border-sky-500 pl-6">
        <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Metadata_Masks</h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Anti-Forensic_Obfuscation_Active</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <TerminalCard
          title="Temporal Jitter"
          desc="Request timestamps are padded with random sub-second offsets to prevent traffic analysis."
          icon={Ghost}
        />
        <TerminalCard
          title="Encrypted Outbox"
          desc="Messages are AES-256-GCM encrypted locally before being added to the transmission queue."
          icon={Cpu}
        />
      </div>
      <div className="space-y-3">
        {masks.map(mask => (
          <div key={mask.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#040408] border border-slate-900 group hover:border-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className={cn("size-2 rounded-full shadow-[0_0_8px]", mask.active ? "bg-emerald-500 shadow-emerald-500/50" : "bg-slate-700 shadow-transparent")} />
              <div className="flex flex-col">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">{mask.label}</span>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">{mask.code}</span>
              </div>
            </div>
            <button 
              onClick={() => toggleMask(mask.id)}
              className={cn(
                "px-3 py-1 rounded-lg font-mono text-[9px] font-bold uppercase border transition-all",
                mask.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-900 text-slate-500 border-slate-800"
              )}
            >
              {mask.active ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
function NavBtn({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase transition-all duration-200",
        active ? "bg-sky-500/10 text-sky-500 border border-sky-500/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
function TerminalCard({ title, desc, icon: Icon }: any) {
  return (
    <div className="p-6 rounded-3xl bg-[#08080C] border border-slate-900 group hover:border-slate-800 transition-colors">
      <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-sky-500/10 transition-colors">
        <Icon className="size-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
      </div>
      <h3 className="text-sm font-mono font-bold text-white uppercase mb-2 italic">{title}</h3>
      <p className="text-[11px] text-slate-500 font-mono leading-relaxed">{desc}</p>
    </div>
  );
}