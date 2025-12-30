import React, { useState, useCallback } from "react";
import { Fingerprint, ShieldAlert, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateKeyPair, deriveNodeId } from "@/lib/crypto";
import { db, addLog } from "@/lib/db";
import { toast } from "sonner";
import { Identity } from "@shared/types";
export function PrivacyInitializer({ onComplete }: { onComplete: (identity: Identity) => void }) {
  const [step, setStep] = useState<'IDLE' | 'GENERATING' | 'FINISHING'>('IDLE');
  const initialize = useCallback(async () => {
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
      await addLog("IDENTITY_GENERATED_LOCALLY", "INFO", { nodeId });
      setTimeout(() => {
        setStep('FINISHING');
        setTimeout(() => {
          onComplete(newIdentity);
          toast.success("Identity Sealed Locally");
        }, 1000);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Initialization Failed");
      setStep('IDLE');
    }
  }, [onComplete]);
  return (
    <div className="min-h-screen bg-[#020205] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-12">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1] 
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="size-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-6 border-2 border-slate-800"
          >
            <ShieldAlert className="size-8 text-sky-500" />
          </motion.div>
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
          <AnimatePresence>
            {step !== 'IDLE' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 space-y-2 pt-2"
              >
                <ProgressLine label="Hashing Node ID" active={step === 'GENERATING'} />
                <ProgressLine label="Sealing Identity" active={step === 'FINISHING'} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
function ProgressLine({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em]">
      <span className={active ? "text-sky-500" : "text-slate-800"}>{label}</span>
      <span className={active ? "text-sky-500 animate-pulse" : "text-slate-800"}>[SYNCING]</span>
    </div>
  );
}