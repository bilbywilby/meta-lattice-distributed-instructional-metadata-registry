import React, { useState } from 'react';
import {
  Newspaper,
  Users,
  Activity,
  Book,
  Zap,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AggregatorTab, Identity } from '@shared/types';
import { HubModule } from './HubModule';
import { LoopModule } from './LoopModule';
import { WikiModule } from './WikiModule';
import { IntelModule } from './IntelModule';
import { VoltAgent } from './VoltAgent';
import { cn } from '@/lib/utils';
export function AggregatorUI({ identity }: { identity: Identity }) {
  const [activeTab, setActiveTab] = useState<AggregatorTab>(AggregatorTab.HUB);
  const [isVoltOpen, setIsVoltOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const tabs = [
    { id: AggregatorTab.HUB, label: 'Hub', icon: Newspaper, color: 'text-blue-500' },
    { id: AggregatorTab.LOOP, label: 'Loop', icon: Users, color: 'text-purple-500' },
    { id: AggregatorTab.INTEL, label: 'Intel', icon: Activity, color: 'text-emerald-500' },
    { id: AggregatorTab.WIKI, label: 'Wiki', icon: Book, color: 'text-slate-400' },
  ];
  return (
    <div className="flex h-screen bg-[#020205] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#040408] border-r border-slate-900 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="relative">
              <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white italic">V</div>
              <div className="absolute -top-1 -right-1 size-2.5 bg-emerald-500 rounded-full border-2 border-[#040408] animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase italic leading-none">The_Valley</h1>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">v1.1 Aggregator</span>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-2 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                )}
              >
                <tab.icon className={cn("size-5", activeTab === tab.id ? tab.color : "text-slate-600 group-hover:text-slate-400")} />
                <span className="text-xs font-mono font-bold uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="ml-auto size-4 opacity-50" />}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-900 space-y-4">
            <button
              onClick={() => setIsVoltOpen(true)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-[1px] group transition-all active:scale-95"
            >
              <div className="w-full h-full bg-[#040408] rounded-xl flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors">
                <Zap className="size-4 text-blue-400 group-hover:text-white" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">VoltBot Access</span>
              </div>
            </button>
            <div className="flex items-center gap-3 px-2">
              <div className="size-8 rounded-full bg-slate-800 border border-slate-700" />
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-mono font-bold text-slate-300 truncate">NODE_{identity.nodeId}</span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">Status: Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-6 bg-[#040408]/80 backdrop-blur-md md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Menu className="size-6 text-slate-400" onClick={() => setIsSidebarOpen(true)} />
            <span className="text-xs font-black uppercase italic tracking-tighter">The_Valley</span>
          </div>
          <Zap className="size-6 text-blue-500" onClick={() => setIsVoltOpen(true)} />
        </header>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-5xl mx-auto p-6 md:p-10 pb-32">
            <AnimatePresence mode="wait">
              {activeTab === AggregatorTab.HUB && <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><HubModule /></motion.div>}
              {activeTab === AggregatorTab.LOOP && <motion.div key="loop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><LoopModule /></motion.div>}
              {activeTab === AggregatorTab.WIKI && <motion.div key="wiki" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><WikiModule /></motion.div>}
              {activeTab === AggregatorTab.INTEL && <motion.div key="intel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><IntelModule /></motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <VoltAgent isOpen={isVoltOpen} onClose={() => setIsVoltOpen(false)} activeContext={activeTab} />
    </div>
  );
}