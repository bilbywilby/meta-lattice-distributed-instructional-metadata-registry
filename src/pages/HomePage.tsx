import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { PrivacyInitializer } from '@/components/PrivacyInitializer';
import { SentinelUI } from '@/components/SentinelUI';
import { Toaster } from '@/components/ui/sonner';
import { Cpu } from 'lucide-react';
import { Identity } from '@shared/types';
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
      <div className="bg-[#020205] min-h-screen">
        <PrivacyInitializer onComplete={() => setBootStatus('BOOTING')} />
        <Toaster richColors position="top-center" theme="dark" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 selection:bg-blue-500/30">
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
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="size-16 rounded-2xl bg-[#040408] border border-slate-900 flex items-center justify-center shadow-2xl"
                >
                  <Cpu className="size-8 text-blue-500" />
                </motion.div>
              </div>
              <div className="space-y-2.5 font-mono text-[10px] uppercase tracking-widest text-slate-600 italic">
                <BootLine label="Kernel_Auth" delay={0.2} />
                <BootLine label="Local_Enc_FS" delay={0.6} />
                <BootLine label="Node_Handshake" delay={1.0} />
                <BootLine label="Sentinel_V3_Ready" delay={1.4} />
              </div>
              <motion.div
                initial={{ width: 0 }} animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="h-1 bg-blue-500/10 rounded-full overflow-hidden"
              >
                <div className="h-full bg-blue-600 w-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <SentinelUI identity={identity as Identity} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster richColors position="bottom-right" theme="dark" />
    </div>
  );
}
function BootLine({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className="flex justify-between items-center">
      <span>{label}</span>
      <span className="text-blue-500 font-bold tracking-tighter">[OK]</span>
    </motion.div>
  );
}