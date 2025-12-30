import React, { useState } from 'react';
import { Code, Cpu, Smartphone, ShieldCheck, Rocket, CheckCircle, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
export function KMPLogicStudio() {
  const [activeTab, setActiveTab] = useState<'KMP' | 'DEPLOY'>('KMP');
  const kmpCode = `
// commonMain: Shared Logic for Android/Web Port v0.8.2
package com.lattice.hub.common.crypto
import kotlin.math.random
import kotlinx.datetime.Clock
object LatticeRegistryCore {
    const val JITTER_FACTOR = 0.0045
    fun generateJitteredCoord(coord: Double): Double {
        return coord + ((Math.random() - 0.5) * (JITTER_FACTOR * 2))
    }
    fun computeResidencyHash(street: String, salt: String = "VALLEY_HUB_V1"): String {
        val input = street.trim().uppercase() + ":" + salt
        return SHA256.digest(input).toHex().take(12).uppercase()
    }
}
// Env Mapping
val PROD_ENV = mapOf(
    "PRUNING_H" to 24,
    "RETENTION" to "ROLLING_WINDOW"
)
  `.trim();
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-l-2 border-purple-500 pl-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-mono font-bold italic text-white uppercase tracking-tight">KMP_Logic_Studio</h1>
          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Shared_Module // Production_Parity</p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('KMP')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase", activeTab === 'KMP' ? "bg-purple-600 text-white" : "text-slate-500")}>Logic</button>
          <button onClick={() => setActiveTab('DEPLOY')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase", activeTab === 'DEPLOY' ? "bg-blue-600 text-white" : "text-slate-500")}>Deployment</button>
        </div>
      </header>
      {activeTab === 'KMP' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard icon={Cpu} label="Module" value="commonMain" status="Linked" />
            <StatusCard icon={Smartphone} label="Platform" value="Android_14" status="API_34" />
            <StatusCard icon={ShieldCheck} label="Schema" value="SQLDelight" status="v4_Migrated" />
          </div>
          <div className="bg-[#040408] border border-slate-900 rounded-3xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-900 bg-slate-950/50">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase flex items-center gap-2">
                <Code className="size-3 text-purple-500" /> commonMain / shared_logic.kt
              </span>
            </div>
            <ScrollArea className="h-[400px]">
              <pre className="p-8 text-[10px] font-mono leading-relaxed text-purple-400 whitespace-pre">
                {kmpCode}
              </pre>
            </ScrollArea>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <DeploymentCard 
              title="Cloud_Run_Cluster" 
              status="CANARY_ACTIVE" 
              metric="10% Traffic" 
              icon={Rocket}
              color="text-blue-500"
            />
            <DeploymentCard 
              title="Kubernetes_Pod_Grid" 
              status="3/3 REPLICAS" 
              metric="Healthy" 
              icon={Activity}
              color="text-emerald-500"
            />
          </div>
          <div className="p-8 rounded-3xl bg-[#040408] border border-slate-900 space-y-4">
            <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Canary_Verification_Log</h3>
            <div className="space-y-3">
              <LogLine msg="Health_Check: /api/health [200 OK]" success />
              <LogLine msg="System_String: META_LATTICE_V1.0_PROD" success />
              <LogLine msg="Traffic_Shift: 10% Canary Weight" success />
              <LogLine msg="Latency_Audit: 24ms Average" success />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function StatusCard({ icon: Icon, label, value, status }: { icon: any, label: string, value: string, status: string }) {
  return (
    <div className="p-4 rounded-2xl bg-[#040408] border border-slate-900 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon className="size-3 text-slate-600" />
        <span className="text-[8px] font-mono text-slate-700 uppercase">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase">{value}</span>
        <span className="text-[7px] text-emerald-500 font-bold uppercase">[{status}]</span>
      </div>
    </div>
  );
}
function DeploymentCard({ title, status, metric, icon: Icon, color }: any) {
  return (
    <div className="p-6 rounded-3xl bg-[#040408] border border-slate-900 flex items-center justify-between group hover:border-blue-500/20">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
          <Icon className={cn("size-5", color)} />
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase text-white tracking-tight italic">{title}</h4>
          <p className="text-[9px] font-mono text-slate-600 uppercase">{status}</p>
        </div>
      </div>
      <span className={cn("text-[10px] font-bold uppercase", color)}>{metric}</span>
    </div>
  );
}
function LogLine({ msg, success }: { msg: string, success: boolean }) {
  return (
    <div className="flex items-center justify-between text-[9px] font-mono">
      <span className="text-slate-500 uppercase">{msg}</span>
      <span className={success ? "text-emerald-500" : "text-rose-500"}>[PASS]</span>
    </div>
  );
}