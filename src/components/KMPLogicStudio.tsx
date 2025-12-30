import React from 'react';
import { Code, Cpu, Smartphone, ShieldCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
export function KMPLogicStudio() {
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
// WorkManager Batch Dispatcher (androidMain)
class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val batch = db.outbox().getTop(5) // Strict Batch-of-5
        return try {
            batch.forEach { api.upload(it) }
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 5) Result.retry() else Result.failure()
        }
    }
}
  `.trim();
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-l-2 border-purple-500 pl-6 mb-8">
        <h1 className="text-xl font-mono font-bold italic text-white uppercase tracking-tight">KMP_Logic_Studio</h1>
        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Shared_Module // CommonMain_Equivalents</p>
      </header>
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
          <div className="flex gap-1.5">
             <div className="size-2 rounded-full bg-rose-500/20" />
             <div className="size-2 rounded-full bg-amber-500/20" />
             <div className="size-2 rounded-full bg-emerald-500/20" />
          </div>
        </div>
        <ScrollArea className="h-[450px]">
          <pre className="p-8 text-[10px] font-mono leading-relaxed text-purple-400 whitespace-pre">
            {kmpCode}
          </pre>
        </ScrollArea>
      </div>
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