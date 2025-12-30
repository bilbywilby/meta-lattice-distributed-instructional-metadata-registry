import React, { useState } from "react";
import { Fingerprint, ShieldAlert, Loader2 } from "lucide-react";
import { generateKeyPair, deriveNodeId } from "@/lib/crypto";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { Identity } from "@shared/types";
export function PrivacyInitializer({ onComplete }: { onComplete: (identity: Identity) => void }) {
  const [step, setStep] = useState<'IDLE' | 'GENERATING' | 'FINISHING'>('IDLE');
  async function initialize() {
    setStep('GENERATING');
    try {
      const { publicKey } = await generateKeyPair();
      const nodeId = await deriveNodeId(publicKey);
      const newIdentity: Identity = {
        nodeId,
        publicKey,
        createdAt: new Date().toISOString()
      };
      await db.identity.add(newIdentity);
      // Simulate sealing process for UX
      setTimeout(() => {
        setStep('FINISHING');
        setTimeout(() => {
          onComplete(newIdentity);
          toast.success("Identity Sealed Locally");
        }, 1000);
      }, 1500);
    } catch (err) {
      toast.error("Initialization Failed");
      setStep('IDLE');
    }
  }
  return (
    <div className="min-h-screen bg-[#020205] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="size-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-6 border-2 border-slate-800 animate-pulse">
            <ShieldAlert className="size-8 text-sky-500" />
          </div>
          <h1 className="text-xl font-mono font-bold text-white italic uppercase tracking-tighter mb-2">Privacy_Initializer</h1>
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest leading-relaxed">
            Generate local cryptographic keys. No data will leave this device during generation.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={initialize}
            disabled={step !== 'IDLE'}
            className="group w-full h-16 rounded-3xl bg-[#08080C] border border-slate-800 hover:border-sky-500/50 transition-all flex items-center justify-between px-6 overflow-hidden disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              {step === 'IDLE' ? (
                <Fingerprint className="size-6 text-slate-600 group-hover:text-sky-500 transition-colors" />
              ) : (
                <Loader2 className="size-6 text-sky-500 animate-spin" />
              )}
              <div className="text-left">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                  {step === 'IDLE' ? 'Generate_P256_Keys' : 'Executing_Protocols'}
                </p>
                <p className="text-[9px] font-mono text-slate-700 uppercase">Local-First // Anti-Forensic</p>
              </div>
            </div>
            <div className="size-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-sky-500" />
            </div>
          </button>
          {step !== 'IDLE' && (
            <div className="px-6 space-y-2">
              <ProgressLine label="Hashing Node ID" active={step === 'GENERATING'} />
              <ProgressLine label="Sealing Identity" active={step === 'FINISHING'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function ProgressLine({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em]">
      <span className={active ? "text-sky-500" : "text-slate-800"}>{label}</span>
      <span className={active ? "text-sky-500" : "text-slate-800"}>[SYNCING]</span>
    </div>
  );
}