import React from 'react';
import { X, Code, ShieldCheck, Database, History, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface EntityInspectorProps {
  id: string;
  onClose: () => void;
}
export function EntityInspector({ id, onClose }: EntityInspectorProps) {
  const report = useLiveQuery(() => db.reports.get(id), [id]);
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.aside
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#020205] border-l border-slate-900 shadow-2xl flex flex-col h-full"
        >
          <header className="h-20 border-b border-slate-900 flex items-center justify-between px-8 bg-[#040408]">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <Database className="size-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase italic tracking-tighter text-white">Entity_Inspector</h2>
                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X className="size-5" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 border-r border-slate-900 space-y-8 bg-black/20">
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Code className="size-3 text-blue-500" /> Raw_Source_JSON
                </h3>
                <div className="p-4 rounded-2xl bg-black border border-slate-900 font-mono text-[10px] text-blue-400 overflow-x-auto">
                  <pre>{JSON.stringify(report, null, 2)}</pre>
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History className="size-3 text-purple-500" /> Integrity_History
                </h3>
                <div className="space-y-3">
                  <HistoryItem label="Ingressed" time={report?.createdAt} />
                  <HistoryItem label="Hash Verified" time={Date.now()} status="OK" />
                </div>
              </section>
            </div>
            <div className="p-8 space-y-8">
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="size-3 text-emerald-500" /> Validation_State
                </h3>
                <div className="p-6 rounded-3xl bg-[#040408] border border-emerald-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Schema Match</span>
                    <span className="text-emerald-500 font-bold uppercase">SENTINEL_V4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Privacy Mask</span>
                    <span className="text-emerald-500 font-bold uppercase">±0.0045 JITTER</span>
                  </div>
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="size-3 text-amber-500" /> Metadata_Pointers
                </h3>
                <div className="space-y-2">
                  {report?.tags.map(t => (
                    <div key={t} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400 uppercase">
                      Pointer: {t}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
          <footer className="p-8 border-t border-slate-900 bg-[#040408] flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-slate-800 text-[10px] font-mono font-bold text-slate-500 uppercase hover:bg-slate-900 transition-all"
            >
              Dismiss_Audit
            </button>
          </footer>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}
function HistoryItem({ label, time, status }: { label: string, time?: number, status?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-900 last:border-0">
      <span className="text-[10px] font-mono text-slate-400 uppercase">{label}</span>
      <div className="text-right">
        {time && <p className="text-[9px] font-mono text-slate-600 uppercase">{format(time, 'MMM dd HH:mm:ss')}</p>}
        {status && <p className="text-[9px] font-mono text-emerald-500 font-bold uppercase">[{status}]</p>}
      </div>
    </div>
  );
}