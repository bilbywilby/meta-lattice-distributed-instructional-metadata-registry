import React from "react";
import { Lock, HardDrive, EyeOff, ShieldCheck, Book, ExternalLink, Activity, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SentinelLog } from "@shared/types";
export function SystemSpecs() {
  const logs = useLiveQuery(() => db.sentinel_logs.orderBy('timestamp').reverse().limit(15).toArray()) ?? [];
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="border-l-2 border-emerald-500 pl-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-mono font-bold italic text-white uppercase tracking-tighter">System_Architecture</h1>
          <p className="text-[9px] text-emerald-500 font-mono uppercase tracking-[0.2em] mt-0.5">PROD_READY // V0.8.2_STABLE</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Cloud className="size-3 text-emerald-500" />
          <span className="text-[8px] font-mono font-bold text-emerald-500 uppercase">Edge_Live</span>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpecCard icon={Lock} title="Cryptography" value="P-256 ECDSA" />
        <SpecCard icon={HardDrive} title="Persistence" value="Dexie v4" />
        <SpecCard icon={EyeOff} title="Geo-Masking" value="±0.0045 Jitter" />
        <SpecCard icon={ShieldCheck} title="Validation" value="AJV Stable" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Activity className="size-3" /> Production_Audit_Stream
          </h2>
          <div className="bg-[#040408] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
              {logs.map((log) => (
                <LogLine key={log.id} log={log} />
              ))}
              {logs.length === 0 && (
                <div className="p-10 text-center font-mono text-[9px] text-slate-700 uppercase">Awaiting_Telemetry...</div>
              )}
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-1">Resources</h2>
          <DocumentationCard 
            title="Technical_Spec" 
            desc="Schema definitions & API endpoints" 
            link="/docs/TECHNICAL_SPEC.md"
          />
          <DocumentationCard 
            title="Deployment_Guide" 
            desc="K8s and Cloud Run manifests" 
            link="/docs/TECHNICAL_SPEC.md#05-deploy"
          />
          <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/20 space-y-3">
             <p className="text-[9px] font-mono text-blue-400 uppercase font-bold">Retention_Policy</p>
             <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
               Strict 24h rolling pruning enabled. All diagnostic data is wiped automatically every 60 minutes.
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
function LogLine({ log }: { log: SentinelLog }) {
  const isCanaryEvent = log.event.includes('CANARY') || log.event.includes('DEPLOY');
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-900/50 hover:bg-slate-900/20 transition-colors">
      <div className="flex items-center gap-4 overflow-hidden">
        <span className="text-[9px] font-mono text-slate-600 shrink-0">{format(log.timestamp, "HH:mm:ss")}</span>
        <div className="flex flex-col truncate">
          <span className={cn(
            "text-[10px] font-mono font-bold uppercase italic truncate",
            isCanaryEvent ? "text-blue-400" : "text-slate-300"
          )}>{log.event}</span>
          {log.metadata && (
            <span className="text-[8px] font-mono text-slate-600 truncate">
              {Object.entries(log.metadata).map(([k, v]) => `${k}:${v}`).join(' | ')}
            </span>
          )}
        </div>
      </div>
      <span className={cn(
        "text-[9px] font-mono font-bold px-2 py-0.5 rounded border",
        log.severity === 'CRITICAL' ? "text-rose-500 border-rose-500/20" : "text-emerald-500 border-emerald-500/20"
      )}>
        {log.severity}
      </span>
    </div>
  );
}
function SpecCard({ icon: Icon, title, value }: { icon: any, title: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-[#040408] border border-slate-900 flex items-center gap-4">
      <div className="size-8 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
        <Icon className="size-4 text-emerald-500" />
      </div>
      <div>
        <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">{title}</p>
        <p className="text-[10px] font-bold text-white uppercase">{value}</p>
      </div>
    </div>
  );
}
function DocumentationCard({ title, desc, link }: { title: string, desc: string, link: string }) {
  return (
    <div className="p-6 rounded-3xl bg-[#040408] border border-slate-900 space-y-2 group hover:border-emerald-500/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="size-3 text-emerald-500" />
          <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-tighter italic">{title}</h3>
        </div>
        <ExternalLink className="size-3 text-slate-600 group-hover:text-emerald-500 transition-colors" />
      </div>
      <p className="text-[9px] font-mono text-slate-500 uppercase leading-tight">{desc}</p>
    </div>
  );
}