import React, { useState } from 'react';
import { Newspaper, ChevronRight, Hash, Activity, Map, Wind, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
const INITIAL_NEWS = [
  { id: '1', source: 'The Valley Times', avatar: 'VT', time: '2h ago', category: 'Economy', title: 'Silicon Orchard Expansion Approved', content: 'New funding rounds secured for the tech corridor along Route 22, aiming for 5k new neural-interface jobs.', tags: ['TECH', 'GROWTH'] },
  { id: '2', source: 'Grid Sentinel', avatar: 'GS', time: '4h ago', category: 'Infrastructure', title: 'Backup Power Node Beta-Test', content: 'Distributed solar mesh in Bethlehem successfully sustained 40% of residential loads during the simulated outage.', tags: ['ENERGY', 'P2P'] },
  { id: '3', source: 'Loop Daily', avatar: 'LD', time: '6h ago', category: 'Social', title: 'New Civic Commons Initiative', content: 'Digital residency tokens now granting access to the physical park coworking spaces in Allentown.', tags: ['CIVIC', 'TOKEN'] },
];
export function HubModule() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const tags = ['ALL', 'ECONOMY', 'INFRASTRUCTURE', 'SOCIAL', 'SECURITY'];
  const filteredNews = activeFilter === 'ALL' 
    ? INITIAL_NEWS 
    : INITIAL_NEWS.filter(n => n.category.toUpperCase() === activeFilter);
  return (
    <div className="space-y-10 animate-fade-in">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <Newspaper className="size-6 text-blue-500" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Central_Hub</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all",
                activeFilter === tag 
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] ring-2 ring-blue-500/50" 
                  : "bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {filteredNews.map(news => (
            <div key={news.id} className="p-6 rounded-3xl bg-[#040408] border border-slate-900 group hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-400">{news.avatar}</div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{news.source}</span>
                    <span className="text-[9px] font-mono text-slate-600 uppercase">{news.time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {news.tags.map(t => (
                    <span key={t} className="text-[8px] font-mono text-blue-500 font-bold tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">#{t}</span>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{news.title}</h3>
              <p className="text-sm text-slate-400 font-mono leading-relaxed mb-6">{news.content}</p>
              <button className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 uppercase hover:text-white transition-colors">
                Read Analysis <ChevronRight className="size-3" />
              </button>
            </div>
          ))}
          {filteredNews.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-900 rounded-3xl">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">No_Reports_In_Category</p>
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2">
            <Activity className="size-3" /> Regional_Metrics
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <MetricCard icon={Wind} label="Air Quality" value="14 AQI" status="Optimal" />
            <MetricCard icon={Map} label="Traffic Flow" value="High" status="Delay Route 22" />
            <MetricCard icon={Layers} label="Grid Status" value="Stable" status="Mesh Active" isLive />
          </div>
        </aside>
      </div>
    </div>
  );
}
function MetricCard({ icon: Icon, label, value, status, isLive }: { icon: any, label: string, value: string, status: string, isLive?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-[#040408] border border-slate-900 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-slate-600" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{label}</span>
        </div>
        {isLive && (
          <div className="flex items-center gap-1">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono text-emerald-500 font-bold uppercase">Live</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold text-white tracking-tighter">{value}</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase">{status}</span>
      </div>
    </div>
  );
}