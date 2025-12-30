import React, { useState, useEffect } from "react";
import { Activity, Database, Network, Share2, Cpu, Trash2, Wifi, WifiOff, RefreshCcw, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { wipeSession } from "@/lib/db";
import { Identity } from "@shared/types";
import { BookOpen } from "lucide-react";
import { useOutboxSync } from "@/hooks/use-outbox";
import { SentinelInput } from "@/components/SentinelInput";
import { LocalFeed } from "@/components/LocalFeed";
import { SentinelRegistry } from "@/components/SentinelRegistry";
import { WikiModule } from "@/components/WikiModule";
import { MeshTopology } from "@/components/MeshTopology";
import { SystemSpecs } from "@/components/SystemSpecs";
import { NodeGraph } from "@/components/NodeGraph";
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
    <div className="flex h-screen overflow-hidden font-sans bg-[#020205] text-slate-300 selection:bg-blue-500/30">
      {/* Sidebar - Carbon Aesthetic */}
      <aside className="w-64 border-r border-slate-900 bg-[#040408] flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Terminal className="text-white size-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-sm tracking-tighter text-white uppercase italic">LV HUB OS</span>
              <span className="text-[9px] text-blue-500 font-mono font-bold animate-pulse uppercase">Privacy_Active</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">NODE_ID</span>
              <span className="text-blue-400 font-bold">{identity.nodeId}</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavBtn icon={Activity} label="Sentinel" active={activeTab === "SENTINEL"} onClick={() => setActiveTab("SENTINEL")} />
          <NavBtn icon={Database} label="Registry" active={activeTab === "REGISTRY"} onClick={() => setActiveTab("REGISTRY")} />
          <NavBtn icon={Network} label="Topology" active={activeTab === "TOPOLOGY"} onClick={() => setActiveTab("TOPOLOGY")} />
          <NavBtn icon={Share2} label="P2P Mesh" active={activeTab === "MESH"} onClick={() => setActiveTab("MESH")} />
          <NavBtn icon={Cpu} label="System" active={activeTab === "SYSTEM"} onClick={() => setActiveTab("SYSTEM")} />
          <NavBtn icon={BookOpen} label="Wiki" active={activeTab === "WIKI"} onClick={() => setActiveTab("WIKI")} />
        </nav>
        <div className="p-4 border-t border-slate-900 space-y-4">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-xl border border-slate-800">
             <span className="text-[9px] font-mono text-slate-500 uppercase">Auto_Prune</span>
             <span className="text-[9px] font-mono text-blue-500 font-bold">{pruneCountdown}s</span>
          </div>
          <button
            onClick={wipeSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all font-mono text-[10px] font-bold uppercase"
          >
            <Trash2 className="size-3" /> Wipe Node
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
        <header className="h-16 border-b border-slate-900 px-8 flex items-center justify-between bg-[#020205]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase",
              isOnline ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}>
              {isOnline ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
              {isOnline ? 'Network_Live' : 'Air_Gapped'}
            </div>
            {queueSize > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-mono font-bold uppercase">
                {isSyncing && <RefreshCcw className="size-3 animate-spin" />}
                Sync_Queue: {queueSize}
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest hidden sm:block">
            LV_HUB_REGIONAL_OS_V0.8.2 // SECURE_MESH
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-10">
            {activeTab === "SENTINEL" && <SentinelInput />}
            {activeTab === "REGISTRY" && <SentinelRegistry />}
            {activeTab === "TOPOLOGY" && <NodeGraph />}
            {activeTab === "MESH" && <MeshTopology />}
            {activeTab === "SYSTEM" && <SystemSpecs />}
            {activeTab === "WIKI" && <WikiModule />}
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
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-[11px] font-bold uppercase transition-all duration-300 text-left border border-transparent group",
        active 
          ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] translate-x-1" 
          : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 hover:translate-x-1"
      )}
    >
      <Icon className={cn("size-4 shrink-0 transition-colors", active ? "text-white" : "text-slate-600 group-hover:text-blue-400")} />
      <span className="truncate">{label}</span>
    </button>
  );
}