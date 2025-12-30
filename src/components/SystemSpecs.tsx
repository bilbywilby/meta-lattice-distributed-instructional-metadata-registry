import React from "react";
import { Lock, HardDrive, EyeOff, ShieldCheck } from "lucide-react";
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
      <header className="border-l-2 border-blue-600 pl-4">
        <h1 className="text-xl font-mono font-bold italic text-white uppercase tracking-tighter">System_Architecture</h1>
        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-0.5">LV_HUB_OS_SPEC_V0.8.2 // LOGS_ACTIVE</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SpecCard
          icon={Lock}
          title="Cryptography_Core"
          specs={[
            { label: "Algorithm", value: "ECDSA P-256 (NIST)" },
            { label: "Identity Hash", value: "SHA-256 (Truncated)" },
            { label: "Protocol", value: "SPKI Base64 Handshake" }
          ]}
        />
        <SpecCard
          icon={HardDrive}
          title="Storage_Database"
          specs={[
            { label: "Engine", value: "Dexie v4 (IndexedDB)" },
            { label: "Bucket", value: "LehighValleyHub_Sentinel_v4" },
            { label: "Retention", value: "24h Rolling Prune" }
          ]}
        />
        <SpecCard
          icon={EyeOff}
          title="Geo-Masking"
          specs={[
            { label: "Mechanism", value: "Jittered Geohash" },
            { label: "Variance", value: "±0.0045 Precise" },
            { label: "Obfuscation", value: "500m Surface Radius" }
          ]}
        />
        <SpecCard
          icon={ShieldCheck}
          title="Metadata_Stripping"
          specs={[
            { label: "Exif Removal", value: "ENFORCED ON_UPLOAD" },
            { label: "Identity", value: "Self-Sovereign Node" },
            { label: "Tracing", value: "Antiforensic Enabled" }
          ]}
        />
      </div>
      <section className="space-y-4">
        <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-1">Scrubbed_Audit_Logs</h2>
        <div className="bg-[#040408] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
          <div className="max-h-[300px] overflow-y-auto">
            {logs.map((log) => (
              <LogLine key={log.id} log={log} />
            ))}
            {logs.length === 0 && (
              <div className="p-10 text-center font-mono text-[9px] text-slate-700 uppercase">No_Recent_Log_Telemetry</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
function LogLine({ log }: { log: SentinelLog }) {
  const getSeverityStyle = (severity: SentinelLog['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return "text-rose-500 bg-rose-500/5 border-rose-500/20";
      case 'WARNING':
        return "text-amber-500 bg-amber-500/5 border-amber-500/20";
      default:
        return "text-emerald-500 bg-emerald-500/5 border-emerald-500/20";
    }
  };
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-900/50 hover:bg-slate-900/20 transition-colors">
      <div className="flex items-center gap-4 overflow-hidden">
        <span className="text-[9px] font-mono text-slate-600 uppercase shrink-0">{format(log.timestamp, "HH:mm:ss:SSS")}</span>
        <div className="flex flex-col truncate">
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase italic truncate">{log.event}</span>
          {log.metadata && (
            <span className="text-[8px] font-mono text-slate-600 truncate">
              {Object.entries(log.metadata).map(([k, v]) => `${k}:${v}`).join(' | ')}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={cn(
          "text-[9px] font-mono font-bold px-2 py-0.5 rounded border",
          getSeverityStyle(log.severity)
        )}>
          {log.severity}
        </span>
      </div>
    </div>
  );
}
function SpecCard({ icon: Icon, title, specs }: { icon: any, title: string, specs: { label: string, value: string }[] }) {
  return (
    <Card className="bg-[#040408] border-slate-900 rounded-3xl overflow-hidden group hover:border-blue-500/20 transition-all duration-500 shadow-xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
            <Icon className="size-4 text-blue-500" />
          </div>
          <h3 className="text-[10px] font-mono font-bold text-white uppercase italic tracking-widest">{title}</h3>
        </div>
        <div className="space-y-2.5">
          {specs.map((spec, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] font-mono border-b border-slate-900/30 pb-1.5 last:border-0">
              <span className="text-slate-500 uppercase tracking-tighter">{spec.label}</span>
              <span className="text-slate-300 font-bold uppercase">{spec.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}