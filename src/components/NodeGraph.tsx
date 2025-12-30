import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Report } from '@shared/types';
import { cn } from '@/lib/utils';
import { Network, Globe, Radio } from 'lucide-react';
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}
export function NodeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graphMode, setGraphMode] = useState<'LOCAL' | 'GLOBAL'>('LOCAL');
  const [globalReports, setGlobalReports] = useState<Report[]>([]);
  const localReports = useLiveQuery(() => db.reports.toArray()) ?? [];
  useEffect(() => {
    if (graphMode === 'GLOBAL') {
      fetch('/api/v1/reports')
        .then(r => r.json())
        .then(res => { if (res.success) setGlobalReports(res.data); });
    }
  }, [graphMode]);
  const activeReports = graphMode === 'LOCAL' ? localReports : globalReports;
  const particles = useMemo(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      p.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
      });
    }
    return p;
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrame: number;
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background Grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      // Floating Particles
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = i % 20 === 0 ? '#334155' : '#1e293b';
        ctx.fill();
      });
      // Node Rendering
      activeReports.forEach((r) => {
        if (!r.geohash || r.geohash.length < 2) return;
        // Pseudo-deterministic position based on geohash characters
        const x = (r.geohash.charCodeAt(0) * 13.7 + r.geohash.charCodeAt(1) * 7.3) % canvas.width;
        const y = (r.geohash.charCodeAt(1) * 17.3 + r.geohash.charCodeAt(0) * 11.2) % canvas.height;
        const isLocal = r.status === 'LOCAL';
        const pulse = Math.sin(Date.now() / 400) * 4;
        ctx.beginPath();
        ctx.arc(x, y, 6 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = isLocal ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isLocal ? '#3b82f6' : '#10b981';
        ctx.fill();
        // Label
        ctx.fillStyle = '#64748b';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(r.title.slice(0, 10), x + 10, y + 4);
      });
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [particles, activeReports]);
  return (
    <div className="space-y-6">
      <header className="border-l-2 border-emerald-500 pl-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Node_Topology</h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">LV_Mesh_Visualizer // Nodes: {activeReports.length}</p>
        </div>
        <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
          <button onClick={() => setGraphMode('LOCAL')} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all", graphMode === 'LOCAL' ? "bg-blue-600 text-white" : "text-slate-500")}>
            <Radio className="size-3" /> Local
          </button>
          <button onClick={() => setGraphMode('GLOBAL')} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all", graphMode === 'GLOBAL' ? "bg-emerald-600 text-white" : "text-slate-500")}>
            <Globe className="size-3" /> Global
          </button>
        </div>
      </header>
      <div className="relative aspect-video rounded-3xl border border-slate-900 bg-[#040408] overflow-hidden group">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
           <LegendItem color="bg-blue-500" label="Local_Node" />
           <LegendItem color="bg-emerald-500" label="Regional_Registry" />
        </div>
      </div>
    </div>
  );
}
function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-800">
      <div className={cn("size-2 rounded-full", color)} />
      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}