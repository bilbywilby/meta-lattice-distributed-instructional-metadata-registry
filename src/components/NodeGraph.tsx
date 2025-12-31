import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Report } from '@shared/types';
import { cn } from '@/lib/utils';
import { Radio, Globe } from 'lucide-react';
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
  const localReportsRaw = useLiveQuery(() => db.reports.toArray());
  const localReports = localReportsRaw ?? [];
  useEffect(() => {
    if (graphMode === 'GLOBAL') {
      fetch('/api/v1/reports')
        .then(r => r.json())
        .then(res => { if (res.success) setGlobalReports(res.data); })
        .catch(err => console.error("Global reports fetch failed", err));
    }
  }, [graphMode]);
  const activeReports = graphMode === 'LOCAL' ? localReports : globalReports;
  const particles = useMemo(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      p.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.2 + 0.4,
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
        canvas.width = parent.clientWidth || 800;
        canvas.height = parent.clientHeight || 600;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    const getPos = (geohash: string) => {
      const w = canvas.width || 800;
      const h = canvas.height || 600;
      if (!geohash) return { x: w / 2, y: h / 2 };
      const x = (geohash.charCodeAt(0) * 17.7 + (geohash.charCodeAt(1) || 0) * 9.3) % w;
      const y = ((geohash.charCodeAt(1) || 0) * 21.3 + (geohash.charCodeAt(2) || 0) * 13.2) % h;
      return { x: isNaN(x) ? 100 : x, y: isNaN(y) ? 100 : y };
    };
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background Grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      const step = 50;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      // DAG Dependency Lines
      ctx.lineWidth = 0.5;
      activeReports.forEach(r => {
        if (r.parentUnitId) {
          const parent = activeReports.find(p => p.id === r.parentUnitId);
          if (parent) {
            const start = getPos(r.geohash);
            const end = getPos(parent.geohash);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
            ctx.stroke();
          }
        }
      });
      // Node Rendering
      activeReports.forEach((r) => {
        const { x, y } = getPos(r.geohash);
        const isLocalNode = r.status === 'LOCAL';
        const pulse = Math.sin(Date.now() / 600) * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = isLocalNode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isLocalNode ? '#3b82f6' : '#10b981';
        ctx.fill();
        if (canvas.width > 500) {
          ctx.fillStyle = '#475569';
          ctx.font = '7px JetBrains Mono';
          ctx.fillText(r.title.slice(0, 10), x + 8, y + 3);
        }
      });
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeReports]);
  return (
    <div className="space-y-6">
      <header className="border-l-2 border-emerald-500 pl-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Lattice_Topology</h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">
            DAG_Visualizer // Relationships: {activeReports.filter(r => r.parentUnitId).length}
          </p>
        </div>
        <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
          <button onClick={() => setGraphMode('LOCAL')} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all", graphMode === 'LOCAL' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300")}>
            <Radio className="size-3" /> Local
          </button>
          <button onClick={() => setGraphMode('GLOBAL')} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all", graphMode === 'GLOBAL' ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-300")}>
            <Globe className="size-3" /> Global
          </button>
        </div>
      </header>
      <div className="relative aspect-video rounded-3xl border border-slate-900 bg-[#040408] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
           <LegendItem color="bg-blue-500" label="Observation_Node" />
           <LegendItem color="bg-emerald-500" label="Registry_Root" />
        </div>
      </div>
    </div>
  );
}
function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-800">
      <div className={cn("size-2 rounded-full", color)} />
      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}