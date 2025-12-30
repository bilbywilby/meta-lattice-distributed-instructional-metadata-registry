import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { PrivacyInitializer } from '@/components/PrivacyInitializer';
import { SentinelComposeUI } from '@/components/SentinelComposeUI';
import { Toaster } from '@/components/ui/sonner';
import { Layers, Terminal } from 'lucide-react';
import { Identity } from '@shared/types';
export function HomePage() {
  const [bootStatus, setBootStatus] = useState<'IDLE' | 'BOOTING' | 'READY'>('IDLE');
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  useEffect(() => {
    if (identity && bootStatus === 'IDLE') {
      setBootStatus('BOOTING');
      const timer = setTimeout(() => setBootStatus('READY'), 3000);
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
            className="fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center p-8"
          >
            <div className="max-w-xs w-full space-y-12">
              <div className="flex justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 180, 270, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="size-20 rounded-3xl bg-[#040408] border border-slate-900 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.1)]"
                >
                  <Terminal className="size-10 text-blue-500" />
                </motion.div>
              </div>
              <div className="space-y-4 font-mono text-[8px] uppercase tracking-[0.4em] text-slate-600">
                <BootLine label="Sentinel_V3_INIT" delay={0.2} />
                <BootLine label="Room_Schema_V4" delay={0.8} />
                <BootLine label="Hilt_Module_Load" delay={1.4} />
                <BootLine label="KMP_Bridge_Active" delay={2.0} />
              </div>
              <div className="h-0.5 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "circIn" }}
                  className="h-full bg-blue-600 shadow-[0_0_15px_#3b82f6]"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen overflow-hidden"
          >
            <SentinelComposeUI identity={identity as Identity} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster richColors position="bottom-right" theme="dark" />
    </div>
  );
}
function BootLine({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex justify-between items-center"
    >
      <span>{label}</span>
      <span className="text-blue-500 font-black">[OK]</span>
    </motion.div>
  );
}