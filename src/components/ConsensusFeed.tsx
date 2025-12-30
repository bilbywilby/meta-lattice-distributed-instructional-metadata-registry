import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, isValid } from 'date-fns';
import { ShieldCheck, AlertTriangle, Fingerprint, RefreshCw, Layers } from 'lucide-react';
import { NewsItem, ApiResponse } from '@shared/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export function ConsensusFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastPoll, setLastPoll] = useState<number>(Date.now());
  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/feed');
      const result = await res.json() as ApiResponse<NewsItem[]>;
      if (result.success && result.data) {
        setItems(result.data);
      }
    } catch (err) {
      console.error("[FEED_ERROR]", err);
    } finally {
      setLoading(false);
      setLastPoll(Date.now());
    }
  }, []);
  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 45000);
    return () => clearInterval(interval);
  }, [fetchFeed]);
  const safeFormatDistance = (timestamp: number) => {
    const d = new Date(timestamp);
    return isValid(d) ? formatDistanceToNow(d) : 'N/A';
  };
  return (
    <TooltipProvider delayDuration={200}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <header className="flex items-center justify-between border-l-2 border-blue-500 pl-6">
            <div>
              <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Consensus_Stream</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">
                Multi-Agent Verified // Last Poll: {safeFormatDistance(lastPoll)} ago
              </p>
            </div>
            <button
              onClick={() => { setLoading(true); fetchFeed(); }}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-blue-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </button>
          </header>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-3xl bg-[#040408] border border-slate-900 group hover:border-blue-500/30 transition-all shadow-xl"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-blue-400 text-xs shadow-inner">
                            {item.source.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white uppercase">{item.source}</p>
                            <p className="text-[9px] font-mono text-slate-600 uppercase">
                              {safeFormatDistance(item.timestamp)} ago // {item.region}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FeedBadge label="RELIABILITY" value={`${(item.reliability * 100).toFixed(0)}%`} color={item.reliability > 0.8 ? "text-emerald-500" : "text-amber-500"} />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Fingerprint className="size-4 text-slate-700 hover:text-blue-500 cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-[9px] font-mono uppercase tracking-tighter">Checksum: {item.checksum}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-200 leading-tight group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-400 font-mono leading-relaxed">
                        {item.summary}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                         {Object.entries(item.agentVotes || {}).map(([agent, info]) => (
                           <Tooltip key={agent}>
                             <TooltipTrigger asChild>
                               <div className="px-3 py-1.5 rounded-xl bg-black border border-slate-900 flex items-center gap-2 cursor-help hover:border-slate-700 transition-colors">
                                  <ShieldCheck className="size-3 text-blue-500" />
                                  <span className="text-[8px] font-mono text-slate-500 uppercase font-bold tracking-widest">{agent.split('_')[1]}</span>
                               </div>
                             </TooltipTrigger>
                             <TooltipContent side="bottom" className="max-w-xs p-3">
                               <p className="text-[9px] font-mono uppercase leading-relaxed">{info.justification}</p>
                             </TooltipContent>
                           </Tooltip>
                         ))}
                      </div>
                    </div>
                    <div className="w-full md:w-48 shrink-0 flex flex-col justify-center space-y-4 border-l border-slate-900/50 md:pl-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-mono font-bold text-slate-600 uppercase">
                          <span>LEAN_L</span>
                          <span>LEAN_R</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden relative border border-slate-800">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-slate-500/5 to-rose-500/10" />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ left: `${((item.poliScore + 1) / 2) * 100}%` }}
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white]"
                          />
                        </div>
                        <p className="text-center text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                          SCORE: {item.poliScore.toFixed(2)}
                        </p>
                      </div>
                      {Math.abs(item.poliScore) > 0.4 && (
                        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-2">
                          <AlertTriangle className="size-3 text-amber-500" />
                          <span className="text-[8px] font-mono font-bold text-amber-500 uppercase">Polarization_Alert</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {items.length === 0 && !loading && (
              <div className="py-24 text-center border-2 border-dashed border-slate-900 rounded-4xl flex flex-col items-center gap-4">
                <Layers className="size-12 text-slate-800" />
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em] italic">Lattice_Syncing // No_Consensus_Events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
function FeedBadge({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="px-3 py-1.5 rounded-xl bg-black border border-slate-800 flex flex-col items-center min-w-[64px]">
      <span className="text-[7px] text-slate-600 uppercase font-mono font-bold tracking-widest mb-0.5">{label}</span>
      <span className={cn("text-[10px] font-black tabular-nums tracking-tighter", color)}>{value}</span>
    </div>
  );
}