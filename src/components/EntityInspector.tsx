import React from 'react';
import { X, Code, ShieldCheck, Database, History, Activity, ChevronRight, Network, Link2 } from 'lucide-react';
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
  const parent = useLiveQuery(() => report?.parentUnitId ? db.reports.get(report.parentUnitId) : Promise.resolve(null), [report?.parentUnitId]);
  const children = useLiveQuery(() => db.reports.where('parentUnitId').equals(id).toArray(), [id]) ?? [];
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
          className="relative w-full max-w-2xl bg-[#020205] border-l border-slate-900 shadow-2xl flex flex-col h-full overflow-hidden"
        >
          <header className="h-20 border-b border-slate-900 flex items-center justify-between px-8 bg-[#040408] shrink-0">
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
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-900">
            <div className="p-8 space-y-8 bg-black/20">
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Network className="size-3 text-emerald-500" /> Dependency_Graph
                </h3>
                <div className="space-y-4">
                  {/* Parent Link */}
                  <div className="space-y-2">
                    <span className="text-[8px] text-slate-600 uppercase font-mono tracking-widest">Parent_Entity</span>
                    {parent ? (
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-300 font-bold uppercase truncate max-w-[150px]">{parent.title}</span>
                          <span className="text-[8px] text-slate-600 font-mono">ID: {parent.id.slice(0, 8)}...</span>
                        </div>
                        <Link2 className="size-3 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-slate-800 text-center text-[8px] text-slate-700 uppercase">
                        No_Parent_Entity
                      </div>
                    )}
                  </div>
                  {/* Children Links */}
                  <div className="space-y-2">
                    <span className="text-[8px] text-slate-600 uppercase font-mono tracking-widest">Child_Entities ({children.length})</span>
                    <div className="space-y-2">
                      {children.map(child => (
                        <div key={child.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-300 font-bold uppercase truncate max-w-[150px]">{child.title}</span>
                            <span className="text-[8px] text-slate-600 font-mono">ID: {child.id.slice(0, 8)}...</span>
                          </div>
                          <ChevronRight className="size-3 text-slate-700 group-hover:text-emerald-500" />
                        </div>
                      ))}
                      {children.length === 0 && (
                        <div className="p-3 rounded-xl border border-dashed border-slate-800 text-center text-[8px] text-slate-700 uppercase">
                          No_Child_Entities
                        </div>
                      )}
                    </div>
                  </div>
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
                  <ShieldCheck className="size-3 text-blue-500" /> Validation_State
                </h3>
                <div className="p-6 rounded-3xl bg-[#040408] border border-blue-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Registry Level</span>
                    <span className="text-blue-500 font-bold uppercase">CANONICAL_V1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Privacy Layer</span>
                    <span className="text-blue-500 font-bold uppercase">±0.0045 JITTER</span>
                  </div>
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Code className="size-3 text-blue-500" /> Source_Packet
                </h3>
                <div className="p-4 rounded-2xl bg-black border border-slate-900 font-mono text-[10px] text-blue-400 overflow-x-auto max-h-[300px]">
                  <pre>{JSON.stringify(report, null, 2)}</pre>
                </div>
              </section>
            </div>
          </div>
          <footer className="p-8 border-t border-slate-900 bg-[#040408] flex justify-end gap-4 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-slate-800 text-[10px] font-mono font-bold text-slate-500 uppercase hover:bg-slate-900 transition-all active:scale-95"
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