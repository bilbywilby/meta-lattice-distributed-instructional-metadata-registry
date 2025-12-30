import React, { useEffect, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}
export function NodeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rawReports = useLiveQuery(() => db.reports.toArray());
  const reports = useMemo(() => rawReports ?? [], [rawReports]);
  const particles = useMemo(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      p.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
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
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = i < 10 ? '#10b981' : '#1e293b'; 
        ctx.fill();
      });
      reports.forEach((r) => {
        const x = (r.geohash.charCodeAt(0) * 137) % canvas.width;
        const y = (r.geohash.charCodeAt(1) * 173) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 6 + Math.sin(Date.now() / 200) * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [particles, reports]);
  return (
    <div className="space-y-6">
      <header className="border-l-2 border-emerald-500 pl-6 mb-8">
        <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Node_Topology</h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">LV_Mesh_Visualizer // Active_Nodes_1,244</p>
      </header>
      <div className="relative aspect-video rounded-3xl border border-slate-900 bg-[#040408] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full opacity-80" />
      </div>
    </div>
  );
}