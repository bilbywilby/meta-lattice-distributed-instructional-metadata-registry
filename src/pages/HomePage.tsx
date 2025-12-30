import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { PrivacyInitializer } from '@/components/PrivacyInitializer';
import { PrivacyUI } from '@/components/PrivacyUI';
import { Toaster } from '@/components/ui/sonner';
import { Cpu, ShieldCheck } from 'lucide-react';
export function HomePage() {
  const [bootStatus, setBootStatus] = useState<'IDLE' | 'BOOTING' | 'READY'>('IDLE');
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  useEffect(() => {
    if (identity && bootStatus === 'IDLE') {
      setBootStatus('BOOTING');
      const timer = setTimeout(() => setBootStatus('READY'), 2000);
      return () => clearTimeout(timer);
    }
  }, [identity, bootStatus]);
  if (!identity) {
    return (
      <>
        <PrivacyInitializer onComplete={() => setBootStatus('BOOTING')} />
        <Toaster richColors position="top-center" />
      </>
    );
  }
  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 selection:bg-emerald-500/30">
      <AnimatePresence mode="wait">
        {bootStatus === 'BOOTING' ? (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-xs w-full space-y-8">
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center"
                >
                  <Cpu className="size-8 text-emerald-500" />
                </motion.div>
              </div>
              <div className="space-y-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                <BootLine label="Kernel_Auth" delay={0.2} />
                <BootLine label="Local_Enc_FS" delay={0.5} />
                <BootLine label="Node_Registry_Handshake" delay={0.8} />
                <BootLine label="Sentinel_V3_Ready" delay={1.1} />
              </div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-1 bg-emerald-500/20 rounded-full overflow-hidden"
              >
                <div className="h-full bg-emerald-500 w-full animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PrivacyUI identity={identity} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
function BootLine({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex justify-between items-center"
    >
      <span>{label}</span>
      <span className="text-emerald-500 font-bold">[OK]</span>
    </motion.div>
  );
}