import React, { useState } from "react";
import { ShieldCheck, Fingerprint, Ghost, Zap, Trash2, Cpu, EyeOff, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { wipeSession } from "@/lib/db";
import { Identity } from "@shared/types";
export function PrivacyUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState("SYSTEM_LOG");
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
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
            <div className="flex gap-1">
              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-500 text-[8px] font-bold border border-emerald-500/20">AES-256</span>
              <span className="px-1.5 py-0.5 rounded-sm bg-sky-500/10 text-sky-500 text-[8px] font-bold border border-sky-500/20">PRUNING</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavBtn icon={Activity} label="System Log" active={activeTab === "SYSTEM_LOG"} onClick={() => setActiveTab("SYSTEM_LOG")} />
          <NavBtn icon={Fingerprint} label="Key Manager" active={activeTab === "KEY_MGR"} onClick={() => setActiveTab("KEY_MGR")} />
          <NavBtn icon={EyeOff} label="Metadata Masks" active={activeTab === "MASKS"} onClick={() => setActiveTab("MASKS")} />
        </nav>
        <div className="p-4 border-t border-slate-900">
          <button 
            onClick={wipeSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all font-mono text-[10px] font-bold uppercase"
          >
            <Trash2 className="size-3" /> Wipe_Session
          </button>
        </div>
      </aside>
      {/* Main Terminal */}
      <main className="flex-1 overflow-auto bg-[#020205]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <header className="mb-12 border-l-2 border-sky-500 pl-6">
            <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Privacy_Control</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Status: Automated_Pruning_Active // 24H_Window</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <TerminalCard 
              title="Zero-Knowledge Reports" 
              desc="Traffic metrics are obfuscated using a 500ms temporal jitter. No PII is emitted during telemetry."
              icon={Ghost}
            />
            <TerminalCard 
              title="Anti-Forensic Storage" 
              desc="All session data resides in a dedicated IndexedDB sandbox. Global wipe clears all cryptographic material."
              icon={Cpu}
            />
          </div>
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Zap className="size-4 text-sky-500" />
              <h2 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-widest">Active_Metadata_Masks</h2>
            </div>
            <div className="space-y-3">
              <MaskItem label="User-Agent Spoofing" status="ACTIVE" code="UA_SPOOF_V2" />
              <MaskItem label="IP Obfuscation" status="STANDBY" code="ROUTE_REGEN" />
              <MaskItem label="Payload Nonce" status="ACTIVE" code="HASH_NONCE_0X" />
            </div>
          </section>
        </div>
      </main>
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
function MaskItem({ label, status, code }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#040408] border border-slate-900">
      <div className="flex items-center gap-4">
        <div className={cn("size-2 rounded-full shadow-[0_0_8px]", status === 'ACTIVE' ? "bg-emerald-500 shadow-emerald-500/50" : "bg-slate-700 shadow-transparent")} />
        <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">{label}</span>
      </div>
      <span className="text-[10px] font-mono text-slate-600">{code}</span>
    </div>
  );
}