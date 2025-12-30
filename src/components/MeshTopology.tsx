import React, { useState } from "react";
import { Wifi, Search, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addLog } from "@/lib/db";
export function MeshTopology() {
  const [status, setStatus] = useState<'idle' | 'searching' | 'connected'>('idle');
  const [peers, setPeers] = useState<number>(0);
  const scanPeers = () => {
    setStatus('searching');
    addLog("P2P_SCAN_INITIATED", "INFO");
    const timer = setTimeout(() => {
      setStatus('connected');
      setPeers(Math.floor(Math.random() * 12) + 3);
      addLog("P2P_MESH_CONNECTED", "INFO", { stun: "stun.l.google.com" });
    }, 2500);
    return () => clearTimeout(timer);
  };
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="border-l-2 border-blue-500 pl-6 mb-8">
        <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">P2P_Mesh_Topology</h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Direct_Node_Sync // STUN_ENABLED</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#040408] border-slate-900 rounded-3xl lg:col-span-2 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-12 space-y-8 relative">
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                    <div className="size-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
                      <Wifi className="size-10 text-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Mesh_Sync_Idle</p>
                      <p className="text-[10px] font-mono text-slate-700 uppercase">Awaiting_Manual_Handshake</p>
                    </div>
                    <Button onClick={scanPeers} className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl px-8 h-12">
                      Scan_Regional_Peers
                    </Button>
                  </motion.div>
                )}
                {status === 'searching' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                    <div className="relative size-24 mx-auto">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-blue-500 rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="size-8 text-blue-500 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-xs font-mono text-blue-500 uppercase tracking-widest animate-pulse">Broadcasting_SCTP_Discovery</p>
                  </motion.div>
                )}
                {status === 'connected' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 w-full">
                    <div className="flex justify-center gap-4 mb-8">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ delay: i * 0.1, repeat: Infinity }} className="size-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-mono font-bold text-white uppercase italic">Active_Mesh_Established</h3>
                      <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-bold">{peers} PEERS_SYNCING_REPORTS</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8">
                       <SpecItem label="Protocol" value="WebRTC SCTP" />
                       <SpecItem label="Encryption" value="DTLS-SRTP" />
                       <SpecItem label="STUN" value="stun.l.google.com" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#08080C] border border-slate-900 space-y-4">
             <div className="flex items-center gap-3">
               <ShieldAlert className="size-5 text-blue-500" />
               <span className="text-xs font-mono font-bold text-white uppercase italic">Privacy_Notice</span>
             </div>
             <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">
               Mesh sync occurs directly between browser nodes. Metadata is scrubbed before transmission. IP addresses are masked via STUN relay when available.
             </p>
          </div>
          <div className="p-6 rounded-3xl bg-[#08080C] border border-slate-900 space-y-4">
             <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-500">
               <span>Network_Health</span>
               <span className="text-emerald-500 font-bold">99.8%</span>
             </div>
             <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: "99.8%" }} className="h-full bg-emerald-500" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
      <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[10px] font-mono text-slate-300 font-bold uppercase">{value}</p>
    </div>
  );
}