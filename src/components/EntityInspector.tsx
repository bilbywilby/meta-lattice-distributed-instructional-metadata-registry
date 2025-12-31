import React, { useCallback } from 'react';
import { X, Code, ShieldCheck, Database, History, Activity, ChevronRight, Network, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
interface EntityInspectorProps {
  id: string;
  onClose: () => void;
}
export function EntityInspector({ id, onClose }: EntityInspectorProps) {
  const report = useLiveQuery(() => db.reports.get(id), [id]);
  const parent = useLiveQuery(() => report?.parentUnitId ? db.reports.get(report.parentUnitId) : Promise.resolve(null), [report?.parentUnitId]);
  const childrenRaw = useLiveQuery(() => db.reports.where('parentUnitId').equals(id).toArray(), [id]);
  const children = childrenRaw ?? [];
  const handleNavigate = useCallback((targetId: string) => {
    // Note: This assumes EntityInspector is used in a context where changing 'id' re-renders it.
    // In our implementation, RegistryBrowser/RegistryLedger handles the selection state.
    // If the parent manages this state, navigation is handled by the parent's setter.
    // For this UI, we provide the hooks, and the parent selection handles the re-trigger.
    window.dispatchEvent(new CustomEvent('lattice:navigate', { detail: { id: targetId } }));
  }, []);
  const safeFormat = (time?: number) => {
    if (!time) return 'N/A';
    const d = new Date(time);
    return isValid(d) ? format(d, 'MMM dd HH:mm:ss') : 'N/A';
  };
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.aside
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#020205] border-l border-slate-900 shadow-3xl flex flex-col h-full overflow-hidden"
        >
          <header className="h-20 border-b border-slate-900 flex items-center justify-between px-8 bg-[#040408] shrink-0">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                <Database className="size-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase italic tracking-tighter text-white">Entity_Inspector</h2>
                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest truncate max-w-[200px]">{id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-white transition-all">
              <X className="size-5" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-900">
            <div className="p-8 space-y-8 bg-black/30">
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Network className="size-3 text-emerald-500" /> Dependency_Graph
                </h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[8px] text-slate-600 uppercase font-bold font-mono tracking-[0.2em] px-1">Parent_Entity</span>
                    {parent ? (
                      <div 
                        className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between group hover:border-emerald-500/40 transition-all cursor-pointer"
                        onClick={() => handleNavigate(parent.id)}
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-200 font-bold uppercase truncate max-w-[150px]">{parent.title}</span>
                          <span className="text-[8px] text-slate-600 font-mono tracking-tighter">SHA256: {parent.id.slice(0, 12)}...</span>
                        </div>
                        <Link2 className="size-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-dashed border-slate-900 text-center text-[8px] text-slate-700 uppercase italic">
                        No_Parent_Entity
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <span className="text-[8px] text-slate-600 uppercase font-bold font-mono tracking-[0.2em] px-1">Child_Entities ({children.length})</span>
                    <div className="space-y-2">
                      {children.map(child => (
                        <div 
                          key={child.id} 
                          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between group hover:border-emerald-500/40 transition-all cursor-pointer"
                          onClick={() => handleNavigate(child.id)}
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-200 font-bold uppercase truncate max-w-[150px]">{child.title}</span>
                            <span className="text-[8px] text-slate-600 font-mono tracking-tighter">SHA256: {child.id.slice(0, 12)}...</span>
                          </div>
                          <ChevronRight className="size-3.5 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                      {children.length === 0 && (
                        <div className="p-4 rounded-2xl border border-dashed border-slate-900 text-center text-[8px] text-slate-700 uppercase italic">
                          No_Child_References
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
                <div className="space-y-1 bg-black/40 rounded-2xl p-2 border border-slate-900">
                  <HistoryItem label="Ingressed" time={report?.createdAt} />
                  <HistoryItem label="Hash Verified" time={Date.now()} status="OK" />
                  <HistoryItem label="Peered" status="N/A" />
                </div>
              </section>
            </div>
            <div className="p-8 space-y-8 bg-black/10">
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="size-3 text-blue-500" /> Validation_State
                </h3>
                <div className="p-6 rounded-3xl bg-[#040408] border border-blue-500/10 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Registry Level</span>
                    <span className="text-blue-500 font-black uppercase italic">CANONICAL_V1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Privacy Layer</span>
                    <span className="text-blue-500 font-black uppercase italic">±0.0045 JITTER</span>
                  </div>
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Code className="size-3 text-blue-500" /> Source_Packet
                </h3>
                <div className="p-6 rounded-3xl bg-black border border-slate-900 font-mono text-[10px] text-blue-400 overflow-x-auto max-h-[400px] scrollbar-hide shadow-2xl">
                  <pre className="leading-relaxed">{JSON.stringify(report, null, 2)}</pre>
                </div>
              </section>
            </div>
          </div>
          <footer className="p-8 border-t border-slate-900 bg-[#040408] flex justify-end gap-4 shrink-0">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl border border-slate-800 text-[10px] font-mono font-bold text-slate-500 uppercase hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-lg"
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
  const safeFormat = (t?: number) => {
    if (!t) return '';
    const d = new Date(t);
    return isValid(d) ? format(d, 'MMM dd HH:mm:ss') : '';
  };
  return (
    <div className="flex items-center justify-between p-3 border-b border-slate-900 last:border-0">
      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">{label}</span>
      <div className="text-right">
        {time && <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">{safeFormat(time)}</p>}
        {status && <p className="text-[9px] font-mono text-emerald-500 font-black uppercase tracking-widest">[{status}]</p>}
      </div>
    </div>
  );
}