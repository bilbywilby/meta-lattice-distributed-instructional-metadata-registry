import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Zap, X, Terminal, Send, Cpu, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addTrace } from '@/lib/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface Message {
  id: string;
  role: 'agent' | 'user';
  text: string;
  data?: { label: string; value: string }[];
}
export function VoltAgent({ isOpen, onClose, activeContext }: { isOpen: boolean; onClose: () => void, activeContext?: string }) {
  const liveTraces = useLiveQuery(() => db.volt_traces.orderBy('timestamp').reverse().limit(15).toArray());
  const traces = useMemo(() => liveTraces ?? [], [liveTraces]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'agent', text: "ORCHESTRATOR v2.0 READY. I am ValleyBot. How can I assist with regional data management today?" }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, traces]);
  const handleQuery = async () => {
    if (!input.trim() || isProcessing) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsProcessing(true);
    await addTrace(`Supervisor: Query Received [Ctx: ${activeContext || 'Global'}]`, "blue");
    setTimeout(async () => {
      await addTrace("Logic_Engine: Scanning regional knowledge vectors", "purple");
      setTimeout(async () => {
        await addTrace("Metric_Stream: Aggregating live Hub telemetry", "emerald");
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          text: `I've analyzed the ${activeContext ? activeContext.toLowerCase() : 'system'} data flows. Regional performance is within threshold parameters.`,
          data: [
            { label: "GRID_HEALTH", value: "99.8%" },
            { label: "NODES_ACTIVE", value: "1,244" },
            { label: "CONTEXT", value: activeContext || 'GLOBAL' }
          ]
        }]);
        setIsProcessing(false);
      }, 800);
    }, 600);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[70] w-full md:w-[450px] bg-[#020205] border-l border-slate-900 shadow-2xl flex flex-col"
          >
            <header className="h-20 border-b border-slate-900 flex items-center justify-between px-6 bg-[#040408]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center"><Zap className="size-6 text-white" /></div>
                  <div className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full border-4 border-[#040408] animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase italic tracking-tighter text-white">Orchestrator Online</h2>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">ValleyBot v2.0 // SSI-Core</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-600 hover:text-white transition-colors"><X className="size-5" /></button>
            </header>
            <div className="h-48 border-b border-slate-900 bg-black overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-1.5 border-b border-white/5 bg-white/5">
                <Terminal className="size-3 text-slate-500" />
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">VoltOps Trace Log</span>
              </div>
              <div className="flex-1 p-4 font-mono text-[9px] space-y-1 overflow-y-auto">
                {traces.map(t => (
                  <div key={t.id} className="flex gap-3">
                    <span className="text-slate-700">[{format(t.timestamp, 'HH:mm:ss')}]</span>
                    <span className={cn(
                      t.color === 'blue' && "text-blue-500",
                      t.color === 'emerald' && "text-emerald-500",
                      t.color === 'rose' && "text-rose-500",
                      t.color === 'amber' && "text-amber-500",
                      t.color === 'purple' && "text-purple-500"
                    )}>{t.message}</span>
                  </div>
                ))}
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#020205]">
              {messages.map(m => (
                <div key={m.id} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-xs font-mono leading-relaxed",
                    m.role === 'agent' ? "bg-slate-900 text-slate-300 border border-slate-800" : "bg-blue-600 text-white"
                  )}>
                    {m.text}
                    {m.data && (
                      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-800 pt-3">
                        {m.data.map(d => (
                          <div key={d.label} className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest">{d.label}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-1 pl-2">
                  <div className="size-1 rounded-full bg-blue-500 animate-bounce" />
                  <div className="size-1 rounded-full bg-blue-500 animate-bounce delay-75" />
                  <div className="size-1 rounded-full bg-blue-500 animate-bounce delay-150" />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-900 bg-[#040408]">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="Ask orchestrator..."
                  className="w-full h-12 bg-black border border-slate-800 rounded-xl pl-4 pr-12 text-sm font-mono text-white placeholder:text-slate-700 focus:border-blue-500/50 transition-colors"
                />
                <button
                  onClick={handleQuery}
                  disabled={!input.trim() || isProcessing}
                  className="absolute right-2 top-2 size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 disabled:opacity-30 transition-all active:scale-95"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}