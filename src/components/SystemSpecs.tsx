import React from "react";
import { Cpu, ShieldCheck, Database, Fingerprint, Lock, Zap, Server, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
export function SystemSpecs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="border-l-2 border-blue-500 pl-6 mb-8">
        <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">System_Architecture</h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">LV_HUB_OS_OS_V0.8.2 // Specification_Log</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpecCard 
          icon={HardDrive} 
          title="Persistence_Layer" 
          specs={[
            { label: "Storage Engine", value: "Dexie.js v4 (IndexedDB)" },
            { label: "Isolation", value: "Browser Sandbox (LocalFirst)" },
            { label: "Sync Mode", value: "Optimistic w/ Conflict Resolution" }
          ]} 
        />
        <SpecCard 
          icon={Fingerprint} 
          title="Cryptographic_Core" 
          specs={[
            { label: "Algorithm", value: "ECDSA P-256 (NIST)" },
            { label: "Format", value: "SPKI / PKCS#8 (Encoded)" },
            { label: "Proof Mechanism", value: "SHA-256 Hashing" }
          ]} 
        />
        <SpecCard 
          icon={Lock} 
          title="Privacy_Enforcement" 
          specs={[
            { label: "Metadata Scrubbing", value: "ENFORCED ON_INGRESS" },
            { label: "Geo-Privacy", value: "Jittered Geohash (Precision 6)" },
            { label: "Identity", value: "Self-Sovereign (No Server Map)" }
          ]} 
        />
        <SpecCard 
          icon={Server} 
          title="Edge_Handshake" 
          specs={[
            { label: "Compute", value: "Cloudflare Workers (V8)" },
            { label: "Consistency", value: "Strong (Durable Objects)" },
            { label: "Protocol", value: "HTTPS/3 (QUIC)" }
          ]} 
        />
      </div>
    </div>
  );
}
function SpecCard({ icon: Icon, title, specs }: { icon: any, title: string, specs: { label: string, value: string }[] }) {
  return (
    <Card className="bg-[#040408] border-slate-900 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Icon className="size-4 text-blue-500" />
          </div>
          <h3 className="text-xs font-mono font-bold text-white uppercase italic tracking-widest">{title}</h3>
        </div>
        <div className="space-y-3">
          {specs.map((spec, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] font-mono border-b border-slate-900/50 pb-2">
              <span className="text-slate-500 uppercase tracking-widest">{spec.label}</span>
              <span className="text-slate-300 font-bold uppercase">{spec.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}